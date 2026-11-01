import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        # Test Desktop (1440x900)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:3000/", wait_until="networkidle")
        time.sleep(1)
        
        clubs_section = page.locator("#organising-clubs")
        clubs_section.scroll_into_view_if_needed()
        time.sleep(1)
        
        # Take front face screenshot of organizing clubs section
        clubs_section.screenshot(path="scratch/club_cards_verification/clubs_section_desktop_1440_front.png")
        print("Captured desktop front")
        
        # Click on all 3 cards to flip them
        cards = page.locator(".tva-club-card")
        count = cards.count()
        print(f"Total cards found: {count}")
        
        for i in range(count):
            cards.nth(i).click()
        time.sleep(1.2) # wait for 3D flip animation (0.85s)
        
        # Take back face screenshot of organizing clubs section
        clubs_section.screenshot(path="scratch/club_cards_verification/clubs_section_desktop_1440_back.png")
        print("Captured desktop back")
        
        # Test clicking card 0 again to flip back to front
        cards.nth(0).click()
        time.sleep(1.2)
        clubs_section.screenshot(path="scratch/club_cards_verification/clubs_section_desktop_1440_flip_toggle.png")
        print("Captured desktop flip toggle")
        page.close()
        
        # Test Tablet (768x1024)
        page = browser.new_page(viewport={"width": 768, "height": 1024})
        page.goto("http://localhost:3000/", wait_until="networkidle")
        time.sleep(1)
        clubs_section = page.locator("#organising-clubs")
        clubs_section.scroll_into_view_if_needed()
        time.sleep(1)
        clubs_section.screenshot(path="scratch/club_cards_verification/clubs_section_tablet_768_front.png")
        print("Captured tablet front")
        page.close()
        
        # Test Mobile (390x844)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto("http://localhost:3000/", wait_until="networkidle")
        time.sleep(1)
        clubs_section = page.locator("#organising-clubs")
        clubs_section.scroll_into_view_if_needed()
        time.sleep(1)
        clubs_section.screenshot(path="scratch/club_cards_verification/clubs_section_mobile_390_front.png")
        print("Captured mobile front")
        
        # Tap on the first card on mobile
        page.locator(".tva-club-card").nth(0).click()
        time.sleep(1.2)
        clubs_section.screenshot(path="scratch/club_cards_verification/clubs_section_mobile_390_card1_flipped.png")
        print("Captured mobile card 1 flipped")
        page.close()
        
        browser.close()

if __name__ == "__main__":
    run()
