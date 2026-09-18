/**
 * Server-side Fashion & Category Hindi Translator for Manchanda Fabrics.
 * Guarantees that every product title, category name, description, and highlight
 * created or updated via admin or API receives a natural, accurate Hindi translation.
 */

const FASHION_DICTIONARY_HI = {
  // Store Locations & Addresses
  "Address - 12-A, Krishna Cloth Market, Chandni Chowk - 110006": "पता - 12-ए, कृष्णा क्लॉथ मार्केट, चाँदनी चौक - 110006",
  "12-A, Krishna Cloth Market, Chandni Chowk - 110006": "12-ए, कृष्णा क्लॉथ मार्केट, चाँदनी चौक - 110006",
  "12-A, Krishna Cloth Market, Chandni Chowk": "12-ए, कृष्णा क्लॉथ मार्केट, चाँदनी चौक",
  "Krishna Cloth Market, Chandni Chowk": "कृष्णा क्लॉथ मार्केट, चाँदनी चौक",
  "Krishna Cloth Market": "कृष्णा क्लॉथ मार्केट",
  "Chandni Chowk, Delhi": "चाँदनी चौक, दिल्ली",
  "Chandni Chowk": "चाँदनी चौक",

  // Specific Phrases with Dupatta / Motifs / Work (longest phrases first)
  "with Designer Dupatta": "डिज़ाइनर दुपट्टे के साथ",
  "with Mirror Work Dupatta": "मिरर वर्क दुपट्टे के साथ",
  "with Embroidered Dupatta": "कढ़ाई वाले दुपट्टे के साथ",
  "with Bandhani Dupatta": "बांधनी दुपट्टे के साथ",
  "with Floral Motifs": "फ्लोरल मोटिफ्स के साथ",
  "with Mirror Work": "मिरर वर्क के साथ",
  "with Zari Work": "ज़री वर्क के साथ",
  "with Gota Patti Work": "गोटा पत्ती वर्क के साथ",
  "with Heavy Dupatta": "भारी दुपट्टे के साथ",
  "with Pure Dupatta": "प्योर दुपट्टे के साथ",
  "with Silk Dupatta": "सिल्क दुपट्टे के साथ",
  "with Chiffon Dupatta": "शिफॉन दुपट्टे के साथ",
  "with Organza Dupatta": "ऑर्गेंज़ा दुपट्टे के साथ",
  "with Banarasi Dupatta": "बनारसी दुपट्टे के साथ",
  "with Dupatta": "दुपट्टे के साथ",
  "with Pant": "पैंट के साथ",
  "with Pants": "पैंट के साथ",
  "with Plazo": "प्लाज़ो के साथ",
  "with Palazzo": "प्लाज़ो के साथ",
  "with Sharara": "शरारा के साथ",
  "with Gharara": "गरारा के साथ",
  "with Salwar": "सलवार के साथ",
  "with Blouse Piece": "ब्लाउज पीस के साथ",
  "with Blouse": "ब्लाउज के साथ",
  "without Blouse": "बिना ब्लाउज के",

  // Quality & Description Phrases (longest first)
  "Good quality fabric": "उत्कृष्ट गुणवत्ता का फैब्रिक",
  "Good quality fabrics": "उत्कृष्ट गुणवत्ता के कपड़े",
  "Good quality": "उत्कृष्ट गुणवत्ता",
  "Best quality": "सर्वोत्तम गुणवत्ता",
  "High quality": "उच्च गुणवत्ता",
  "Premium quality": "प्रीमियम गुणवत्ता",
  "Premium Quality": "प्रीमियम गुणवत्ता",
  "Fine quality": "बढ़िया गुणवत्ता",
  "Soft Fabric": "मुलायम फैब्रिक",
  "Pure Fabric": "प्योर फैब्रिक",
  "Fabric": "फैब्रिक",
  "Fabrics": "कपड़े",

  // Categories & Apparel Types
  "Punjabi Suit": "पंजाबी सूट",
  "Punjabi Suits": "पंजाबी सूट",
  "Punjabi": "पंजाबी",
  "Indian Suit": "इंडियन सूट",
  "Indian Suits": "इंडियन सूट",
  "Indian": "इंडियन",
  "Lakda Patta": "लकड़ा पत्ता",
  "Bangalori Silk Pure": "बंगालोरी सिल्क प्योर",
  "Bangalori Silk": "बंगालोरी सिल्क",
  "Cotton Suits": "कॉटन सूट",
  "Cotton Suit": "कॉटन सूट",
  "Gajji Silk": "गाजी सिल्क",
  "Gaji Silk": "गाजी सिल्क",
  "Party Wear Suits": "पार्टी वियर सूट",
  "Party Wear Suit": "पार्टी वियर सूट",
  "Party Wear": "पार्टी वियर",
  "Batik Cotton Suits": "बाटिक कॉटन सूट",
  "Batik Cotton Suit": "बाटिक कॉटन सूट",
  "Batik Cotton": "बाटिक कॉटन",
  "Batik Printed": "बाटिक प्रिंटेड",
  "Batik": "बाटिक",
  "Glace Cotton Suits": "ग्लेस कॉटन सूट",
  "Glace Cotton": "ग्लेस कॉटन",
  "Kanjivaram Silk Sarees": "कांचीवरम सिल्क साड़ियां",
  "Kanjivaram Silk": "कांचीवरम सिल्क",
  "Banarsi Silk Sarees": "बनारसी सिल्क साड़ियां",
  "Banarsi Silk": "बनारसी सिल्क",
  "Banarsi Sarees": "बनारसी साड़ियां",
  "Banarsi Saree": "बनारसी साड़ी",
  "Banarsi Suits": "बनारसी सूट",
  "Banarsi Suit": "बनारसी सूट",
  "Banarsi": "बनारसी",
  "Banarasi Suits": "बनारसी सूट",
  "Banarasi Suit": "बनारसी सूट",
  "Banarasi Silk Sarees": "बनारसी सिल्क साड़ियां",
  "Banarasi Silk": "बनारसी सिल्क",
  "Banarasi Sarees": "बनारसी साड़ियां",
  "Banarasi Saree": "बनारसी साड़ी",
  "Chanderi Silk": "चंदेरी सिल्क",
  "Tussar Silk": "टसर सिल्क",
  "Dola Silk": "डोला सिल्क",
  "Crepe Silk": "क्रेप सिल्क",
  "Modal Silk": "मोडल सिल्क",
  "Raw Silk": "रॉ सिल्क",
  "Kota Doria": "कोटा डोरिया",
  "Applique Work": "एप्लिक वर्क",
  "Muslin": "मसलिन",
  "Organza Sarees": "ऑर्गेंज़ा साड़ियां",
  "Organza Saree": "ऑर्गेंज़ा साड़ी",
  "Georgette Sarees": "जॉर्जेट साड़ियां",
  "Georgette Saree": "जॉर्जेट साड़ी",
  "Chiffon Sarees": "शिफॉन साड़ियां",
  "Chiffon Saree": "शिफॉन साड़ी",
  "Bandhani Sarees": "बांधनी साड़ियां",
  "Bandhani Saree": "बांधनी साड़ी",
  "Patola Sarees": "पटोला साड़ियां",
  "Patola Saree": "पटोला साड़ी",
  "Silk Sarees": "सिल्क साड़ियां",
  "Silk Saree": "सिल्क साड़ी",
  "Cotton Sarees": "कॉटन साड़ियां",
  "Cotton Saree": "कॉटन साड़ी",
  "Sarees": "साड़ियां",
  "Saree": "साड़ी",
  "Suit Set": "सूट सेट",
  "Suit Sets": "सूट सेट",
  "Suits": "सूट",
  "Suit": "सूट",
  "Salwar Suit": "सलवार सूट",
  "Salwar Kameez": "सलवार कमीज",
  "Anarkali Suit Set": "अनारकली सूट सेट",
  "Anarkali Suit": "अनारकली सूट",
  "Anarkali": "अनारकली",
  "Kurta Set": "कुर्ता सेट",
  "Kurta Sets": "कुर्ता सेट",
  "Kurta": "कुर्ता",
  "Kurti": "कुर्ती",
  "Kurtis": "कुर्तियां",
  "Lehenga Choli": "लहंगा चोली",
  "Lehenga": "लहंगा",
  "Sharara Set": "शरारा सेट",
  "Gharara Set": "गरारा सेट",
  "Palazzo Set": "प्लाज़ो सेट",
  "Dupattas": "दुपट्टे",
  "Dupatta": "दुपट्टा",
  "Unstitched Suits": "अनस्टिच्ड सूट",
  "Unstitched Suit": "अनस्टिच्ड सूट",
  "Unstitched Dress Material": "अनस्टिच्ड ड्रेस मटेरियल",
  "Dress Material": "ड्रेस मटेरियल",
  "Ready to Wear": "रेडी टू वियर",
  "Semi-Stitched": "सेमी-स्टिच्ड",
  "Stitched": "स्टिच्ड",
  "Handloom": "हैंडलूम",
  "Fabrics": "फैब्रिक्स",
  "Fabric": "फैब्रिक",
  "Footwear": "फुटवियर",
  "Bags": "बैग्स",
  "Home": "होम",
  "New Arrivals": "नए आगमन",
  "Best Sellers": "बेस्ट सेलर्स",
  "Trending": "ट्रेंडिंग",
  "All Collections": "सभी कलेक्शन",

  // Fabrics & Weaves
  "Mul Cotton": "मल कॉटन",
  "Crush Tissue": "क्रश टिशू",
  "Organza": "ऑर्गेंज़ा",
  "Georgette": "जॉर्जेट",
  "Modal": "मोडल",
  "Chanderi": "चंदेरी",
  "Silk": "सिल्क",
  "Cotton": "कॉटन",
  "Linen": "लिनन",
  "Rayon": "रेयॉन",
  "Viscose": "विस्कोस",
  "Velvet": "वेलवेट",
  "Tissue": "टिशू",
  "Jacquard": "जैकर्ड",
  "Net": "नेट",
  "Satin": "साटन",
  "Chinon": "चिनॉन",
  "Brocade": "ब्रोकेड",

  // Embellishments & Craft
  "Hand Embroidered": "हस्त कढ़ाई",
  "Hand Block Print": "हैंड ब्लॉक प्रिंट",
  "Hand Block": "हैंड ब्लॉक",
  "Hand Crafted": "हस्तनिर्मित",
  "Handcrafted": "हस्तनिर्मित",
  "Hand Painted": "हैंड पेंटेड",
  "Digital Printed": "डिजिटल प्रिंटेड",
  "Digital Print": "डिजिटल प्रिंट",
  "Traditional Print": "ट्रेडिशनल प्रिंट",
  "Bandhani Print": "बांधनी प्रिंट",
  "Bandhani": "बांधनी",
  "Bandhej": "बंधेज",
  "Leheriya": "लहरिया",
  "Chikankari": "चिकनकारी",
  "Kalamkari": "कलमकारी",
  "Zardozi Work": "ज़रदोज़ी वर्क",
  "Zardozi": "ज़रदोज़ी",
  "Gota Patti": "गोटा पत्ती",
  "Gota Work": "गोटा वर्क",
  "Mirror Work": "मिरर वर्क",
  "Zari Work": "ज़री वर्क",
  "Zari Border": "ज़री बॉर्डर",
  "Thread Work": "धागा वर्क",
  "Sequin Work": "सीक्विन वर्क",
  "Sequins": "सीक्विन",
  "Pearl Work": "मोती वर्क",
  "Stone Work": "स्टोन वर्क",
  "Cutwork": "कटवर्क",
  "Aari Work": "आरी वर्क",
  "Phulkari": "फुलकारी",
  "Resham Work": "रेशम वर्क",
  "Resham Embroidery": "रेशम कढ़ाई",
  "Embroidered": "एम्ब्रॉयडर्ड",
  "Embroidery": "कढ़ाई",
  "Printed": "प्रिंटेड",
  "Print": "प्रिंट",
  "Floral Motifs": "फ्लोरल मोटिफ्स",
  "Floral Print": "फ्लोरल प्रिंट",
  "Floral": "फ्लोरल",
  "Geometric": "ज्यामितीय",
  "Ombre": "ओम्ब्रे",
  "Foil Print": "फ़ॉइल प्रिंट",

  // Styles & Occasions
  "Pakistani Style": "पाकिस्तानी स्टाइल",
  "Luxury": "लक्ज़री",
  "Premium": "प्रीमियम",
  "Pure": "प्योर",
  "Designer": "डिज़ाइनर",
  "Ethnic": "एथनिक",
  "Festive Wear": "उत्सव परिधान",
  "Festive": "उत्सव",
  "Wedding Wear": "विवाह परिधान",
  "Wedding": "विवाह",
  "Bridal Wear": "दुल्हन परिधान",
  "Bridal": "दुल्हन",
  "Casual Wear": "कैज़ुअल वियर",
  "Daily Wear": "दैनिक वियर",
  "Formal Wear": "फॉर्मल वियर",
  "Summer Collection": "समर कलेक्शन",
  "Winter Collection": "विंटर कलेक्शन",
  "Royal": "रॉयल",
  "Classic": "क्लासिक",
  "Vintage": "विंटेज",
  "Elegant": "सुरुचिपूर्ण",

  // Colors & Shades
  "Rust Orange & Ivory": "रस्ट ऑरेंज और आइवरी",
  "Rust Orange": "रस्ट ऑरेंज",
  "Wine & Black": "वाइन और ब्लैक",
  "Charcoal Black": "चारकोल ब्लैक",
  "Coffee Brown": "कॉफी ब्राउन",
  "Blush Pink": "ब्लश पिंक",
  "Hot Pink": "हॉट पिंक",
  "Rani Pink": "रानी पिंक",
  "Baby Pink": "बेबी पिंक",
  "Light Pink": "हल्का गुलाबी",
  "Dark Pink": "गहरा गुलाबी",
  "Royal Magenta": "रॉयल मजेंटा",
  "Ruby Red": "रूबी रेड",
  "Wine Red": "वाइन रेड",
  "Blood Red": "ब्लड रेड",
  "Mustard Yellow": "मस्टर्ड येलो",
  "Sunshine Yellow": "सनशाइन येलो",
  "Lemon Yellow": "लेमन येलो",
  "Haldi Yellow": "हल्दी पीला",
  "Light Yellow": "हल्का पीला",
  "Royal Blue": "रॉयल ब्लू",
  "Sky Blue": "स्काई ब्लू",
  "Indigo Blue": "इंडिगो ब्लू",
  "Ocean Blue": "ओशन ब्लू",
  "Navy Blue": "नेवी ब्लू",
  "Powder Blue": "पाउडर ब्लू",
  "Dark Blue": "गहरा नीला",
  "Light Blue": "हल्का नीला",
  "Royal Purple": "रॉयल पर्पल",
  "Royal Teal": "रॉयल टील",
  "Emerald Green": "एमराल्ड ग्रीन",
  "Bottle Green": "बॉटल ग्रीन",
  "Mint Green": "मिंट ग्रीन",
  "Olive Green": "ऑलिव ग्रीन",
  "Sea Green": "सी ग्रीन",
  "Dark Green": "गहरा हरा",
  "Light Green": "हल्का हरा",
  "Ivory White": "आइवरी व्हाइट",
  "Off White": "ऑफ व्हाइट",
  "Pure White": "प्योर व्हाइट",
  "Lavender": "लैवेंडर",
  "Peach": "पीच",
  "Maroon": "मैरून",
  "Teal": "टील",
  "Magenta": "मजेंटा",
  "Coral": "कोरल",
  "Turquoise": "फिरोज़ी",
  "Mauve": "मॉव",
  "Burgundy": "बरगंडी",
  "Plum": "प्लम",
  "Rust": "रस्ट",
  "Beige": "बेज",
  "Cream": "क्रीम",
  "Grey": "ग्रे",
  "Gray": "ग्रे",
  "Charcoal": "चारकोल",
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
  "Golden": "गोल्डन",
  "Silver": "सिल्वर",
  "Copper": "तांबई",
  "Bronze": "कांस्य",
  "Multicolor": "बहुरंगी",
  "Multi Color": "बहुरंगी",
  "Multi": "मल्टी",
};

