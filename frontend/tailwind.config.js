const colors = require("tailwindcss/colors");
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/layout/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      // Keep dynamically generated color utilities (including hover/focus variants)
      pattern:
        /^(bg|text|border)-(store|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|stone|neutral|zinc|gray|slate)-(100|200|300|400|500|600|700|800|900)$/,
      variants: ["hover", "focus", "sm", "md", "lg"],
    },
    {
      // Explicitly keep hover:bg-*-* and hover:border-*-* when built dynamically
      pattern:
        /^(hover:bg|hover:border)-(store|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|stone|neutral|zinc|gray|slate)-(100|200|300|400|500|600|700|800|900)$/,
    },
  ],

  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
      serif: ["Cormorant Garamond", "serif"],
    },
    extend: {
      colors: {
        cream: "#FFF7E6",
        ivory: "#FFFAF0",
        softWhite: "#FDFDFD",
        warmBeige: "#F5E6D3",
        goldAccent: "#B08D57",
        luxuryBg: "#FAF8F4",
        luxuryText: "#222222",
        luxurySecondary: "#666666",
        luxuryBorder: "rgba(0,0,0,0.08)",
        luxuryButton: "#592523",
        store: {
          50: "var(--store-color-50)",
          100: "var(--store-color-100)",
          200: "var(--store-color-200)",
          300: "var(--store-color-300)",
          400: "var(--store-color-400)",
          500: "var(--store-color-500)",
          600: "var(--store-color-600)",
          700: "var(--store-color-700)",
          800: "var(--store-color-800)",
          900: "var(--store-color-900)",
        },
      },
      height: {
        header: "560px",
      },
      backgroundImage: {
        "page-header": "url('/page-header-bg.jpg')",
        "contact-header": "url('/page-header-bg-2.jpg')",
        subscribe: "url('/subscribe-bg.jpg')",
        "app-download": "url('/app-download.jpg')",
        cta: "url('/cta-bg.png')",
        "cta-1": "url('/cta/cta-bg-1.png')",
        "cta-2": "url('/cta/cta-bg-2.png')",
        "cta-3": "url('/cta/cta-bg-3.png')",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
