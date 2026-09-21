import axios from "axios";
import heic2any from "heic2any";
import requests from "@/services/httpService";
import { FABRIC_COLORS, findClosestFabricColor } from "@/utils/fabricColors";

export const isHeicFile = (file) => {
  if (!file) return false;
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    /\.(heic|heif)$/i.test(name) ||
    type.includes("heic") ||
    type.includes("heif")
  );
};

export const checkIsHeic = async (file) => {
  if (!file) return false;
  if (isHeicFile(file)) return true;
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const arr = new Uint8Array(buffer);
    if (arr[4] === 0x66 && arr[5] === 0x74 && arr[6] === 0x79 && arr[7] === 0x70) {
      const brand = String.fromCharCode(arr[8], arr[9], arr[10], arr[11]).toLowerCase();
      if (["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(brand)) {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
};

export const isBrowserStandardImage = (file) => {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  if (type === "image/jpeg" || type === "image/png" || type === "image/webp" || type === "image/gif") {
    return true;
  }
  if (/\.(jpe?g|png|webp|gif)$/i.test(name)) {
    return true;
  }
  return false;
};

export const ensureBrowserCompatibleFile = async (file) => {
  if (!file) return file;
  if (isBrowserStandardImage(file)) return file;
  try {
    const isHeic = await checkIsHeic(file);
    if (isHeic) {
      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.88,
      });
      const blob = Array.isArray(result) ? result[0] : result;
      const baseName = (file.name || "suit").replace(/\.(heic|heif|bin|octetstream)$/i, "");
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    }
  } catch (err) {
    console.warn("HEIC image conversion fallback:", err);
  }
  return file;
};

const fileToDataUrl = (file) => {
  if (!file) return Promise.resolve("");
  if (typeof file === "string") return Promise.resolve(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Upload a single image file to Cloudinary with backend fallback.
 */
export const uploadImageFile = async (rawFile, folder = "manchanda") => {
  if (!rawFile) return null;
  const file = await ensureBrowserCompatibleFile(rawFile);
  const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET;
  const baseUrl = import.meta.env.VITE_APP_CLOUDINARY_URL;

  const name = (file.name || "image").replaceAll(/\s/g, "");
  const basePublicId = name.substring(0, name.lastIndexOf(".")) || "image";
  const cleanPublicId = basePublicId
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const public_id = `${cleanPublicId || "suit"}_${Date.now()}`;

  // Attempt direct Cloudinary upload first (skip if disabled or detqbiabu)
  const isCloudinaryDisabled = !baseUrl || baseUrl.includes("detqbiabu");
  if (uploadPreset && baseUrl && !isCloudinaryDisabled) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(baseUrl, formData);
      const url = res.data?.secure_url || res.data?.url;
      if (url) return url;
    } catch (directErr) {
      console.warn("Direct Cloudinary upload failed, using backend fallback:", directErr?.response?.data || directErr?.message);
    }
  }

  // Fallback via backend endpoint
  try {
    const dataUrl = await fileToDataUrl(file);
    if (!dataUrl) return null;
    const backendRes = await requests.post("/customer/cloudinary-upload", {
      file: dataUrl,
      folder,
    });
    return backendRes.url || backendRes.secure_url;
  } catch (backendErr) {
    console.error("Backend Cloudinary upload failed:", backendErr?.response?.data || backendErr?.message);
    return null;
  }
};

/**
 * Guess color from image filename (e.g. "rani-pink-suit.jpg" -> "Rani Pink")
 */
export const guessColorFromFilename = (filename) => {
  if (!filename || typeof filename !== "string") return null;
  const clean = filename.toLowerCase().replace(/[-_.]/g, " ");

  // 1. Direct match with Indian fabric colors catalog
  for (const fc of FABRIC_COLORS) {
    if (clean.includes(fc.name.toLowerCase())) {
      return { colorName: fc.name, colorCode: fc.hex };
    }
  }

  // 2. Common color keywords
  const keywords = [
    { key: "rani", colorName: "Rani Pink", colorCode: "#E3007E" },
    { key: "pink", colorName: "Baby Pink", colorCode: "#F4C2C2" },
    { key: "red", colorName: "Bridal Red", colorCode: "#C41E3A" },
    { key: "sindoor", colorName: "Sindoor Red", colorCode: "#E34234" },
    { key: "maroon", colorName: "Maroon", colorCode: "#800000" },
    { key: "wine", colorName: "Deep Wine", colorCode: "#722F37" },
    { key: "bottle green", colorName: "Bottle Green", colorCode: "#004B23" },
    { key: "pista", colorName: "Pista Green", colorCode: "#93C572" },
    { key: "mehndi", colorName: "Mehndi Green", colorCode: "#7F8C42" },
    { key: "emerald", colorName: "Emerald Green", colorCode: "#50C878" },
    { key: "green", colorName: "Bottle Green", colorCode: "#004B23" },
    { key: "royal blue", colorName: "Royal Blue", colorCode: "#4169E1" },
    { key: "navy", colorName: "Navy Blue", colorCode: "#000080" },
    { key: "peacock", colorName: "Peacock Blue", colorCode: "#005F73" },
    { key: "sky", colorName: "Sky Blue", colorCode: "#87CEEB" },
    { key: "blue", colorName: "Royal Blue", colorCode: "#4169E1" },
    { key: "mustard", colorName: "Mustard Yellow", colorCode: "#E1AD01" },
    { key: "haldi", colorName: "Haldi Yellow", colorCode: "#F4C430" },
    { key: "lemon", colorName: "Lemon Yellow", colorCode: "#FFF44F" },
    { key: "yellow", colorName: "Mustard Yellow", colorCode: "#E1AD01" },
    { key: "rust", colorName: "Rust Orange", colorCode: "#C85A17" },
    { key: "orange", colorName: "Rust Orange", colorCode: "#C85A17" },
    { key: "peach", colorName: "Peach", colorCode: "#FFE5B4" },
    { key: "lavender", colorName: "Lavender", colorCode: "#E6E6FA" },
    { key: "purple", colorName: "Royal Purple", colorCode: "#7851A9" },
    { key: "black", colorName: "Jet Black", colorCode: "#0A0A0A" },
    { key: "white", colorName: "Pure White", colorCode: "#FFFFFF" },
    { key: "off white", colorName: "Off White", colorCode: "#FAF9F6" },
    { key: "cream", colorName: "Cream", colorCode: "#FFFDD0" },
    { key: "beige", colorName: "Beige", colorCode: "#F5F5DC" },
    { key: "grey", colorName: "Silver Grey", colorCode: "#C0C0C0" },
    { key: "gray", colorName: "Silver Grey", colorCode: "#C0C0C0" },
  ];

  for (const kw of keywords) {
    if (clean.includes(kw.key)) {
      return { colorName: kw.colorName, colorCode: kw.colorCode };
    }
  }

  return null;
};

/**
 * Extract dominant fabric color from an image File using canvas pixel sampling + fabric color catalog.
/**
 * Convert RGB (0-255) to HSL:
 * h in [0, 360), s in [0, 1], l in [0, 1]
 */
const rgbToHsl = (r, g, b) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) * 60;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) * 60;
        break;
    }
  }

  return { h, s, l };
};

