import os
import re
import subprocess
import urllib.request

print("==================================================")
print("RUNNING OVERCLOCK 2027 FINAL AUDIT VERIFICATION")
print("==================================================")

# 1. Fetch HTML from localhost
url = "http://localhost:3000/?nointro=1"
req = urllib.request.urlopen(url)
html = req.read().decode('utf-8')

errors = []
successes = []

# Check 1: Introductory label removed
if "TEMPORAL PROTOCOL" in html and "EESA · ISLE · IEEE STUDENT BRANCH" in html:
    # check if it is above OVERCLOCK heading
    hero_idx = html.find('class="hero-title"')
    intro_idx = html.find('EESA · ISLE · IEEE STUDENT BRANCH, FCRIT • TEMPORAL PROTOCOL')
    if intro_idx != -1 and intro_idx < hero_idx:
        errors.append("Introductory label still exists above OVERCLOCK heading")
    else:
        successes.append("Introductory label above OVERCLOCK heading is removed")
else:
    successes.append("Introductory label above OVERCLOCK heading is removed")

# Check 2: Description exact wording
expected_desc = "Bring your engineering ideas to life through 24 hours of hands-on hardware design and prototyping."
if expected_desc in html:
    successes.append(f"Homepage description exact match: '{expected_desc}'")
else:
    errors.append("Homepage description exact wording not found")

# Check 3: Event info panel 4 items
event_info_items = ["ORGANISER", "REGISTRATION OPENS", "INITIAL PROBLEMS", "FORMAT"]
all_info = all(item in html for item in event_info_items)
if all_info:
    successes.append("All 4 homepage event information items preserved (ORGANISER, REGISTRATION OPENS, INITIAL PROBLEMS, FORMAT)")
else:
    errors.append("Missing event information item")

# Check 4: No prize badge next to Register Now
hero_end = html.find('id="about"')
hero_html = html[:hero_end]
if "hero-prize-pill" in hero_html or "₹50,000" in hero_html:
    errors.append("₹50,000 prize pool still appears in homepage hero")
else:
    successes.append("₹50,000 prize pool removed from homepage hero next to Register Now")

# Check 5: Overclock at a Glance preserved
if 'id="about"' in html and 'OVERCLOCK at a Glance' in html:
    successes.append("Overclock at a Glance section preserved (id='about', 'OVERCLOCK at a Glance')")
else:
    errors.append("Overclock at a Glance section missing")

# Check 6: Organising clubs preserved
if "EESA" in html and "ISLE" in html and "IEEE Student Branch, FCRIT" in html:
    successes.append("All 3 organising clubs (EESA, ISLE, IEEE Student Branch, FCRIT) preserved")
else:
    errors.append("Organising clubs missing")

# Check 7: Acoustic telemetry removed & replaced with clean heading
if "ACOUSTIC TELEMETRY" in html or "FIVE DOMAIN WAVE FREQUENCIES" in html or "WAVE VOICE" in html:
    errors.append("Acoustic telemetry interface still present in HTML")
else:
    successes.append("Acoustic telemetry interface completely removed")

if "EXPLORE THE SIX DOMAINS" in html and "Choose a domain and explore the engineering challenges." in html:
    successes.append("Domain heading replaced with 'EXPLORE THE SIX DOMAINS' and subtext")
else:
    errors.append("Replacement domain heading or subtext missing")

# Check 8: 6 Domain Slots & Energy, Power & Sustainability
domain_slots = re.findall(r'class="domain-slot-card[^"]*"', html)
if len(domain_slots) == 6:
    successes.append(f"All 6 Problem Domains present (found {len(domain_slots)} domain-slot-card elements)")
else:
    errors.append(f"Expected 6 domain cards, found {len(domain_slots)}")

if "Energy, Power & Sustainability" in html and "DOMAIN SLOT 06" in html:
    successes.append("Energy, Power & Sustainability (Domain Slot 06) restored")
else:
    errors.append("Energy, Power & Sustainability domain missing")

# Check 9: Prepare Your Engineering Crew preserved
if "Prepare Your Engineering Crew for OVERCLOCK 2027" in html:
    successes.append("Prepare Your Engineering Crew section preserved")
