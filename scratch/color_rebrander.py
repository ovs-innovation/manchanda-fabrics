import os
import re

replacements = [
    # Replace background colors in CSS & style blocks
    ("background-color: #050505 !important", "background-color: #FAF7F5 !important"),
    ("background-color: #050505", "background-color: #FAF7F5"),
    ("background-color: #0a0a0a !important", "background-color: #ffffff !important"),
    ("background-color: #0A0A0A !important", "background-color: #ffffff !important"),
    ("background-color: #0a0a0a", "background-color: #ffffff"),
    ("background-color: #0A0A0A", "background-color: #ffffff"),
    ("background-color: #0f0f0f !important", "background-color: #FAF7F5 !important"),
    ("background-color: #0f0f0f", "background-color: #FAF7F5"),
    ("background-color: #111111 !important", "background-color: #FAF7F5 !important"),
    ("background-color: #111111", "background-color: #FAF7F5"),
    ("background-color: #0D0D0D !important", "background-color: #ffffff !important"),
    ("background-color: #0D0D0D", "background-color: #ffffff"),
    ("background-color: #141414 !important", "background-color: #FAF7F5 !important"),
    ("background-color: #141414", "background-color: #FAF7F5"),
    ("background-color: #050505e6 !important", "background-color: #FAF7F5e6 !important"),
    ("background-color: #0a0a0ae6 !important", "background-color: #ffffffe6 !important"),
    ("background-color: #1a1a1a !important", "background-color: #FAF7F5 !important"),
    ("background-color: #1a1a1a", "background-color: #FAF7F5"),
    ("background-color: #1a1505 !important", "background-color: #FAF7F5 !important"),
    ("background-color: #1a1505", "background-color: #FAF7F5"),
    
    # Tailwind background classes
    ("bg-[#050505]", "bg-[#FAF7F5]"),
    ("bg-[#0A0A0A]", "bg-white"),
    ("bg-[#0a0a0a]", "bg-white"),
    ("bg-[#0D0D0D]", "bg-white"),
    ("bg-[#111111]", "bg-[#FAF7F5]"),
    ("bg-[#0A0A0A]/90", "bg-white/90"),
    ("bg-[#050505]/40", "bg-[#FAF7F5]/40"),
    ("bg-[#050505]/20", "bg-[#FAF7F5]/20"),
    ("bg-[#050505]/95", "bg-[#FAF7F5]/95"),
    ("bg-black/60", "bg-[#FAF7F5]/60"),
    ("bg-[#0D0D0D]", "bg-white"),
    ("bg-orange-100", "bg-[#FAF7F5]"),
    ("bg-indigo-100", "bg-[#FAF7F5]"),
    ("bg-store-50", "bg-[#FAF7F5]"),
    ("bg-store-100", "bg-[#FAF7F5]"),
    ("bg-yellow-950/40", "bg-[#FAF7F5]"),
    ("bg-[#0A0A0A]/95", "bg-white/95"),

    # Replace borders and rings
    ("border-neutral-900", "border-[#E6D1CB]/60"),
    ("border-neutral-800", "border-[#E6D1CB]/60"),
    ("border-neutral-850", "border-[#E6D1CB]/50"),
    ("ring-neutral-800", "ring-[#E6D1CB]/60"),
    ("border-gray-200", "border-[#E6D1CB]/60"),
    ("border-gray-100", "border-[#E6D1CB]/50"),
    ("divide-neutral-900", "divide-[#E6D1CB]/40"),
    ("divide-gray-100", "divide-[#E6D1CB]/40"),
    ("border: 1px solid #1f1f1f !important", "border: 1px solid #E6D1CB !important"),
    ("border: 1px solid #141414 !important", "border: 1px solid #E6D1CB !important"),
    ("border: 1px solid #1a1a1a !important", "border: 1px solid #E6D1CB !important"),
    ("border-color: #141414 !important", "border-color: #E6D1CB !important"),
    ("border-color: #1a1a1a !important", "border-color: #E6D1CB !important"),
    ("border-color: #1f1f1f !important", "border-color: #E6D1CB !important"),
    ("border-color: #262626 !important", "border-color: #E6D1CB !important"),
    ("border-color: #171717 !important", "border-color: #E6D1CB !important"),
    ("border-bottom: 1px solid #141414 !important", "border-bottom: 1px solid #E6D1CB !important"),
    ("border-top: 1px solid #141414 !important", "border-top: 1px solid #E6D1CB !important"),
    ("border: 1px solid #262626 !important", "border: 1px solid #E6D1CB !important"),
    ("border-top-color: #141414 !important", "border-top-color: #E6D1CB !important"),
    ("border: 1px solid #e2e8f0", "border: 1px solid #E6D1CB"),

    # Replace colors in CSS & style blocks (white texts to dark brown)
    ("color: #ffffff !important", "color: #3B2A25 !important"),
    ("color: #ffffff", "color: #3B2A25"),
    ("color: #d4d4d4 !important", "color: #3B2A25 !important"),
    ("color: #e5e5e5 !important", "color: #3B2A25 !important"),
    ("color: #a3a3a3 !important", "color: #3B2A25 !important"),
    ("color: #737373 !important", "color: #3B2A25 !important"),
    ("color: #ffffffe6 !important", "color: #3B2A25e6 !important"),
    ("color: #FAF7F5 !important", "color: #3B2A25 !important"),
    ("text-white", "text-[#3B2A25]"),
    ("text-neutral-400", "text-[#3B2A25]/70"),
    ("text-neutral-300", "text-[#3B2A25]/85"),
    ("text-neutral-500", "text-[#3B2A25]/60"),
    ("text-neutral-600", "text-[#3B2A25]/75"),
    ("placeholder-neutral-500", "placeholder-[#3B2A25]/40"),
    ("placeholder-neutral-600", "placeholder-[#3B2A25]/40"),
    
    # Gold highlights to our brand accent color (#9C6A5A)
    ("#D4AF37", "#9C6A5A"),
    ("#d4af37", "#9C6A5A"),
    ("text-store-600", "text-[#9C6A5A]"),
    ("bg-store-500", "bg-[#9C6A5A]"),
    ("bg-store-600", "bg-[#9C6A5A]"),
    ("hover:bg-store-600", "hover:bg-[#6F4A3D]"),
    ("hover:bg-store-500", "hover:bg-[#6F4A3D]"),
    ("hover:text-store-600", "hover:text-[#9C6A5A]"),
    ("border-store-500", "border-[#9C6A5A]"),
    ("text-store-700", "text-[#9C6A5A]"),
    
    # Old brand names and strings
    ("legacyLogo.png", "logo.png"),
    ("sneakers, bags, brands", "sarees, suits, fabrics"),
    ("Shop Streetwear", "Shop Collections"),
]

