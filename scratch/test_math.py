# Test mathematical curves of BureauSpatialScrollController
def get_progress(top, height, vh=900):
    total = vh + height
    return (vh - top) / total

def test_briefing_cards():
    print("Testing Briefing Cards Math:")
    height = 600
    vh = 900
    # Scroll top from vh (entering) down to -height (leaving)
    for top in range(vh, -height - 100, -150):
        p = get_progress(top, height, vh)
        print(f"\nScroll top={top}, Progress p={p:.3f}")
        for i in range(4):
            c_i = 0.36 + i * 0.08
            d = p - c_i
            f = max(0.0, 1.0 - abs(d) / 0.12)
            f_smooth = f * f * (3.0 - 2.0 * f)
            enter_t = min(1.0, max(0.0, (p - (c_i - 0.20)) / 0.20))
            exit_t = min(1.0, max(0.0, (p - c_i) / 0.25))
            base_z = -55.0 * (1.0 - enter_t) - 35.0 * exit_t
            tz = base_z + (28.0 - base_z) * f_smooth
            
            rx_init = [5.5, 6.5, 6.5, 5.5][i]
            ry_init = [-4.5, -2.0, 2.0, 4.5][i]
            rx = (rx_init * (1.0 - enter_t) - 3.0 * exit_t) * (1.0 - f_smooth)
            ry = (ry_init * (1.0 - enter_t) + (ry_init * 0.4) * exit_t) * (1.0 - f_smooth)
            scale = 0.98 + 0.05 * f_smooth
            print(f"  Card {i}: f={f_smooth:.2f}, tz={tz:.1f}px, rx={rx:.1f}deg, ry={ry:.1f}deg, scale={scale:.3f}")

test_briefing_cards()
