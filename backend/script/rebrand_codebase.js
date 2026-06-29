const fs = require("fs");
const path = require("path");

const DIRECTORIES = [
  path.join(__dirname, "../lib"),
  path.join(__dirname, "../controller"),
  path.join(__dirname, "../utils")
];

const REPLACEMENTS = [
  { search: /Rasa Store/gi, replace: "Manchanda Fabrics" },
  { search: /RasaStore/gi, replace: "Manchanda Fabrics" },
  { search: /rasastore\.com/gi, replace: "manchandafabrics.com" },
  { search: /rasaLogo\.png/g, replace: "manchandalogo.png" },
  { search: /"rasa"/g, replace: '"manchanda"' },
  { search: /'rasa'/g, replace: "'manchanda'" },
  { search: /\brasa\b/gi, replace: "manchanda" },
  { search: /\bRASA\b/g, replace: "Manchanda Fabrics" }
];

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  for (const r of REPLACEMENTS) {
    content = content.replace(r.search, r.replace);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile() && (file.endsWith(".js") || file.endsWith(".json") || file.endsWith(".hbs"))) {
      processFile(fullPath);
    }
  }
};

const run = () => {
  for (const dir of DIRECTORIES) {
    if (fs.existsSync(dir)) {
      console.log(`Walking directory: ${dir}`);
      walk(dir);
    }
  }
  console.log("Rebranding of codebase files finished successfully!");
};

run();
