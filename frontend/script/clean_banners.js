const fs = require("fs");
const path = require("path");

const bannerFile = path.join(__dirname, "../src/components/banner/HeroBanner.js");
if (fs.existsSync(bannerFile)) {
  let content = fs.readFileSync(bannerFile, "utf8");

  // Define the new slides map code
  const newSlidesMapping = `        {slides.map((slide, index) => {
          let alignmentClass = "justify-start text-left";
          let overlayClass = "absolute inset-0 bg-black/45 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/40 lg:to-transparent z-0";
          
          if (slide.style === "layout-right-split") {
            alignmentClass = "justify-end text-right";
            overlayClass = "absolute inset-0 bg-black/45 lg:bg-gradient-to-l lg:from-black/70 lg:via-black/40 lg:to-transparent z-0";
          } else if (slide.style === "layout-center-minimal") {
            alignmentClass = "justify-center text-center";
            overlayClass = "absolute inset-0 bg-black/50 z-0";
          }

          return (
            <SwiperSlide key={index} className="h-full w-full relative">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={slide.bgImage}
                  alt={slide.title}
                  className="w-full h-full object-cover object-[center_35%]"
                />
                {/* Dark Gradient Overlay for high text readability */}
                <div className={overlayClass} />
              </div>
              
              {/* Flat Typographic Content (No Cards, No Borders) */}
              <div className={\`absolute inset-0 max-w-screen-2xl mx-auto px-6 sm:px-16 lg:px-24 flex items-center z-10 text-white \${alignmentClass}\`}>
                <div className="w-full max-w-xl space-y-4">
                  <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E6D1CB]">
                    {slide.badge}
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-[1.1] text-white">
                    {slide.title}
                  </h2>
                  
                  <p className="text-xs sm:text-sm md:text-base text-neutral-200/90 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {slide.subtitle}
                  </p>
                  
                  <div className={\`flex items-center gap-2 \${slide.style === "layout-center-minimal" ? "justify-center" : slide.style === "layout-right-split" ? "justify-end" : "justify-start"}\`}>
                    <span className="h-[1px] w-6 bg-[#E6D1CB]" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#E6D1CB] uppercase">
                      {slide.highlight}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <Link
                      href={slide.btnLink}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 rounded shadow-md hover:shadow-lg"
                    >
                      <span>{slide.btnText}</span>
                      <IoChevronForward className="text-xs" />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}`;

  // Find the swiper loop start and end and replace it
  const loopStartToken = "        {slides.map((slide, index) => {";
  const loopEndToken = "        })}";
  
  const startIndex = content.indexOf(loopStartToken);
  const endIndex = content.indexOf(loopEndToken, startIndex);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex + loopEndToken.length);
    content = before + newSlidesMapping + after;
    fs.writeFileSync(bannerFile, content, "utf8");
    console.log("Successfully cleaned and premium-overlaid all hero slides!");
  } else {
    console.log("Could not locate slides map loop in HeroBanner.js!");
  }
} else {
  console.log("HeroBanner.js not found!");
}
