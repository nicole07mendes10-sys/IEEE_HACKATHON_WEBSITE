with open('styles.css', encoding='utf-8') as f:
    css = f.read()

import re
rules = re.findall(r'(\.[a-zA-Z0-9_\-]+(?:,\s*\.[a-zA-Z0-9_\-]+)*)\s*\{([^}]+)\}', css)

print("Key layout and grid rules in styles.css:")
for selector, body in rules:
    if any(k in body for k in ['grid-template-columns', 'display: flex', 'width:', 'margin-left:']):
        if any(cls in selector for cls in ['nav', 'hero', 'memo', 'branch', 'timeline', 'overclock', 'lab', 'sponsor', 'faq', 'modal', 'section', 'bureau']):
            print(f"{selector.strip()[:60]} -> {len(body)} chars")
