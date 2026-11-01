import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Listen to console
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))

        print("Navigating to http://localhost:3000/ ...")
        await page.goto("http://localhost:3000/?skipintro=true", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Check 1: Initial state at page top (scrollY = 0)
        scroll_y = await page.evaluate("window.scrollY")
        cards = page.locator(".tva-club-card")
        count = await cards.count()
        print(f"Cards found: {count}, ScrollY: {scroll_y}")
        assert count == 3, f"Expected 3 cards, found {count}"

        # Check initial classes and styles
        card1_classes = await cards.nth(0).get_attribute("class")
        print(f"Initial Card 1 classes: {card1_classes}")
        is_forward_init = "is-forward" in card1_classes
        print(f"Initial is-forward: {is_forward_init} (Expected: False - initially backwards)")

        card1_inner_transform = await page.evaluate("""() => {
            const inner = document.querySelector('#tva-card-eesa .tva-card__inner');
            return window.getComputedStyle(inner).transform;
        }""")
        print(f"Initial Card 1 inner computed transform: {card1_inner_transform}")

        # Check layout justification
        grid_info = await page.evaluate("""() => {
            const grid = document.querySelector('.clubs-cards-grid');
            const gridRect = grid.getBoundingClientRect();
            const cards = Array.from(document.querySelectorAll('.tva-club-card')).map(c => {
                const r = c.getBoundingClientRect();
                return { id: c.id, left: r.left, right: r.right, width: r.width, top: r.top };
            });
            const dossier = document.querySelector('#about .case-file-dossier');
            const dossierRect = dossier ? dossier.getBoundingClientRect() : null;
            return {
                gridWidth: gridRect.width,
                gridLeft: gridRect.left,
                gridRight: gridRect.right,
                dossierWidth: dossierRect ? dossierRect.width : 0,
                cards: cards,
                gap1_2: cards[1].left - cards[0].right,
                gap2_3: cards[2].left - cards[1].right
            };
        }""")
        print(f"Grid Layout: width={grid_info['gridWidth']}px, gap1_2={grid_info['gap1_2']:.1f}px, gap2_3={grid_info['gap2_3']:.1f}px")
        print(f"Cards: {grid_info['cards']}")

        # Capture initial backwards screenshot
        await page.evaluate("document.getElementById('organising-clubs').scrollIntoView({ block: 'nearest' })")
        # But wait, if we scroll into view, scroll triggers reveal!
        # Let's scroll just slightly so the top of organising clubs is out of view, or inspect orientation
        
        # Test 2: Scroll down into organising-clubs section
        print("\n--- Scrolling down to Organising Clubs ---")
        await page.evaluate("""() => {
            const sec = document.getElementById('organising-clubs');
            sec.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(1200)

        card1_classes_after = await cards.nth(0).get_attribute("class")
        card2_classes_after = await cards.nth(1).get_attribute("class")
        card3_classes_after = await cards.nth(2).get_attribute("class")
        print(f"After scroll down:")
        print(f"  Card 1: {card1_classes_after}")
        print(f"  Card 2: {card2_classes_after}")
        print(f"  Card 3: {card3_classes_after}")

        assert "is-forward" in card1_classes_after, "Card 1 should have is-forward"
        assert "is-floating" in card1_classes_after, "Card 1 should have is-floating"

        # Check floating animation style
        float_anim = await page.evaluate("""() => {
            const c = document.querySelector('#tva-card-eesa');
            return window.getComputedStyle(c).animationName;
        }""")
        print(f"Card 1 animationName: {float_anim}")

        # Capture forward floating screenshot
        await page.screenshot(path="scratch/club_cards_verification/cards_forward_floating.png")
        print("Saved cards_forward_floating.png")

        # Test 3: Scroll back up to the top (Hero)
        print("\n--- Scrolling back up to top (Hero) ---")
        await page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
        await page.wait_for_timeout(1200)

        card1_classes_top = await cards.nth(0).get_attribute("class")
        print(f"After scroll back up to top:")
        print(f"  Card 1: {card1_classes_top}")
        assert "is-forward" not in card1_classes_top, "Card 1 should NOT have is-forward after scrolling up"
        assert "is-floating" not in card1_classes_top, "Card 1 should NOT have is-floating after scrolling up"

        # Take a screenshot showing backwards state when scrolled back up
        # We can scroll to just before the threshold to view them backwards:
        await page.evaluate("""() => {
            // Scroll to just above trigger threshold so cards are visible but not triggered forward
            const sec = document.getElementById('organising-clubs');
            const rect = sec.getBoundingClientRect();
            // We want rect.top to be around window.innerHeight * 0.90
            const currentScroll = window.scrollY;
            window.scrollTo(0, currentScroll + rect.top - (window.innerHeight * 0.90));
        }""")
        await page.wait_for_timeout(800)
        await page.screenshot(path="scratch/club_cards_verification/cards_backwards_view.png")
        print("Saved cards_backwards_view.png")

        # Test 4: Scroll down again to test repeatability and click toggle
        print("\n--- Scrolling down again & Testing Manual Click Toggle ---")
        await page.evaluate("""() => {
            const sec = document.getElementById('organising-clubs');
            sec.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(1000)

        # Click Card 1 (EESA) to manually inspect reverse face
        await cards.nth(0).click()
        await page.wait_for_timeout(600)
        card1_manual = await cards.nth(0).get_attribute("class")
        print(f"After clicking Card 1: {card1_manual}")
        assert "is-user-flipped" in card1_manual, "Card 1 should have is-user-flipped after click"

        # Click again to return to front
        await cards.nth(0).click()
        await page.wait_for_timeout(600)
        card1_manual2 = await cards.nth(0).get_attribute("class")
        print(f"After second click Card 1: {card1_manual2}")
        assert "is-user-flipped" not in card1_manual2, "Card 1 should remove is-user-flipped after 2nd click"

        print("\nAll verification checks passed successfully!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