/**
 * Intelligent Ethnic Suit Color Classifier
 * Analyzes pixel distribution in the garment area, isolates dominant fabric color from embroidery & background
 */
export const detectGarmentColorFromImageData = (data, width, height) => {
  if (!data || data.length === 0) return null;

  // Focus on the central 70% of the image (garment body, avoids edge background)
  const startX = Math.floor(width * 0.15);
  const endX = Math.floor(width * 0.85);
  const startY = Math.floor(height * 0.15);
  const endY = Math.floor(height * 0.85);

  const buckets = {
    red: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Bridal Red", hex: "#C41E3A" },
    maroon: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Maroon", hex: "#800000" },
    wine: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Deep Wine", hex: "#722F37" },
    pink: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Rani Pink", hex: "#E3007E" },
    green: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Bottle Green", hex: "#004B23" },
    pista: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Pista Green", hex: "#93C572" },
    mehndi: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Mehndi Green", hex: "#7F8C42" },
    blue: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Royal Blue", hex: "#4169E1" },
    navy: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Navy Blue", hex: "#000080" },
    firozi: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Firozi Blue", hex: "#00A8CC" },
    yellow: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Mustard Yellow", hex: "#E1AD01" },
    orange: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Rust Orange", hex: "#C85A17" },
    peach: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Peach", hex: "#FFE5B4" },
    purple: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Royal Purple", hex: "#7851A9" },
    lavender: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Lavender", hex: "#E6E6FA" },
    brown: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Coffee Brown", hex: "#4A2E18" },
    black: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Jet Black", hex: "#0A0A0A" },
    white: { count: 0, rSum: 0, gSum: 0, bSum: 0, defaultName: "Off White", hex: "#FAF9F6" },
  };

  let totalSampled = 0;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 128) continue;
      totalSampled++;

      const { h, s, l } = rgbToHsl(r, g, b);

      // Studio White / Light Background / Silver Lace
      if (l > 0.86 && s < 0.22) {
        buckets.white.count++;
        buckets.white.rSum += r;
        buckets.white.gSum += g;
        buckets.white.bSum += b;
        continue;
      }

      // Very Dark / Shadow / Black Fabric
      if (l < 0.18) {
        buckets.black.count++;
        buckets.black.rSum += r;
        buckets.black.gSum += g;
        buckets.black.bSum += b;
        continue;
      }

      // Low Saturation Neutrals (Grey / Off-white / Dark Charcoal)
      if (s < 0.16) {
        if (l < 0.35) {
          buckets.black.count++;
          buckets.black.rSum += r;
          buckets.black.gSum += g;
          buckets.black.bSum += b;
        } else if (l > 0.72) {
          buckets.white.count++;
          buckets.white.rSum += r;
          buckets.white.gSum += g;
          buckets.white.bSum += b;
        }
        continue;
      }

      // Chromatic Fabric Pixels
      let bucketKey = null;

      if (h >= 345 || h < 14) {
        if (l < 0.28) {
          bucketKey = "maroon";
        } else if (l < 0.38 && s < 0.65) {
          bucketKey = "wine";
        } else {
          bucketKey = "red";
        }
      } else if (h >= 14 && h < 45) {
        if (l > 0.68) {
          bucketKey = "peach";
        } else if (l < 0.32 && s < 0.65) {
          bucketKey = "brown";
        } else {
          bucketKey = "orange";
        }
      } else if (h >= 45 && h < 75) {
        bucketKey = "yellow";
      } else if (h >= 75 && h < 165) {
        if (l < 0.30) {
          bucketKey = "green"; // Bottle Green
        } else if (l > 0.58) {
          bucketKey = "pista"; // Pista Green
        } else if (h < 95) {
          bucketKey = "mehndi"; // Mehndi Green
        } else {
          bucketKey = "green";
        }
      } else if (h >= 165 && h < 200) {
        bucketKey = "firozi";
      } else if (h >= 200 && h < 260) {
        if (l < 0.28) {
          bucketKey = "navy";
        } else {
          bucketKey = "blue";
        }
      } else if (h >= 260 && h < 315) {
        if (l > 0.68) {
          bucketKey = "lavender";
        } else if (l < 0.34) {
          bucketKey = "wine";
        } else {
          bucketKey = "purple";
        }
      } else if (h >= 315 && h < 345) {
        bucketKey = "pink";
      }

      if (bucketKey && buckets[bucketKey]) {
        buckets[bucketKey].count++;
        buckets[bucketKey].rSum += r;
        buckets[bucketKey].gSum += g;
        buckets[bucketKey].bSum += b;
      }
    }
  }

  const colorfulKeys = [
    "red", "maroon", "wine", "pink", "green", "pista", "mehndi",
    "blue", "navy", "firozi", "yellow", "orange", "peach", "purple", "lavender", "brown"
  ];

  let bestColorful = null;
  let maxColorfulCount = 0;
  let totalColorfulCount = 0;

  for (const key of colorfulKeys) {
    const b = buckets[key];
    totalColorfulCount += b.count;
    if (b.count > maxColorfulCount) {
      maxColorfulCount = b.count;
      bestColorful = b;
    }
  }

  // Dominant colorful fabric detected
  if (bestColorful && maxColorfulCount > 0 && (totalColorfulCount >= totalSampled * 0.06 || maxColorfulCount > buckets.black.count * 0.5)) {
    const avgR = Math.round(bestColorful.rSum / bestColorful.count);
    const avgG = Math.round(bestColorful.gSum / bestColorful.count);
    const avgB = Math.round(bestColorful.bSum / bestColorful.count);
    const toHex = (n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
    const hex = `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`.toUpperCase();

    const closest = findClosestFabricColor(hex);
    return {
      colorName: closest?.name || bestColorful.defaultName,
      colorCode: closest?.hex || bestColorful.hex,
    };
  }

  // Black / Charcoal suit
  if (buckets.black.count > buckets.white.count && buckets.black.count > 0) {
    return { colorName: "Jet Black", colorCode: "#0A0A0A" };
  }

  // White / Off-white suit
  if (buckets.white.count > 0) {
    return { colorName: "Off White", colorCode: "#FAF9F6" };
  }

  return { colorName: "Bridal Red", colorCode: "#C41E3A" };
};

