import axios from "axios";
import requests from "@/services/httpService";
import { FABRIC_COLORS, findClosestFabricColor } from "@/utils/fabricColors";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Upload a single image file to Cloudinary with backend fallback.
 */
export const uploadImageFile = async (file, folder = "manchanda") => {
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

  // Attempt direct Cloudinary upload first
  if (uploadPreset && baseUrl) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);
      formData.append("public_id", public_id);

      const res = await axios.post(baseUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.secure_url || res.data?.url;
      if (url) return url;
    } catch (directErr) {
      console.warn("Direct Cloudinary upload failed, using backend fallback:", directErr?.message);
    }
  }

  // Fallback via backend endpoint
  const dataUrl = await fileToDataUrl(file);
  const backendRes = await requests.post("/customer/cloudinary-upload", {
    file: dataUrl,
    folder,
    publicId: `${folder}/${public_id}`,
  });
  return backendRes.url || backendRes.secure_url;
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
 */
export const extractDominantColorFromFile = (file) => {
  return new Promise((resolve) => {
    // 1. Check filename for direct match
    const guessed = guessColorFromFilename(file?.name);
    if (guessed) {
      return resolve(guessed);
    }

    if (!file || !(file instanceof Blob) || !file.type.startsWith("image/")) {
      return resolve(null);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        const start = Math.floor(size * 0.15);
        const end = Math.floor(size * 0.85);

        for (let y = start; y < end; y++) {
          for (let x = start; x < end; x++) {
            const idx = (y * size + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a < 128) continue;
            // Ignore near-white / studio background (r,g,b > 220 and low saturation)
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            const sat = maxVal - minVal;
            if (minVal > 220 && sat < 25) continue;
            // Ignore near-black shadows/borders
            if (maxVal < 30) continue;

            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        URL.revokeObjectURL(objectUrl);

        if (count === 0) {
          for (let i = 0; i < data.length; i += 4) {
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
          }
        }

        if (count === 0) return resolve(null);

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        const toHex = (n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
        const hex = `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`.toUpperCase();

        const closest = findClosestFabricColor(hex);
        if (closest) {
          resolve({ colorName: closest.name, colorCode: closest.hex });
        } else {
          resolve({ colorName: "", colorCode: hex });
        }
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
};

/**
 * Extract dominant fabric color from an image URL using canvas with CORS or fallback.
 */
export const extractDominantColorFromUrl = (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string") return resolve(null);
    const guessed = guessColorFromFilename(url);
    if (guessed) return resolve(guessed);

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        const start = Math.floor(size * 0.15);
        const end = Math.floor(size * 0.85);

        for (let y = start; y < end; y++) {
          for (let x = start; x < end; x++) {
            const idx = (y * size + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a < 128) continue;
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            const sat = maxVal - minVal;
            if (minVal > 220 && sat < 25) continue;
            if (maxVal < 30) continue;

            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        if (count === 0) {
          for (let i = 0; i < data.length; i += 4) {
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
          }
        }

        if (count === 0) return resolve(null);

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);
        const toHex = (n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
        const hex = `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`.toUpperCase();

        const closest = findClosestFabricColor(hex);
        if (closest) {
          resolve({ colorName: closest.name, colorCode: closest.hex });
        } else {
          resolve({ colorName: "", colorCode: hex });
        }
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
};

