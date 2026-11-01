import os
import subprocess
import time

viewports = [
    (320, 568, 'vp_320'),
    (360, 640, 'vp_360'),
    (375, 667, 'vp_375'),
    (392, 850, 'vp_392'),
    (414, 896, 'vp_414'),
    (430, 932, 'vp_430'),
    (768, 1024, 'vp_768_tablet'),
    (1366, 768, 'vp_1366_desktop')
]

profile_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/ff_profile'
out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/test_viewports'
os.makedirs(out_dir, exist_ok=True)

for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_home.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1"
    ]
    print(f"Capturing {w}x{h} -> {name}_home.png")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error for {name}: {res.stderr}")
    else:
        print(f"Success: {out_file} (size: {os.path.getsize(out_file)} bytes)")

print("All viewports captured!")