files_to_process = [
    r"c:\Users\drist\manchanda\frontend\src\components\auth\EmailLoginForm.js",
    r"c:\Users\drist\manchanda\frontend\src\components\brand\TrustedBrandsSection.js",
    r"c:\Users\drist\manchanda\frontend\src\components\category\Category.js",
    r"c:\Users\drist\manchanda\frontend\src\components\category\FilterSidebar.js",
    r"c:\Users\drist\manchanda\frontend\src\components\newsletter\NewsletterSection.js",
    r"c:\Users\drist\manchanda\frontend\src\components\preloader\AppBootShell.js",
    r"c:\Users\drist\manchanda\frontend\src\components\preloader\Loading.js",
    r"c:\Users\drist\manchanda\frontend\src\components\reviews\WriteReviewForm.js",
    r"c:\Users\drist\manchanda\frontend\src\layout\footer\MobileBottomNavigation.js",
    r"c:\Users\drist\manchanda\frontend\src\layout\footer\MobileFooter.js",
    r"c:\Users\drist\manchanda\frontend\src\layout\navbar\LowerCategoryNavbar.js",
    r"c:\Users\drist\manchanda\frontend\src\pages\product\[slug].js",
    r"c:\Users\drist\manchanda\frontend\src\pages\checkout.js",
    r"c:\Users\drist\manchanda\frontend\src\pages\contact-us.js",
    r"c:\Users\drist\manchanda\frontend\src\pages\refund-return-policy.js",
    r"c:\Users\drist\manchanda\frontend\src\pages\search.js",
    r"c:\Users\drist\manchanda\frontend\src\pages\user\notifications\index.js",
    r"c:\Users\drist\manchanda\frontend\src\components\order-card\Card.js",
    r"c:\Users\drist\manchanda\frontend\src\components\product\ProductDetailsSection.js",
    r"c:\Users\drist\manchanda\frontend\src\components\product\ProductImageGallery.js",
    r"c:\Users\drist\manchanda\frontend\src\components\trust\TrustBadges.js",
]

for file_path in files_to_process:
    if not os.path.exists(file_path):
        print(f"Skipping (not found): {file_path}")
        continue
    
    print(f"Processing: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    for target, replacement in replacements:
        content = content.replace(target, replacement)
    
    # Specific safety cleanups
    # If a button has white text but we replaced it, let's restore standard contrast for button text
    content = content.replace("bg-[#9C6A5A] text-[#3B2A25]", "bg-[#9C6A5A] text-white")
    content = content.replace("bg-[#9C6A5A] hover:bg-[#6F4A3D] text-[#3B2A25]", "bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white")
    content = content.replace("text-white font-bold bg-[#9C6A5A]", "text-white font-bold bg-[#9C6A5A]")
    
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes: {file_path}")

print("Color rebranding script completed successfully.")
