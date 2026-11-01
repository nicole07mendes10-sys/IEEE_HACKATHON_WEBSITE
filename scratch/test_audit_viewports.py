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
out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/test_audit_captures'
os.makedirs(out_dir, exist_ok=True)

# Test 1: Capture Hero across all 8 viewports
print("=== CAPTURING HERO VIEWPORTS ===")
for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_hero.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1"
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)
        if res.returncode == 0 and os.path.exists(out_file):
            print(f"  [OK] {name} Hero: {os.path.getsize(out_file)} bytes")
        else:
            print(f"  [FAIL] {name}: {res.stderr}")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {name}")

# Test 2: Capture Domains (5 slots) across all 8 viewports
print("\n=== CAPTURING DOMAINS VIEWPORTS ===")
for w, h, name in viewports:
    out_file = os.path.join(out_dir, f"{name}_domains.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=problems"
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)
        if res.returncode == 0 and os.path.exists(out_file):
            print(f"  [OK] {name} Domains: {os.path.getsize(out_file)} bytes")
        else:
            print(f"  [FAIL] {name}: {res.stderr}")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {name}")

# Test 3: Capture Registration & Downloads across key viewports
print("\n=== CAPTURING REGISTRATION & DOWNLOADS VIEWPORTS ===")
for w, h, name in [(390, 844, '390px'), (768, 1024, '768px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_registration.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=registration"
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)
        if res.returncode == 0 and os.path.exists(out_file):
            print(f"  [OK] {name} Registration: {os.path.getsize(out_file)} bytes")
        else:
            print(f"  [FAIL] {name}: {res.stderr}")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {name}")

# Test 4: Capture Footer across key viewports
print("\n=== CAPTURING FOOTER VIEWPORTS ===")
for w, h, name in [(390, 844, '390px'), (768, 1024, '768px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_footer.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=closing"
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)
        if res.returncode == 0 and os.path.exists(out_file):
            print(f"  [OK] {name} Footer: {os.path.getsize(out_file)} bytes")
        else:
            print(f"  [FAIL] {name}: {res.stderr}")
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {name}")