/**
 * Extract dominant fabric color from an image File using fast Bitmap or Image fallback
 */
export const extractDominantColorFromFile = async (rawFile) => {
  if (!rawFile) return null;
  const file = await ensureBrowserCompatibleFile(rawFile);

  // 1. Check filename first
  const guessed = guessColorFromFilename(file.name);
  if (guessed?.colorName) return guessed;

  const targetSize = 64;

  const extractionPromise = new Promise(async (resolve) => {
    // 2. Try createImageBitmap (modern, high-speed, no DOM/ObjectURL issues)
    if (typeof window !== "undefined" && typeof window.createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, targetSize, targetSize);
          bitmap.close();
          const { data } = ctx.getImageData(0, 0, targetSize, targetSize);
          const result = detectGarmentColorFromImageData(data, targetSize, targetSize);
          if (result?.colorName) return resolve(result);
        }
      } catch (bitmapErr) {
        // Continue to Image fallback
      }
    }

    // 3. Fallback to HTML Image element with ObjectURL or DataURL
    let objectUrl = null;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // ignore
    }

    const img = new Image();
    // NOTE: NEVER set crossOrigin on blob: URLs as Chromium blocks it with CORS error!

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }
    };

    const processImg = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          cleanup();
          return resolve({ colorName: "Bridal Red", colorCode: "#C41E3A" });
        }

        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        cleanup();
        const { data } = ctx.getImageData(0, 0, targetSize, targetSize);
        const result = detectGarmentColorFromImageData(data, targetSize, targetSize);
        resolve(result || { colorName: "Bridal Red", colorCode: "#C41E3A" });
      } catch (err) {
        cleanup();
        resolve({ colorName: "Bridal Red", colorCode: "#C41E3A" });
      }
    };

    img.onload = processImg;
    img.onerror = () => {
      cleanup();
      resolve({ colorName: "Bridal Red", colorCode: "#C41E3A" });
    };

    if (objectUrl) {
      img.src = objectUrl;
    } else {
      resolve({ colorName: "Bridal Red", colorCode: "#C41E3A" });
    }
  });

  // Guarantee resolution within 1.5 seconds so it can never hang!
  return Promise.race([
    extractionPromise,
    new Promise((resolve) =>
      setTimeout(() => resolve({ colorName: "Bridal Red", colorCode: "#C41E3A" }), 1500)
    ),
  ]);
};

/**
 * Extract dominant fabric color from an image URL using canvas with CORS or fallback.
 */
export const extractDominantColorFromUrl = (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string") return resolve(null);
    const guessed = guessColorFromFilename(url);
    if (guessed?.colorName) return resolve(guessed);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const result = detectGarmentColorFromImageData(data, size, size);
        resolve(result || { colorName: "Bridal Red", colorCode: "#C41E3A" });
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
};

