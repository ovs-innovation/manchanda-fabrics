const fs = require("fs");
const path = require("path");

const bannerFile = path.join(__dirname, "../src/components/banner/HeroBanner.js");
if (fs.existsSync(bannerFile)) {
  let content = fs.readFileSync(bannerFile, "utf8");

  // 1. Remove swiper fade effect to prevent overlapping slides
  content = content.replace('effect={"fade"}', "");
  content = content.replace('import "swiper/css/effect-fade";', "");
  content = content.replace("EffectFade,", "");

  // 2. Set Slide 1 (Gaji Silk Saree) to photo-1610030469668-93535c17b6b3 (Saree model)
  content = content.replace(
    /bgImage:\s*"https:\/\/images\.unsplash\.com\/photo-1583391733956-3750e0ff4e8b\?q=80&w=1600&auto=format&fit=crop",/g,
    'bgImage: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=1600&auto=format&fit=crop",'
  );

  // 3. Set Slide 3 (Applique Work Suits) to photo-1583391733956-3750e0ff4e8b (traditional suit wear model)
  content = content.replace(
    /bgImage:\s*"https:\/\/images\.unsplash\.com\/photo-1610030469668-93535c17b6b3\?q=80&w=1600&auto=format&fit=crop",/g,
    'bgImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop",'
  );

  // 4. Set Slide 4 (Mul Cotton / Fabrics) to photo-1606744824163-985d376605aa (Fabric weave texture)
  content = content.replace(
    /bgImage:\s*"https:\/\/images\.unsplash\.com\/photo-1544816155-12df9643f363\?q=80&w=1600&auto=format&fit=crop",/g,
    'bgImage: "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1600&auto=format&fit=crop",'
  );

  fs.writeFileSync(bannerFile, content, "utf8");
  console.log("Successfully fixed overlapping and updated banner images!");
} else {
  console.log("HeroBanner.js not found!");
}
