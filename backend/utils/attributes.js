const attributes = [
  {
    _id: "63f078f54b86ed26b05281b2",
    type: "attribute",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Color",
    },
    name: {
      en: "Color",
    },
    variants: [
      // Pinks
      { status: "show", _id: "manchanda-color-rani-pink", name: { en: "Rani Pink" }, hexColor: "#E3007E" },
      { status: "show", _id: "manchanda-color-baby-pink", name: { en: "Baby Pink" }, hexColor: "#F4C2C2" },
      { status: "show", _id: "manchanda-color-blush-pink", name: { en: "Blush Pink" }, hexColor: "#FE828C" },
      { status: "show", _id: "manchanda-color-dusty-rose", name: { en: "Dusty Rose" }, hexColor: "#DCAE96" },
      { status: "show", _id: "manchanda-color-peach-pink", name: { en: "Peach Pink" }, hexColor: "#F68B7A" },
      { status: "show", _id: "manchanda-color-hot-pink", name: { en: "Hot Pink" }, hexColor: "#FF69B4" },
      { status: "show", _id: "manchanda-color-pastel-pink", name: { en: "Pastel Pink" }, hexColor: "#FFD1DC" },
      { status: "show", _id: "manchanda-color-fuchsia-pink", name: { en: "Fuchsia Pink" }, hexColor: "#FF007F" },
      { status: "show", _id: "manchanda-color-magenta", name: { en: "Magenta" }, hexColor: "#CA1F7B" },
      { status: "show", _id: "manchanda-color-powder-pink", name: { en: "Powder Pink" }, hexColor: "#FFE4E1" },
      { status: "show", _id: "manchanda-color-coral-pink", name: { en: "Coral Pink" }, hexColor: "#F88379" },
      { status: "show", _id: "manchanda-color-onion-pink", name: { en: "Onion Pink" }, hexColor: "#C4717A" },
      { status: "show", _id: "manchanda-color-pink", name: { en: "Pink" }, hexColor: "#EC4899" },

      // Reds & Wines
      { status: "show", _id: "manchanda-color-bridal-red", name: { en: "Bridal Red" }, hexColor: "#C41E3A" },
      { status: "show", _id: "manchanda-color-sindoor-red", name: { en: "Sindoor Red" }, hexColor: "#E34234" },
      { status: "show", _id: "manchanda-color-ruby-red", name: { en: "Ruby Red" }, hexColor: "#E0115F" },
      { status: "show", _id: "manchanda-color-maroon", name: { en: "Maroon" }, hexColor: "#800000" },
      { status: "show", _id: "manchanda-color-deep-wine", name: { en: "Deep Wine" }, hexColor: "#722F37" },
      { status: "show", _id: "manchanda-color-burgundy", name: { en: "Burgundy" }, hexColor: "#800020" },
      { status: "show", _id: "manchanda-color-red", name: { en: "Red" }, hexColor: "#DC2626" },

      // Greens
      { status: "show", _id: "manchanda-color-pista-green", name: { en: "Pista Green" }, hexColor: "#93C572" },
      { status: "show", _id: "manchanda-color-mehndi-green", name: { en: "Mehndi Green" }, hexColor: "#7F8C42" },
      { status: "show", _id: "manchanda-color-bottle-green", name: { en: "Bottle Green" }, hexColor: "#004B23" },
      { status: "show", _id: "manchanda-color-sage-green", name: { en: "Sage Green" }, hexColor: "#9DC183" },
      { status: "show", _id: "manchanda-color-mint-green", name: { en: "Mint Green" }, hexColor: "#98FF98" },
      { status: "show", _id: "manchanda-color-emerald-green", name: { en: "Emerald Green" }, hexColor: "#50C878" },
      { status: "show", _id: "manchanda-color-teal-green", name: { en: "Teal Green" }, hexColor: "#00827F" },
      { status: "show", _id: "manchanda-color-green", name: { en: "Green" }, hexColor: "#16A34A" },

      // Blues
      { status: "show", _id: "manchanda-color-royal-blue", name: { en: "Royal Blue" }, hexColor: "#4169E1" },
      { status: "show", _id: "manchanda-color-navy-blue", name: { en: "Navy Blue" }, hexColor: "#000080" },
      { status: "show", _id: "manchanda-color-peacock-blue", name: { en: "Peacock Blue" }, hexColor: "#005F73" },
      { status: "show", _id: "manchanda-color-sky-blue", name: { en: "Sky Blue" }, hexColor: "#87CEEB" },
      { status: "show", _id: "manchanda-color-turquoise-blue", name: { en: "Turquoise Blue" }, hexColor: "#40E0D0" },
      { status: "show", _id: "manchanda-color-blue", name: { en: "Blue" }, hexColor: "#2563EB" },

      // Yellows & Golds
      { status: "show", _id: "manchanda-color-mustard-yellow", name: { en: "Mustard Yellow" }, hexColor: "#E1AD01" },
      { status: "show", _id: "manchanda-color-haldi-yellow", name: { en: "Haldi Yellow" }, hexColor: "#FFCC00" },
      { status: "show", _id: "manchanda-color-golden-yellow", name: { en: "Golden Yellow" }, hexColor: "#FFD700" },
      { status: "show", _id: "manchanda-color-antique-gold", name: { en: "Antique Gold" }, hexColor: "#C5A059" },
      { status: "show", _id: "manchanda-color-lemon-yellow", name: { en: "Lemon Yellow" }, hexColor: "#FFF44F" },

      // Oranges & Peaches
      { status: "show", _id: "manchanda-color-rust-orange", name: { en: "Rust Orange" }, hexColor: "#C45508" },
      { status: "show", _id: "manchanda-color-peach", name: { en: "Peach" }, hexColor: "#FFE5B4" },
      { status: "show", _id: "manchanda-color-coral", name: { en: "Coral" }, hexColor: "#FF7F50" },

      // Purples & Lavenders
      { status: "show", _id: "manchanda-color-lavender", name: { en: "Lavender" }, hexColor: "#E6E6FA" },
      { status: "show", _id: "manchanda-color-lilac", name: { en: "Lilac" }, hexColor: "#C8A2C8" },
      { status: "show", _id: "manchanda-color-mauve", name: { en: "Mauve" }, hexColor: "#E0B0FF" },
      { status: "show", _id: "manchanda-color-plum", name: { en: "Plum" }, hexColor: "#8E4585" },

      // Neutrals & Metallics
      { status: "show", _id: "manchanda-color-pure-white", name: { en: "Pure White" }, hexColor: "#FFFFFF" },
      { status: "show", _id: "manchanda-color-off-white", name: { en: "Off White" }, hexColor: "#FAF9F6" },
      { status: "show", _id: "manchanda-color-ivory", name: { en: "Ivory" }, hexColor: "#FFFFF0" },
      { status: "show", _id: "manchanda-color-cream", name: { en: "Cream" }, hexColor: "#FFFDD0" },
      { status: "show", _id: "manchanda-color-beige", name: { en: "Beige" }, hexColor: "#F5F5DC" },
      { status: "show", _id: "manchanda-color-coffee-brown", name: { en: "Coffee Brown" }, hexColor: "#4A2E18" },
      { status: "show", _id: "manchanda-color-brown", name: { en: "Brown" }, hexColor: "#92400E" },
      { status: "show", _id: "manchanda-color-charcoal-grey", name: { en: "Charcoal Grey" }, hexColor: "#36454F" },
      { status: "show", _id: "manchanda-color-grey", name: { en: "Grey" }, hexColor: "#6B7280" },
      { status: "show", _id: "manchanda-color-black", name: { en: "Black" }, hexColor: "#000000" },
    ],
    option: "Dropdown",
  },
  {
    _id: "63f078f54b86ed26b05281b6",
    type: "attribute",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Size",
    },
    name: {
      en: "Size",
    },
    variants: [
      { status: "show", _id: "manchanda-size-uk3", name: { en: "UK 3" } },
      { status: "show", _id: "manchanda-size-uk4", name: { en: "UK 4" } },
      { status: "show", _id: "manchanda-size-uk5", name: { en: "UK 5" } },
      { status: "show", _id: "manchanda-size-uk6", name: { en: "UK 6" } },
      { status: "show", _id: "manchanda-size-uk7", name: { en: "UK 7" } },
      { status: "show", _id: "manchanda-size-uk8", name: { en: "UK 8" } },
      { status: "show", _id: "manchanda-size-uk9", name: { en: "UK 9" } },
      { status: "show", _id: "manchanda-size-uk10", name: { en: "UK 10" } },
    ],
    option: "Radio",
  },
  {
    _id: "63f34946d3639309840ca336",
    type: "extra",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Gift Wrap",
    },
    name: {
      en: "Gift Wrap",
    },
    variants: [
      {
        status: "show",
        _id: "63f34946d3639309840ca337",
        name: {
          en: "Yes",
        },
      },
      {
        status: "show",
        _id: "63f34946d3639309840ca338",
        name: {
          en: "No",
        },
      },
    ],
    option: "Checkbox",
  },
  {
    _id: "63f34983d3639309840ca64a",
    type: "extra",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Package",
    },
    name: {
      en: "Package",
    },
    variants: [
      {
        status: "show",
        _id: "63f34983d3639309840ca64b",
        name: {
          en: "Plastic",
        },
      },
      {
        status: "show",
        _id: "63f34983d3639309840ca64c",
        name: {
          en: "Jar",
        },
      },
      {
        status: "show",
        _id: "63f34983d3639309840ca64d",
        name: {
          en: "Eco Friendly",
        },
      },
    ],
    option: "Checkbox",
  },
];

module.exports = attributes;
