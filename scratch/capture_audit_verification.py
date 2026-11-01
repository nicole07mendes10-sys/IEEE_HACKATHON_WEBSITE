import os
import subprocess
import time

out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/audit_verified_screenshots'
os.makedirs(out_dir, exist_ok=True)
profile_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/ff_profile'

viewports = [
    (320, 700, '320px'),
    (360, 740, '360px'),
    (375, 750, '375px'),
    (390, 844, '390px'),
    (430, 932, '430px'),
    (768, 1024, '768px'),
    (1024, 768, '1024px'),
    (1440, 900, '1440px')
]

# 1. Capture Full Homepage across all 8 viewports
print("=== CAPTURING ALL 8 VIEWPORTS FOR OVERCLOCK 2027 ===")
for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_page.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1"
    ]
    print(f"Capturing {name} ({w}x{h})...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0 and os.path.exists(out_file):
        print(f"  OK: {name}_page.png ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  ERR: {res.stderr[:100]}")

# 2. Capture Problem Domains (5 slots) and Footer on Desktop (1440px) and Mobile (390px)
for name, w, h in [('390px_mobile', 390, 844), ('1440px_desktop', 1440, 900)]:
    for section in ['problems', 'registration', 'downloads', 'closing']:
        out_file = os.path.join(out_dir, f"{name}_{section}.png")
        cmd = [
            "/usr/bin/firefox",
            "--headless",
            "--profile", profile_dir,
            "--window-size", f"{w},{h}",
            "--screenshot", out_file,
            f"http://localhost:3000/?nointro=1&goto={section}"
        ]
        print(f"Capturing {name} {section}...")
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and os.path.exists(out_file):
            print(f"  OK: {os.path.basename(out_file)} ({os.path.getsize(out_file)} bytes)")

print("=== VIEWPORT CAPTURE COMPLETE ===")
