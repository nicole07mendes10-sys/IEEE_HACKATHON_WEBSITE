import os
import subprocess
import time

out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/recolor_verification_screenshots'
os.makedirs(out_dir, exist_ok=True)
profile_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/pf_audit'

viewports = [
    (320, 700, 'mobile_320px'),
    (390, 844, 'mobile_390px'),
    (768, 1024, 'tablet_768px'),
    (1440, 900, 'desktop_1440px')
]

print("=== CAPTURING VIEWPORTS FOR RECOLOR VERIFICATION ===")
for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_hero.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--no-remote",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1"
    ]
    print(f"Capturing {name} hero...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0 and os.path.exists(out_file):
        print(f"  OK: {os.path.basename(out_file)} ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  ERR: {res.stderr[:100]}")

# Capture specific sections on mobile (390px) and desktop (1440px)
for name, w, h in [('mobile_390px', 390, 844), ('desktop_1440px', 1440, 900)]:
    for section in ['problems', 'timeline', 'closing']:
        out_file = os.path.join(out_dir, f"{name}_{section}.png")
        cmd = [
            "/usr/bin/firefox",
            "--headless",
            "--no-remote",
            "--profile", profile_dir,
            "--window-size", f"{w},{h}",
            "--screenshot", out_file,
            f"http://localhost:3000/?nointro=1&goto={section}"
        ]
        print(f"Capturing {name} {section}...")
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and os.path.exists(out_file):
            print(f"  OK: {os.path.basename(out_file)} ({os.path.getsize(out_file)} bytes)")

print("=== CAPTURES FINISHED ===")
