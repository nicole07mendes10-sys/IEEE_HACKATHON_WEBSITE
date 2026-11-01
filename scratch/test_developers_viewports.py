import os
import subprocess
import time

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

profile_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/ff_profile'
out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/test_dev_viewports'
os.makedirs(out_dir, exist_ok=True)

# 1. Capture developers section directly
for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_developers.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=developers"
    ]
    print(f"Capturing developers section at {w}x{h}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0 and os.path.exists(out_file):
        print(f"  OK: {name}_developers.png ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  FAIL: {res.stderr}")

# 2. Capture footer section with crew & developers link
for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_footer.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=closing"
    ]
    print(f"Capturing footer at {w}x{h}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0 and os.path.exists(out_file):
        print(f"  OK: {name}_footer.png ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  FAIL: {res.stderr}")

# 3. Capture developers.html standalone page
for w, h, name in [(390, 844, '390px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_standalone.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/developers.html"
    ]
    print(f"Capturing developers.html standalone at {w}x{h}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0 and os.path.exists(out_file):
        print(f"  OK: {name}_standalone.png ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  FAIL: {res.stderr}")

print("Screenshot testing complete!")