else:
    errors.append("Prepare Your Engineering Crew section missing")

# Check 10: Shortlisting section preserved
if 'id="results"' in html and "Shortlisting" in html or "SELECTION STATUS" in html:
    successes.append("Shortlisting / Selection Status section preserved")
else:
    errors.append("Shortlisting section missing")

# Check 11: Timeline Milestone Round 2 fee
if "ROUND 2" in html and "PAID — ₹1,500 + 18% GST" in html:
    successes.append("Round 2 fee displayed beside PAID in Timeline: 'ROUND 2 // PAID — ₹1,500 + 18% GST'")
else:
    errors.append("Round 2 fee not found beside PAID in Timeline")

# Check 12: Registration Protocol box does NOT have separate fee or prize pool
reg_start = html.find('id="registration"')
reg_end = html.find('id="downloads"', reg_start)
reg_html = html[reg_start:reg_end]

if "REGISTRATION FEE" in reg_html or "fee-calculation-box" in reg_html:
    errors.append("Registration section still contains fee calculation box")
else:
    successes.append("Separate oversized fee display removed from Registration section")

if "₹50,000" in reg_html or "prize-pool-card-box" in reg_html:
    errors.append("Registration section still contains ₹50,000 prize box")
else:
    successes.append("₹50,000 prize display removed from Registration Protocol box")

# Check 13: Downloads preserved
if 'id="downloads"' in html and "OVERCLOCK_2027_Participant_Guide.pdf" in html and "OVERCLOCK_2027_Rules_and_Regulations.pdf" in html:
    successes.append("Event Resources / Downloads preserved with all PDFs")
else:
    errors.append("Downloads section missing or modified incorrectly")

# Check 14: Accommodation preserved
if 'id="accommodation"' in html and "NOMINAL FEE" in html and "FIRST-COME, FIRST-SERVED" in html:
    successes.append("Accommodation section preserved (nominal fee, first-come first-served)")
else:
    errors.append("Accommodation section missing or altered")

# Check 15: Prize pool remains in Judging & Recognition
judging_start = html.find('id="judging"')
judging_end = html.find('id="sponsors"', judging_start)
judging_html = html[judging_start:judging_end]
if "₹50,000 CASH PRIZE POOL" in judging_html:
    successes.append("₹50,000 cash prize pool correctly retained in Judging & Recognition")
else:
    errors.append("₹50,000 prize pool missing from Judging & Recognition")

# Check 17: Footer marquee
if "footer-marquee-strip" in html and "footer-marquee-track" in html:
    if "OVERCLOCK 2027" in html and "ORGANIZED BY EESA" in html and "ISLE" in html and "IEEE STUDENT BRANCH, FCRIT" in html:
        successes.append("Footer continuous marquee present with exact required sequence: 'OVERCLOCK 2027 · ORGANIZED BY EESA · ISLE · IEEE STUDENT BRANCH, FCRIT'")
    else:
        errors.append("Footer marquee missing required organization sequence")
else:
    errors.append("Footer marquee strip missing")

# Check 18: Developers modal close button
dev_start = html.find('id="developers-modal-overlay"')
dev_html = html[dev_start:]
if 'id="dev-modal-close-btn"' in dev_html:
    close_btn_idx = dev_html.find('id="dev-modal-close-btn"')
    close_btn_end = dev_html.find('</button>', close_btn_idx)
    close_btn_html = dev_html[close_btn_idx:close_btn_end]
    if "CLOSE" in close_btn_html or "ESCAPE" in close_btn_html:
        errors.append("Developers modal close button still contains CLOSE or ESCAPE text")
    elif "✕" in close_btn_html or "close-icon" in close_btn_html:
        successes.append("Developers modal close button has clean cross (✕) icon and NO textual 'CLOSE'/'ESCAPE'")
    else:
        errors.append("Developers close button cross icon not found")
else:
    errors.append("Developers modal close button not found")

print("\n--- RESULTS ---")
for s in successes:
    print("  [PASS]", s)
for e in errors:
    print("  [FAIL]", e)

if errors:
    print(f"\nAUDIT FAILED with {len(errors)} error(s).")
    exit(1)
else:
    print(f"\nAUDIT PASSED: All {len(successes)} checks succeeded!")