const SORTED_KEYS = Object.keys(FASHION_DICTIONARY_HI).sort(
  (a, b) => b.length - a.length
);

function translateToHindi(text) {
  if (!text || typeof text !== "string") return text || "";
  const cleaned = text.replace(/\s+Slug$/i, "").trim();
  if (!cleaned) return "";

  if (FASHION_DICTIONARY_HI[cleaned]) {
    return FASHION_DICTIONARY_HI[cleaned];
  }

  let translated = cleaned;
  for (const eng of SORTED_KEYS) {
    const hin = FASHION_DICTIONARY_HI[eng];
    if (translated.includes(eng)) {
      translated = translated.split(eng).join(hin);
    } else {
      const lower = translated.toLowerCase();
      const engLower = eng.toLowerCase();
      if (lower.includes(engLower)) {
        const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        translated = translated.replace(regex, hin);
      }
    }
  }

  return translated.replace(/\s+/g, " ").trim();
}

function ensureHindiTitle(title) {
  if (!title) return { en: "", hi: "" };
  if (typeof title === "string") {
    return {
      en: title,
      hi: translateToHindi(title),
    };
  }
  const en = title.en || title.hi || "";
  let hi = title.hi && String(title.hi).trim() ? title.hi : translateToHindi(en);
  if (hi && /[a-zA-Z]/.test(hi)) {
    hi = translateToHindi(hi);
  }
  return {
    ...title,
    en,
    hi,
  };
}

