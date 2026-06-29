const fs = require("fs");
const path = require("path");

const rasaFiles = [
    "c:\\Users\\drist\\manchanda\\frontend\\src\\utils\\storeCustomizationSetting.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\utils\\profileAuth.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\utils\\deliveryTime.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\utils\\data.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\_offline.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\_app.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\women.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\user\\track-order.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\trending.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\product\\[slug].js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\new-arrivals.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\men.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\contact-us.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\auth\\login.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\pages\\404.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\layout\\footer\\MobileFooter.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\hooks\\useNotification.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\hooks\\useCheckoutSubmit.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\testimonial\\TestimonialsSection.jsx",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\product\\ProductCard.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\order\\OrderTracking.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\invoice\\InvoiceForDownload.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\invoice\\Invoice.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\location\\LocationAutoRequest.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\category\\Category.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\category\\FeatureCategory.js",
    "c:\\Users\\drist\\manchanda\\frontend\\src\\components\\carousel\\SliderCarousel.js",
    "c:\\Users\\drist\\manchanda\\frontend\\public\\manifest.json",
    "c:\\Users\\drist\\manchanda\\frontend\\public\\firebase-messaging-sw.js",
    "c:\\Users\\drist\\manchanda\\frontend\\locales\\en\\common.json",
    "c:\\Users\\drist\\manchanda\\frontend\\locales\\de\\common.json"
];

for (const filePath of rasaFiles) {
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping (not found): ${filePath}`);
        continue;
    }

    console.log(`Processing Rasa replace: ${filePath}`);
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Replacements
    content = content.replace(/RASA STORE/gi, "Manchanda Fabrics");
    content = content.replace(/Rasa Store/gi, "Manchanda Fabrics");
    content = content.replace(/rasastore/gi, "manchandafabrics");
    content = content.replace(/RASA/g, "Manchanda Fabrics");
    content = content.replace(/Rasa/g, "Manchanda Fabrics");
    content = content.replace(/rasaLogo.png/g, "logo.png");
    content = content.replace(/rasaLogo/g, "logo");
    
    // Specific cleanup of sneakers & streetwear strings that might be near RASA references
    content = content.replace(/premium sneakers & streetwear/gi, "premium ethnic fashion & sarees");
    content = content.replace(/sneakers, bags, brands/gi, "sarees, suits, fabrics");
    content = content.replace(/Shop Streetwear/gi, "Shop Collections");

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Updated: ${filePath}`);
    } else {
        console.log(`No changes: ${filePath}`);
    }
}

console.log("Rasa branding purge completed successfully.");
