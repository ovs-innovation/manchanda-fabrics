import os
from PIL import Image, ImageDraw, ImageFont

def draw_rounded_rectangle(draw, bounds, radius, outline=None, fill=None, width=1):
    draw.rounded_rectangle(bounds, radius=radius, outline=outline, fill=fill, width=width)

def create_clear_luxury_placeholder(width=600, height=800):
    # Background: Warm luxury ivory linen
    bg_color = (248, 246, 242)
    circle_bg = (239, 234, 227)
    circle_border = (226, 218, 208)
    icon_color = (156, 106, 90) # #9C6A5A Manchanda signature bronze/terracotta
    text_primary = (48, 38, 34) # Deep warm espresso - high contrast, very clear
    text_secondary = (138, 117, 109) # Refined brand accent

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    center_x = width // 2
    # Vertically center around height // 2 so it displays perfectly in both 3:4 portrait and 1:1 circle crops
    center_y = height // 2 - 20

    # 1. Soft Circular Badge
    circle_radius = 65
    draw.ellipse(
        [center_x - circle_radius, center_y - circle_radius, center_x + circle_radius, center_y + circle_radius],
        fill=circle_bg,
        outline=circle_border,
        width=2
    )

    # 2. Picture Frame Icon inside the circle (crisp and bold)
    fw, fh = 56, 42
    fx1 = center_x - fw // 2
    fy1 = center_y - fh // 2
    fx2 = center_x + fw // 2
    fy2 = center_y + fh // 2

    # Outer photo frame
    draw.rounded_rectangle([fx1, fy1, fx2, fy2], radius=6, outline=icon_color, width=3)

    # Sun / Circle in top right
    sun_x, sun_y, sun_r = fx2 - 14, fy1 + 12, 4
    draw.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], fill=icon_color)

    # Mountains in the photo frame
    # Left mountain
    m1 = [(fx1 + 6, fy2 - 4), (fx1 + 20, fy1 + 18), (fx1 + 34, fy2 - 4)]
    draw.polygon(m1, fill=icon_color)
    # Right mountain
    m2 = [(fx1 + 26, fy2 - 4), (fx1 + 38, fy1 + 12), (fx2 - 6, fy2 - 4)]
    draw.polygon(m2, fill=icon_color)

    # 3. Typography
    def get_font(names, size):
        for name in names:
            paths = [
                f"C:\\Windows\\Fonts\\{name}.ttf",
                f"C:\\Windows\\Fonts\\{name.lower()}.ttf"
            ]
            for p in paths:
                if os.path.exists(p):
                    try:
                        return ImageFont.truetype(p, size)
                    except Exception:
                        pass
        return ImageFont.load_default()

    # Clear, bold, readable fonts
    font_main = get_font(["segoeuib", "calibrib", "arialbd", "georgiab"], 22)
    font_brand = get_font(["segoeui", "calibri", "arial", "georgia"], 15)

    # Text 1: "IMAGE NOT AVAILABLE" (spaced for elegance, bold for high legibility)
    main_text = "IMAGE NOT AVAILABLE"
    bbox1 = draw.textbbox((0, 0), main_text, font=font_main)
    w1 = bbox1[2] - bbox1[0]
    draw.text((center_x - w1 // 2, center_y + circle_radius + 26), main_text, fill=text_primary, font=font_main)

    # Text 2: "MANCHANDA FABRICS"
    brand_text = "M A N C H A N D A   F A B R I C S"
    bbox2 = draw.textbbox((0, 0), brand_text, font=font_brand)
    w2 = bbox2[2] - bbox2[0]
    draw.text((center_x - w2 // 2, center_y + circle_radius + 60), brand_text, fill=text_secondary, font=font_brand)

    return img

if __name__ == "__main__":
    img = create_clear_luxury_placeholder()
    
    frontend_public = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public"))
    print(f"Target directory: {frontend_public}")
    
    p1 = os.path.join(frontend_public, "product-placeholder.png")
    p2 = os.path.join(frontend_public, "placeholder.png")
    img.save(p1, "PNG", optimize=True)
    img.save(p2, "PNG", optimize=True)
    print("Saved high-clarity product-placeholder.png and placeholder.png")

    h1 = os.path.join(frontend_public, "h1.jpeg")
    img.save(h1, "JPEG", quality=95)
    print("Overwritten h1.jpeg")

    for n in range(2, 7):
        hn = os.path.join(frontend_public, f"h{n}.jpeg")
        if os.path.exists(hn):
            img.save(hn, "JPEG", quality=95)
            
    for n in range(1, 16):
        pn = os.path.join(frontend_public, f"p{n}.jpeg")
        if os.path.exists(pn):
            img.save(pn, "JPEG", quality=95)

    print("All image files updated with high-clarity placeholder!")
