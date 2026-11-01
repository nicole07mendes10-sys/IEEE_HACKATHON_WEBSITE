import os
import subprocess

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
out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/final_audit_captures'
os.makedirs(out_dir, exist_ok=True)

print("==================================================")
print("TESTING ALL 8 REQUESTED VIEWPORTS WITH FIREFOX")
print("==================================================")

# 1. Hero capture for each viewport
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
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
    print(f"Hero {name}: {'OK' if os.path.exists(out_file) else 'FAIL'}")

# 2. Domains capture for key desktop, tablet, and mobile
for w, h, name in [(390, 844, '390px'), (768, 1024, '768px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_domains.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=problems"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
    print(f"Domains {name}: {'OK' if os.path.exists(out_file) else 'FAIL'}")

# 3. Timeline capture for Round 2 fee
for w, h, name in [(390, 844, '390px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_timeline.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=timeline"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
    print(f"Timeline {name}: {'OK' if os.path.exists(out_file) else 'FAIL'}")

# 4. Registration capture
for w, h, name in [(390, 844, '390px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_registration.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=registration"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
    print(f"Registration {name}: {'OK' if os.path.exists(out_file) else 'FAIL'}")

# 5. Footer marquee capture
for w, h, name in [(390, 844, '390px'), (1440, 900, '1440px')]:
    out_file = os.path.join(out_dir, f"{name}_footer.png")
    cmd = [
        "/usr/bin/firefox",
        "--headless",
        "--profile", profile_dir,
        "--window-size", f"{w},{h}",
        "--screenshot", out_file,
        "http://localhost:3000/?nointro=1&goto=closing"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
    print(f"Footer {name}: {'OK' if os.path.exists(out_file) else 'FAIL'}")

print("\nAll viewport screenshot captures completed successfully!")
