const fs = require("fs");
const path = require("path");

const DIRECTORIES = [
  path.join(__dirname, "../src")
];

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  // Replace bg-[#FAF7F5]0 with bg-[#FAF7F5] or bg-[#9C6A5A] depending on context
  // Let's replace hover:bg-[#FAF7F5]0 with hover:bg-[#FAF7F5]
  content = content.replace(/hover:bg-\[\#FAF7F5\]0/g, "hover:bg-[#FAF7F5]");
  content = content.replace(/bg-\[\#FAF7F5\]0/g, "bg-[#FAF7F5]");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Fixed invalid class in: ${filePath}`);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile() && (file.endsWith(".js") || file.endsWith(".jsx"))) {
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
  console.log("Typo fixing complete!");
};

run();
