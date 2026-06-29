const fs = require("fs");
const path = require("path");

const sidebarFile = path.join(__dirname, "../src/components/category/FilterSidebar.js");
if (fs.existsSync(sidebarFile)) {
  let content = fs.readFileSync(sidebarFile, "utf8");

  // 1. Remove harsh shadow & use soft copper brand shadow
  content = content.replace(
    'shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
    'shadow-[0_4px_20px_rgba(156,106,90,0.08)]'
  );

  // 2. Fix header text visibility: text-neutral-200 -> text-[#3B2A25]
  content = content.replace(
    /text-xs font-black uppercase text-neutral-200 hover:bg-neutral-900\/60 transition-colors/g,
    'text-xs font-bold uppercase text-[#3B2A25] hover:bg-[#FAF7F5] transition-colors'
  );
  content = content.replace(
    'text-xs font-black uppercase text-neutral-200 mb-4',
    'text-xs font-bold uppercase text-[#3B2A25] mb-4'
  );

  // 3. Fix active tag background: bg-neutral-900 -> bg-[#FAF7F5] and text-[#3B2A25]/85 -> text-[#3B2A25]
  content = content.replace(
    /bg-neutral-900 border border-\[\#E6D1CB\]\/60 text-xs rounded-lg text-\[\#3B2A25\]\/85/g,
    'bg-[#FAF7F5] border border-[#E6D1CB]/60 text-xs rounded-lg text-[#3B2A25] font-medium'
  );

  // 4. Fix checkbox & radio backgrounds: bg-neutral-950 -> bg-white
  content = content.replace(/bg-neutral-950/g, 'bg-white');

  // 5. Fix price range track color: #262626 -> #E6D1CB
  content = content.replace(/#262626/g, '#E6D1CB/30');

  // 6. Fix label text color: text-neutral-350 -> text-[#3B2A25]/80, text-neutral-450 -> text-[#3B2A25]/70
  content = content.replace(/text-neutral-350/g, 'text-[#3B2A25]/80 font-medium');
  content = content.replace(/text-neutral-450/g, 'text-[#3B2A25]/75 font-medium');

  fs.writeFileSync(sidebarFile, content, "utf8");
  console.log("Fixed FilterSidebar colors successfully!");
} else {
  console.log("FilterSidebar file not found at " + sidebarFile);
}
