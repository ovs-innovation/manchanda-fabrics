const fs = require("fs");
const path = require("path");

const DIRECTORIES = [
  path.join(__dirname, "../src")
];

const REPLACEMENTS = [
  { search: /Rasa Store/gi, replace: "Manchanda Fabrics" },
  { search: /RasaStore/gi, replace: "Manchanda Fabrics" },
  { search: /rasastore\.com/gi, replace: "manchandafabrics.com" },
  { search: /AQOSU RASA PRIVATE LIMITED/g, replace: "Manchanda Fabrics Private Limited" },
  { search: /RASA Streetwear/g, replace: "Manchanda Fabrics" },
  { search: /RASA storefront/g, replace: "Manchanda Fabrics storefront" },
  { search: /RASA Product/g, replace: "Manchanda Fabrics Product" },
  { search: /www\.Rasa Store\.com/g, replace: "www.manchandafabrics.com" },
  { search: /\bRASA\b/g, replace: "Manchanda Fabrics" },
  { search: /\bRasa\b/g, replace: "Manchanda Fabrics" },
  { search: /"folder": "rasa"/g, replace: '"folder": "manchanda"' },
  { search: /'folder': 'rasa'/g, replace: "'folder': 'manchanda'" },
  { search: /folder = "rasa"/g, replace: 'folder = "manchanda"' }
];

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  for (const r of REPLACEMENTS) {
    content = content.replace(r.search, r.replace);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated Admin File: ${filePath}`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile() && (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".json") || file.endsWith(".html"))) {
      processFile(fullPath);
    }
  }
};

const run = () => {
  for (const dir of DIRECTORIES) {
    if (fs.existsSync(dir)) {
      console.log(`Walking admin directory: ${dir}`);
      walk(dir);
    }
  }
  console.log("Admin rebranding finished successfully!");
};

run();
