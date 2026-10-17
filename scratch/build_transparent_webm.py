import subprocess
import time
import cv2
import numpy as np
import imageio_ffmpeg
import os
import shutil

def main():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    input_video = 'videos/miss_minutes.mp4'
    output_video = 'videos/miss_minutes.webm'
    backup_video = 'videos/miss_minutes_broken_backup.webm'

    if not os.path.exists(backup_video) and os.path.exists(output_video):
        print(f"Backing up existing {output_video} to {backup_video}...")
        shutil.copy2(output_video, backup_video)

    cap = cv2.VideoCapture(input_video)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    print(f"Input: {input_video}, {total_frames} frames @ {fps} fps")

    target_w, target_h = 720, 720
    print(f"Target dimensions: {target_w}x{target_h} (1:1 square crop)")

    ffmpeg_cmd = [
        ffmpeg_exe,
        '-y',
        '-loglevel', 'error',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{target_w}x{target_h}',
        '-pix_fmt', 'bgra',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0',
        '-b:v', '1800k',
        '-deadline', 'realtime',
        '-cpu-used', '4',
        output_video
    ]

    print("Starting ffmpeg pipeline...", flush=True)
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))

    t0 = time.time()
    processed_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Crop to centered 1120x1080 (x: 360 to 1480)
        crop = frame[:, 360:1480]
        # Pad 20px top and 20px bottom with white to make 1120x1120
        padded = cv2.copyMakeBorder(crop, 20, 20, 0, 0, cv2.BORDER_CONSTANT, value=[255, 255, 255])
        
        # Resize to target resolution (720x720)
        img = cv2.resize(padded, (target_w, target_h), interpolation=cv2.INTER_AREA)

        # Distance from pure white
        dist = np.sqrt(np.sum((255.0 - img.astype(np.float32))**2, axis=-1))
        mask = (dist > 15).astype(np.uint8) * 255

        # Morphological closing to seal boundary around fingertips and accessories
        closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        # Find external contours and holes
        contours, hierarchy = cv2.findContours(closed, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        filled_mask = np.zeros_like(mask)

        if hierarchy is not None and len(contours) > 0:
            areas = [cv2.contourArea(c) if hierarchy[0][i][3] == -1 else 0 for i, c in enumerate(contours)]
            main_idx = int(np.argmax(areas))
            main_area = areas[main_idx]
            
            # Fill main body
            cv2.drawContours(filled_mask, [contours[main_idx]], -1, 255, thickness=cv2.FILLED)

            # Keep any large accessory or arm contour
            for idx, cont in enumerate(contours):
                if idx != main_idx and hierarchy[0][idx][3] == -1:
                    if cv2.contourArea(cont) > 0.05 * main_area:
                        cv2.drawContours(filled_mask, [cont], -1, 255, thickness=cv2.FILLED)

            # Punch out holes (specifically space between legs in the lower region)
            for idx, cont in enumerate(contours):
                if hierarchy[0][idx][3] == main_idx or hierarchy[0][idx][3] != -1:
                    area = cv2.contourArea(cont)
                    if area > 400: # Scaled for 720x720
                        M = cv2.moments(cont)
                        if M['m00'] > 0:
                            cy = M['m01'] / M['m00']
                            if cy > (target_h * 0.58): # Lower half
                                cv2.drawContours(filled_mask, [cont], -1, 0, thickness=cv2.FILLED)

        # Smooth anti-aliased edge
        smooth_alpha = cv2.GaussianBlur(filled_mask, (3, 3), 0)

        # Combine into BGRA
        bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        bgra[:, :, 3] = smooth_alpha

        proc.stdin.write(bgra.tobytes())
        processed_count += 1
        if processed_count % 30 == 0:
            print(f"Processed {processed_count}/{total_frames} frames ({processed_count/total_frames*100:.0f}%)...", flush=True)

    cap.release()
    proc.stdin.close()
    proc.wait()

    elapsed = time.time() - t0
    print(f"Completed processing {processed_count} frames in {elapsed:.2f}s ({elapsed/processed_count*1000:.1f}ms/frame)!", flush=True)
    print(f"Output video generated: {output_video} (size: {os.path.getsize(output_video)} bytes)", flush=True)

if __name__ == '__main__':
    main()
