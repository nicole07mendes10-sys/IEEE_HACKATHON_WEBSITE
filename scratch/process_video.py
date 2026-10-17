import cv2
import subprocess
import numpy as np
import os
import sys

ffmpeg_path = r'C:\ProgramData\tools\ffmpeg\bin\ffmpeg.exe'
input_video = 'videos/miss_minutes.mp4'
output_video = 'videos/miss_minutes.webm'

crop_x1, crop_x2 = 380, 1460
crop_y1, crop_y2 = 0, 1080
out_w = crop_x2 - crop_x1
out_h = crop_y2 - crop_y1

print(f"Processing '{input_video}' -> '{output_video}' ({out_w}x{out_h})...")

cmd = [
    ffmpeg_path, '-y',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', f'{out_w}x{out_h}',
    '-r', '30',
    '-i', '-',
    '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuva420p',
    '-row-mt', '1',
    '-threads', '8',
    '-cpu-used', '4',
    '-deadline', 'realtime',
    '-b:v', '0',
    '-crf', '28',
    output_video
]

proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
cap = cv2.VideoCapture(input_video)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

frame_idx = 0
ellipse_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))

while True:
    ret, frame = cap.read()
    if not ret:
        break
        
    # Pre-crop to 1080x1080 to double processing speed
    cropped = frame[crop_y1:crop_y2, crop_x1:crop_x2]
    h, w = cropped.shape[:2]
    
    b = cropped[:,:,0].astype(int)
    g = cropped[:,:,1].astype(int)
    r = cropped[:,:,2].astype(int)
    diff = np.max(255 - cropped, axis=2)
    
    # Candidate background: white or green fringe
    cand_bg = (diff < 6) | ((g > 215) & (g > r + 3) & (g > b + 3))
    
    # Connected components from border
    num_labels, labels = cv2.connectedComponents(cand_bg.astype(np.uint8))
    border_mask = np.zeros((h, w), dtype=bool)
    border_mask[0, :] = border_mask[-1, :] = border_mask[:, 0] = border_mask[:, -1] = True
    border_labels = np.unique(labels[border_mask])
    border_labels = border_labels[border_labels != 0]
    
    is_external_bg = np.isin(labels, border_labels)
    char_mask = (~is_external_bg).astype(np.uint8)
    
    # Keep only the main character component (filters all disconnected floating noise)
    num_l, l, stats, _ = cv2.connectedComponentsWithStats(char_mask)
    if num_l > 1:
        main_label = np.argmax(stats[1:, cv2.CC_STAT_AREA]) + 1
        char_mask = (l == main_label).astype(np.uint8)
        
    # Dilate 3px to capture anti-aliasing zone
    dilated = cv2.dilate(char_mask, ellipse_k)
    
    alpha = np.zeros((h, w), dtype=np.float32)
    alpha[char_mask == 1] = 1.0
    
    edge_zone = (dilated == 1) & (char_mask == 0)
    edge_alpha = np.clip((diff.astype(np.float32) - 2.0) / 13.0, 0.0, 1.0)
    alpha[edge_zone] = edge_alpha[edge_zone]
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0.7)
    alpha = np.clip(alpha, 0.0, 1.0)
    
    # Green spill suppression on character
    excess_green = np.maximum(0.0, g - np.maximum(r, b))
    g_clean = g - excess_green * 0.85
    
    # Un-premultiply white background
    unmix_mask = (alpha > 0.05) & (alpha < 0.99)
    a_safe = np.maximum(alpha, 0.05)
    
    r_unmix = np.clip((r - (1.0 - a_safe) * 255.0) / a_safe, 0.0, 255.0)
    g_unmix = np.clip((g_clean - (1.0 - a_safe) * 255.0) / a_safe, 0.0, 255.0)
    b_unmix = np.clip((b - (1.0 - a_safe) * 255.0) / a_safe, 0.0, 255.0)
    
    r_final = np.where(unmix_mask, r_unmix, r)
    g_final = np.where(unmix_mask, g_unmix, g_clean)
    b_final = np.where(unmix_mask, b_unmix, b)
    
    r_final[alpha < 0.01] = 0
    g_final[alpha < 0.01] = 0
    b_final[alpha < 0.01] = 0
    
    rgba = np.dstack([
        r_final.astype(np.uint8),
        g_final.astype(np.uint8),
        b_final.astype(np.uint8),
        (alpha * 255).astype(np.uint8)
    ])
    
    proc.stdin.write(rgba.tobytes())
    frame_idx += 1
    if frame_idx % 30 == 0:
        print(f"Processed {frame_idx}/{total_frames} frames ({frame_idx/total_frames*100:.1f}%)")

cap.release()
proc.stdin.close()
proc.wait()

print(f"Finished! ffmpeg exit code: {proc.returncode}")
if os.path.exists(output_video):
    size_mb = os.path.getsize(output_video) / (1024 * 1024)
    print(f"Created {output_video} (Size: {size_mb:.2f} MB)")
