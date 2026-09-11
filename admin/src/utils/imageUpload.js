import axios from "axios";
import requests from "@/services/httpService";
import { FABRIC_COLORS } from "@/utils/fabricColors";

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
