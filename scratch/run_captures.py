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

pf = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/pf_audit'
out_dir = '/home/ubuntu/Desktop/PROJECTS/website/IEEE_HACKATHON_WEBSITE/scratch/final_audit_captures'
os.makedirs(out_dir, exist_ok=True)

def run_ff(w, h, out_path, url):
    cmd = [
        '/usr/bin/firefox',
        '--headless',
        '--no-remote',
        '--profile', pf,
        '--window-size', f"{w},{h}",
        '--screenshot', out_path,
        url
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=20)
        return os.path.exists(out_path) and os.path.getsize(out_path) > 0
    except Exception as e:
        print(f"Error {out_path}: {e}")
        return False

print("1. Capturing Hero across all 8 viewports...")
for w, h, name in viewports:
    out = os.path.join(out_dir, f"hero_{name}.png")
    ok = run_ff(w, h, out, "http://localhost:3000/?nointro=1")
    print(f"  Hero {name}: {'OK' if ok else 'FAIL'}")

print("\n2. Capturing Domains across desktop (1440), tablet (768), and mobile (390)...")
for w, h, name in [(1440, 900, '1440px'), (768, 1024, '768px'), (390, 844, '390px')]:
    out = os.path.join(out_dir, f"domains_{name}.png")
    ok = run_ff(w, h, out, "http://localhost:3000/?nointro=1&goto=problems")
    print(f"  Domains {name}: {'OK' if ok else 'FAIL'}")

print("\n3. Capturing Timeline Round 2 across desktop (1440) and mobile (390)...")
for w, h, name in [(1440, 900, '1440px'), (390, 844, '390px')]:
    out = os.path.join(out_dir, f"timeline_{name}.png")
    ok = run_ff(w, h, out, "http://localhost:3000/?nointro=1&goto=timeline")
    print(f"  Timeline {name}: {'OK' if ok else 'FAIL'}")

print("\n4. Capturing Registration across desktop (1440) and mobile (390)...")
for w, h, name in [(1440, 900, '1440px'), (390, 844, '390px')]:
    out = os.path.join(out_dir, f"registration_{name}.png")
    ok = run_ff(w, h, out, "http://localhost:3000/?nointro=1&goto=registration")
    print(f"  Registration {name}: {'OK' if ok else 'FAIL'}")

print("\n5. Capturing Footer marquee across desktop (1440) and mobile (390)...")
for w, h, name in [(1440, 900, '1440px'), (390, 844, '390px')]:
    out = os.path.join(out_dir, f"footer_{name}.png")
    ok = run_ff(w, h, out, "http://localhost:3000/?nointro=1&goto=closing")
    print(f"  Footer {name}: {'OK' if ok else 'FAIL'}")

print("\nDone capturing all verification views!")
