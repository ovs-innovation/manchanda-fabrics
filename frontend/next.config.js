const runtimeCaching = require("next-pwa/cache");
const nextTranslate = require("next-translate-plugin");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  scope: "/",
  sw: "service-worker.js",
  skipWaiting: true,
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      "res.cloudinary.com",
      "i.postimg.cc",
      "img.youtube.com",
      "placehold.co",
      "images.unsplash.com",
      "localhost",
      "127.0.0.1",
    ],
  },

  i18n: {
    locales: ["en", "hi"],
    defaultLocale: "en",
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

// Reload webpack and i18n config (keySeparator: false)
module.exports = nextTranslate(nextConfig);