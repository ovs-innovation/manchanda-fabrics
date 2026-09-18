import { translateProductTitle } from "./fashionTranslations";

const STORAGE_KEY_HI = "mf_ai_translations_hi";
const memoryCache = new Map();
let isInitialized = false;

// Debounced batch queue
let pendingQueue = new Set();
let debounceTimer = null;
const subscribers = new Set();

/**
 * Initialize cache from localStorage
 */
export const initAiTranslator = () => {
  if (isInitialized || typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HI);
    if (saved) {
      const parsed = JSON.parse(saved);
      let needsPersist = false;
      Object.entries(parsed).forEach(([k, v]) => {
        if (k && v) {
          if (/[a-zA-Z]/.test(v)) {
            const fixed = translateProductTitle(v, "hi");
            if (fixed && !/[a-zA-Z]/.test(fixed)) {
              memoryCache.set(`en:hi:${k}`, fixed);
              needsPersist = true;
            }
          } else {
            memoryCache.set(`en:hi:${k}`, v);
          }
        }
      });
      if (needsPersist) {
        persistCache();
      }
    }
  } catch (e) {
    console.warn("Failed to read translation cache from localStorage:", e);
  }
  isInitialized = true;
};

/**
 * Save current memory cache to localStorage
 */
const persistCache = () => {
  if (typeof window === "undefined") return;
  try {
    const obj = {};
    for (const [k, v] of memoryCache.entries()) {
      if (k.startsWith("en:hi:")) {
        obj[k.replace("en:hi:", "")] = v;
      }
    }
    localStorage.setItem(STORAGE_KEY_HI, JSON.stringify(obj));
  } catch (e) {
    console.warn("Failed to persist translation cache:", e);
  }
};

/**
 * Notify subscribers (components listening for updated translations)
 */
const notifySubscribers = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ai-translation-updated"));
  }
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch (e) {}
  });
};

/**
 * Flush the pending queue to /api/translate
 */
const flushQueue = async () => {
  if (typeof window === "undefined") return;
  const items = Array.from(pendingQueue);
  pendingQueue.clear();
  if (items.length === 0) return;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: items, from: "en", to: "hi" }),
    });

    if (res.ok) {
      const data = await res.json();
      const translations = data?.translations || {};
      let hasNew = false;

      Object.entries(translations).forEach(([orig, trans]) => {
        if (orig && trans && trans !== orig) {
          let cleanTrans = trans;
          if (/[a-zA-Z]/.test(cleanTrans)) {
            const dictClean = translateProductTitle(cleanTrans, "hi");
            if (dictClean && !/[a-zA-Z]/.test(dictClean)) {
              cleanTrans = dictClean;
            }
          }
          memoryCache.set(`en:hi:${orig}`, cleanTrans);
          hasNew = true;
        }
      });

      if (hasNew) {
        persistCache();
        notifySubscribers();
      }
    }
  } catch (err) {
    console.warn("AI translation background request failed:", err?.message);
  }
};

/**
 * Queue texts for background AI translation with NVIDIA Nemotron
 */
export const queueForAiTranslation = (text) => {
  if (typeof window === "undefined") return;
  if (!text || typeof text !== "string") return;
  const clean = text.trim();
  if (!clean || clean.length < 2) return;
  if (memoryCache.has(`en:hi:${clean}`)) {
    const cached = memoryCache.get(`en:hi:${clean}`);
    if (cached && !/[a-zA-Z]/.test(cached)) return;
  }

  pendingQueue.add(clean);
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushQueue, 150);
};

/**
 * Synchronously get translation:
 * 1. If 'en', returns original.
 * 2. If 'hi', returns cached Nemotron AI translation.
 * 3. If uncached, returns dictionary fallback and queues AI translation in background.
 */
export const getAiTranslation = (text, locale = "en") => {
  if (!text || typeof text !== "string") return text || "";
  const clean = text.trim();
  if (locale !== "hi" || !clean) return clean;

  initAiTranslator();

  const cacheKey = `en:hi:${clean}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (cached && /[a-zA-Z]/.test(cached)) {
      const fixed = translateProductTitle(cached, "hi");
      if (fixed && !/[a-zA-Z]/.test(fixed)) {
        memoryCache.set(cacheKey, fixed);
        persistCache();
        return fixed;
      }
    } else {
      return cached;
    }
  }

  // Queue for NVIDIA Nemotron AI translation in background
  queueForAiTranslation(clean);

  // Optimistic fallback to dictionary while AI translates
  const dictionaryFallback = translateProductTitle(clean, "hi");
  return dictionaryFallback || clean;
};

/**
 * Subscribe to AI translation updates (useful in React components)
 */
export const subscribeAiTranslations = (callback) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

/**
 * Explicit batch translation helper
 */
export const translateBatchWithAi = async (texts, from = "en", to = "hi") => {
  if (!Array.isArray(texts) || texts.length === 0) return {};
  initAiTranslator();

  const missing = [];
  const results = {};

  texts.forEach((txt) => {
    if (!txt) return;
    const clean = String(txt).trim();
    const key = `${from}:${to}:${clean}`;
    if (memoryCache.has(key)) {
      results[clean] = memoryCache.get(key);
    } else {
      missing.push(clean);
    }
  });

  if (missing.length === 0) return results;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: missing, from, to }),
    });

    if (res.ok) {
      const data = await res.json();
      const translations = data?.translations || {};
      Object.entries(translations).forEach(([orig, trans]) => {
        results[orig] = trans;
        memoryCache.set(`${from}:${to}:${orig}`, trans);
      });
      persistCache();
      notifySubscribers();
    }
  } catch (e) {
    console.error("translateBatchWithAi failed:", e);
  }

  return results;
};