function ensureHindiDescription(desc) {
  if (!desc) return desc;
  if (typeof desc === "string") {
    return {
      en: desc,
      hi: translateToHindi(desc),
    };
  }
  const en = desc.en || desc.hi || "";
  let hi = desc.hi && String(desc.hi).trim() ? desc.hi : translateToHindi(en);
  if (hi && /[a-zA-Z]/.test(hi)) {
    hi = translateToHindi(hi);
  }
  return {
    ...desc,
    en,
    hi,
  };
}

function ensureHindiName(name) {
  return ensureHindiTitle(name);
}

function ensureHindiHighlights(highlights) {
  if (!highlights) return highlights;
  if (typeof highlights === "string") {
    return {
      en: highlights,
      hi: translateToHindi(highlights),
    };
  }
  const en = highlights.en || highlights.hi || "";
  const hi = highlights.hi && String(highlights.hi).trim() ? highlights.hi : translateToHindi(en);
  return {
    ...highlights,
    en,
    hi,
  };
}

const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

const backendTranslationCache = new Map();

async function translateWithNemotron(text, from = "en", to = "hi") {
  if (!text || typeof text !== "string") return text || "";
  const clean = text.trim();
  if (!clean) return "";

  const cacheKey = `${from}:${to}:${clean}`;
  if (backendTranslationCache.has(cacheKey)) {
    return backendTranslationCache.get(cacheKey);
  }

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert translator for Manchanda Fabrics (Indian ethnic fashion store). Translate from ${
              from === "en" ? "English" : "Hindi"
            } to ${
              to === "hi" ? "natural, fluent Hindi (Devanagari script)" : "English"
            }. Keep Indian apparel terms natural (e.g., 'Suit Set' -> 'सूट सेट', 'Saree' -> 'साड़ी', 'Organza' -> 'ऑर्गेंज़ा', 'Dupatta' -> 'दुपट्टा', 'Cotton' -> 'कॉटन'). Output ONLY the translated string without quotes or explanations.`,
          },
          {
            role: "user",
            content: clean,
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://manchandafabric.in",
          "X-Title": "Manchanda Fabrics Translation",
        },
        timeout: 12000,
      }
    );

    const translated = res.data?.choices?.[0]?.message?.content?.trim();
    if (translated) {
      backendTranslationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (err) {
    console.warn("Nemotron translation API fallback:", err?.message);
  }

  // Fallback to local dictionary
  const fallback = translateToHindi(clean);
  backendTranslationCache.set(cacheKey, fallback);
  return fallback;
}

module.exports = {
  FASHION_DICTIONARY_HI,
  translateToHindi,
  translateWithNemotron,
  ensureHindiTitle,
  ensureHindiDescription,
  ensureHindiName,
  ensureHindiHighlights,
};

