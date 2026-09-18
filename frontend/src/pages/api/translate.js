import { translateProductTitle } from "@/utils/fashionTranslations";

// Server-side in-memory translation cache to minimize API calls and latency
const serverTranslationCache = new Map();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

/**
 * Clean markdown or code block wrappers from LLM response
 */
const extractJsonArray = (text) => {
  if (!text || typeof text !== "string") return null;
  const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Attempt regex extraction of array if surrounded by text
    const match = clean.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {}
    }
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { text, texts, from = "en", to = "hi" } = req.body;

    let itemsToTranslate = [];
    if (Array.isArray(texts)) {
      itemsToTranslate = texts;
    } else if (typeof text === "string" && text.trim()) {
      itemsToTranslate = [text.trim()];
    }

    if (itemsToTranslate.length === 0) {
      return res.status(200).json({ translations: {} });
    }

    // Dedup and normalize
    const uniqueItems = Array.from(
      new Set(
        itemsToTranslate
          .filter((item) => item && typeof item === "string")
          .map((item) => item.trim())
      )
    );

    const resultMap = {};
    const pendingFromApi = [];

    // 1. Check cache first
    for (const item of uniqueItems) {
      const cacheKey = `${from}:${to}:${item}`;
      if (serverTranslationCache.has(cacheKey)) {
        resultMap[item] = serverTranslationCache.get(cacheKey);
      } else {
        pendingFromApi.push(item);
      }
    }

    // 2. Call NVIDIA Nemotron 3 Ultra via OpenRouter for uncached items
    if (pendingFromApi.length > 0 && OPENROUTER_API_KEY) {
      try {
        const systemPrompt = `You are an expert translator for Manchanda Fabrics (an Indian ethnic fashion store specializing in suits, sarees, lehengas, dupattas, and fabrics).
Translate fashion product titles, categories, materials, and descriptions from ${
          from === "en" ? "English" : "Hindi"
        } to ${
          to === "hi" ? "natural, fluent Hindi (Devanagari script)" : "English"
        }.
Every single word must be translated or transliterated into Devanagari script (e.g., 'Indian' -> 'इंडियन', 'Suit' -> 'सूट', 'Lakda Patta' -> 'लकड़ा पत्ता', 'Silk' -> 'सिल्क', 'Cotton' -> 'कॉटन').
CRITICAL: Absolutely NO Latin or English alphabet letters (A-Z, a-z) are permitted in the Hindi output.
Keep ethnic fashion terms natural (e.g., 'Suit Set' -> 'सूट सेट', 'Saree' -> 'साड़ी', 'Organza' -> 'ऑर्गेंज़ा', 'Silk' -> 'सिल्क', 'Cotton' -> 'कॉटन', 'Dupatta' -> 'दुपट्टा', 'Bandhani' -> 'बांधनी', 'Gota Patti' -> 'गोटा पत्ती').
Output ONLY a valid JSON array of strings in the exact same order as the input array. No extra text, no markdown backticks.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://manchandafabric.in",
            "X-Title": "Manchanda Fabrics AI Translation",
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: JSON.stringify(pendingFromApi) },
            ],
            max_tokens: 1500,
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          const translatedArray = extractJsonArray(content);

          if (Array.isArray(translatedArray) && translatedArray.length === pendingFromApi.length) {
            pendingFromApi.forEach((orig, idx) => {
              let trans = String(translatedArray[idx] || "").trim();
              if (trans) {
                if (to === "hi" && /[a-zA-Z]/.test(trans)) {
                  trans = translateProductTitle(trans, "hi");
                }
                resultMap[orig] = trans;
                serverTranslationCache.set(`${from}:${to}:${orig}`, trans);
              }
            });
          }
        } else {
          console.warn("OpenRouter API error:", response.status, await response.text());
        }
      } catch (apiErr) {
        console.error("Nemotron translation API error:", apiErr?.message);
      }
    }

    // 3. Fallback to dictionary for any items not yet translated
    for (const item of uniqueItems) {
      if (!resultMap[item]) {
        let fallback = translateProductTitle(item, to);
        resultMap[item] = fallback || item;
        serverTranslationCache.set(`${from}:${to}:${item}`, resultMap[item]);
      }
    }

    return res.status(200).json({
      translations: resultMap,
      model: OPENROUTER_MODEL,
      provider: "OpenRouter (NVIDIA Nemotron 3 Ultra)",
    });
  } catch (error) {
    console.error("Translation handler error:", error);
    return res.status(500).json({ message: "Translation error", error: error.message });
  }
}
