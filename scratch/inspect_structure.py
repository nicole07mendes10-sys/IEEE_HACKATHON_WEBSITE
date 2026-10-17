import re

with open('index.html', encoding='utf-8') as f:
    html = f.read()

# Find all sections and their headings
section_tags = re.findall(r'<section\s+[^>]*id=["\']([^"\']+)["\'][^>]*>', html)
print("Sections:", section_tags)

# Find header navigation
nav_links = re.findall(r'<a\s+[^>]*class=["\'][^"\']*nav-item-link[^"\']*["\'][^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html)
print("\nNav Links:")
for href, label in nav_links:
    print(f"  {href} -> {label.strip()}")

# Inspect modals
modals = re.findall(r'id=["\']([^"\']*modal[^"\']*)["\']', html)
print("\nModals:", modals)
