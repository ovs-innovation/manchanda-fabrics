/**
 * Fashion & ethnic wear auto-translation helper for Manchanda Fabrics.
 * Automatically translates product titles, fabrics, colors, styles, and patterns to Hindi.
 */

export const FASHION_DICTIONARY_HI = {
  // Phrases with Dupatta / Motifs / Work (longest phrases first)
  "with Designer Dupatta": "डिज़ाइनर दुपट्टे के साथ",
  "with Mirror Work Dupatta": "मिरर वर्क दुपट्टे के साथ",
  "with Embroidered Dupatta": "कढ़ाई वाले दुपट्टे के साथ",
  "with Bandhani Dupatta": "बांधनी दुपट्टे के साथ",
  "with Floral Motifs": "फ्लोरल मोटिफ्स के साथ",
  "with Mirror Work": "मिरर वर्क के साथ",
  "with Dupatta": "दुपट्टे के साथ",
  "with Pant": "पैंट के साथ",
  "with Plazo": "प्लाज़ो के साथ",
  "with Sharara": "शरारा के साथ",
  "Suit Set": "सूट सेट",
  "Suits": "सूट",
  "Suit": "सूट",
  "Sarees": "साड़ियां",
  "Saree": "साड़ी",
  "Kurta Set": "कुर्ता सेट",
  "Kurta": "कुर्ता",
  "Dupatta": "दुपट्टा",

  // Fabrics & Weaves
  "Bangalori Silk Pure": "बंगालोरी सिल्क प्योर",
  "Bangalori Silk": "बंगालोरी सिल्क",
  "Gajji Silk": "गाजी सिल्क",
  "Gaji Silk": "गाजी सिल्क",
  "Glace Cotton": "ग्लेस कॉटन",
  "Batik Cotton": "बाटिक कॉटन",
  "Batik Printed": "बाटिक प्रिंटेड",
  "Batik": "बाटिक",
  "Mul Cotton": "मल कॉटन",
  "Crush Tissue": "क्रश टिशू",
  "Organza": "ऑर्गेंज़ा",
  "Georgette": "जॉर्जेट",
  "Modal": "मोडल",
  "Chanderi": "चंदेरी",
  "Tussar Silk": "टसर सिल्क",
  "Raw Silk": "रॉ सिल्क",
  "Silk": "सिल्क",
  "Cotton": "कॉटन",

  // Embellishments & Craft
  "Embroidered": "एम्ब्रॉयडर्ड",
  "Bandhani Print": "बांधनी प्रिंट",
  "Bandhani": "बांधनी",
  "Traditional Print": "ट्रेडिशनल प्रिंट",
  "Printed": "प्रिंटेड",
  "Floral": "फ्लोरल",
  "Ombre": "ओम्ब्रे",
  "Mirror Work": "मिरर वर्क",
  "Zari Work": "ज़री वर्क",
  "Handcrafted": "हस्तनिर्मित",
  "Handblock": "हैंडब्लॉक",

  // Styles & Occasions
  "Party Wear": "पार्टी वियर",
  "Pakistani Style": "पाकिस्तानी स्टाइल",
  "Luxury": "लक्ज़री",
  "Premium": "प्रीमियम",
  "Pure": "प्योर",
  "Designer": "डिज़ाइनर",
  "Ethnic": "एथनिक",
  "Festive": "उत्सव",
  "Wedding": "विवाह",
  "Bridal": "दुल्हन",

  // Colors & Shades (compound colors first)
  "Rust Orange & Ivory": "रस्ट ऑरेंज और आइवरी",
  "Rust Orange": "रस्ट ऑरेंज",
  "Wine & Black": "वाइन और ब्लैक",
  "Charcoal Black": "चारकोल ब्लैक",
  "Coffee Brown": "कॉफी ब्राउन",
  "Blush Pink": "ब्लश पिंक",
  "Hot Pink": "हॉट पिंक",
  "Rani Pink": "रानी पिंक",
  "Baby Pink": "बेबी पिंक",
  "Royal Magenta": "रॉयल मजेंटा",
  "Ruby Red": "रूबी रेड",
  "Wine Red": "वाइन रेड",
  "Mustard Yellow": "मस्टर्ड येलो",
  "Sunshine Yellow": "सनशाइन येलो",
  "Lemon Yellow": "लेमन येलो",
  "Royal Blue": "रॉयल ब्लू",
  "Sky Blue": "स्काई ब्लू",
  "Indigo Blue": "इंडिगो ब्लू",
  "Ocean Blue": "ओशन ब्लू",
  "Navy Blue": "नेवी ब्लू",
  "Royal Purple": "रॉयल पर्पल",
  "Royal Teal": "रॉयल टील",
  "Emerald Green": "एमराल्ड ग्रीन",
  "Bottle Green": "बॉटल ग्रीन",
  "Mint Green": "मिंट ग्रीन",
  "Ivory White": "आइवरी व्हाइट",
  "Off White": "ऑफ व्हाइट",
  "Lavender": "लैवेंडर",
  "Peach": "पीच",
  "Maroon": "मैरून",
  "Teal": "टील",
  "Magenta": "मजेंटा",
  "Yellow": "पीला",
  "Blue": "नीला",
  "Green": "हरा",
  "Red": "लाल",
  "Pink": "गुलाबी",
  "Black": "काला",
  "White": "सफ़ेद",
  "Purple": "बैंगनी",
  "Orange": "नारंगी",
  "Gold": "गोल्डन",
  "Silver": "सिल्वर",
  "Beige": "बेज",
  "Grey": "ग्रे",
  "Gray": "ग्रे",
};

/**
 * Translates any product title or fashion phrase to natural Hindi if locale is 'hi'.
 */
export function translateProductTitle(title, locale = "en") {
  if (!title || typeof title !== "string") return title;
  if (locale !== "hi") return title;

  let cleaned = title.replace(/\s+Slug$/i, "").trim();

  // Try exact dictionary match first
  if (FASHION_DICTIONARY_HI[cleaned]) {
    return FASHION_DICTIONARY_HI[cleaned];
  }

  // Segment / word replacement
  let translated = cleaned;
  for (const [eng, hin] of Object.entries(FASHION_DICTIONARY_HI)) {
    if (translated.includes(eng)) {
      translated = translated.split(eng).join(hin);
    }
  }

  return translated.replace(/\s+/g, " ").trim();
}
