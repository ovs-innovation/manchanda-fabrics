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
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
    minimumCacheTTL: 604800,
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

  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/refund-return-policy",
        destination: "/terms-and-conditions",
        permanent: true,
      },
    ];
  },
};

// Reload webpack and i18n config (clean-reload)
module.exports = nextTranslate(nextConfig);