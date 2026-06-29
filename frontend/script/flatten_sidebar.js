const fs = require("fs");
const path = require("path");

const sidebarFile = path.join(__dirname, "../src/components/category/FilterSidebar.js");
if (fs.existsSync(sidebarFile)) {
  let content = fs.readFileSync(sidebarFile, "utf8");

  // 1. Remove card container styles (shadow, bg-white, borders, rounded corners)
  content = content.replace(
    'className="bg-white border border-[#E6D1CB]/60 rounded-xl shadow-[0_4px_20px_rgba(156,106,90,0.08)] overflow-hidden font-sans"',
    'className="font-sans"'
  );

  // 2. Flatten Header (remove p-4, bg-[#FAF7F5]/40)
  content = content.replace(
    'className="p-4 border-b border-[#E6D1CB]/60 flex justify-between items-center bg-[#FAF7F5]/40"',
    'className="pb-4 border-b border-[#E6D1CB]/60 flex justify-between items-center"'
  );
  content = content.replace(
    'text-sm font-black uppercase tracking-widest text-[#3B2A25]',
    'text-base font-bold uppercase tracking-widest text-[#3B2A25]'
  );
  content = content.replace(
    'text-[#9C6A5A] text-xs font-black uppercase hover:underline',
    'text-[#9C6A5A] text-xs font-bold uppercase hover:underline'
  );

  // 3. Flatten Active Filters wrapper
  content = content.replace(
    'className="p-4 flex flex-wrap gap-2 border-b border-[#E6D1CB]/50 bg-[#FAF7F5]/20"',
    'className="py-3 flex flex-wrap gap-2 border-b border-[#E6D1CB]/50"'
  );

  // 4. Flatten Categories section button
  content = content.replace(
    'className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase text-[#3B2A25] hover:bg-[#FAF7F5] transition-colors"',
    'className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"'
  );
  // Flatten categories container padding
  content = content.replace(
    'className="px-4 pb-4 max-h-96 overflow-y-auto"',
    'className="pb-4 max-h-96 overflow-y-auto"'
  );

  // 5. Flatten Price section padding
  content = content.replace(
    'className="border-b border-[#E6D1CB]/50 p-4"',
    'className="border-b border-[#E6D1CB]/50 py-4"'
  );
  content = content.replace(
    'className="text-xs font-bold uppercase text-[#3B2A25] mb-4"',
    'className="text-sm font-bold uppercase text-[#3B2A25] mb-4"'
  );

  // 6. Flatten Brand section
  content = content.replace(
    'className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase text-[#3B2A25] hover:bg-[#FAF7F5] transition-colors"',
    'className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"'
  );
  content = content.replace(
    'className="px-4 pb-4 max-h-60 overflow-y-auto"',
    'className="pb-4 max-h-60 overflow-y-auto"'
  );

  // 7. Flatten Ratings section
  content = content.replace(
    'className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase text-[#3B2A25] hover:bg-[#FAF7F5] transition-colors"',
    'className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"'
  );
  content = content.replace(
    'className="px-4 pb-4"',
    'className="pb-4"'
  );

  // 8. Flatten Discount section
  content = content.replace(
    'className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase text-[#3B2A25] hover:bg-[#FAF7F5] transition-colors"',
    'className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"'
  );
  content = content.replace(
    'className="px-4 pb-4"',
    'className="pb-4"'
  );

  fs.writeFileSync(sidebarFile, content, "utf8");
  console.log("FilterSidebar successfully flattened (no card layout)!");
} else {
  console.log("FilterSidebar file not found!");
}
