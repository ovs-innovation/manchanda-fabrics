import React from "react";
import { FaInstagram } from "react-icons/fa";

/*
  CAROUSEL FIX NOTES:
  - Each card slot = CARD_W + CARD_GAP = 190 + 16 = 206px
  - 8 cards per set × 206px = 1648px — fills any screen up to 1920px
  - We render 2 full sets (16 cards) so translateX(-50%) = exactly one set
  - Using marginRight on each card (NOT gap on parent) so the -50% math is exact
*/

const CARD_W = 190;    // px — card content width
const CARD_GAP = 16;   // px — right margin on each card
const SLOT = CARD_W + CARD_GAP; // 206px per slot

const BASE_REELS = [
  { id: 1, video: "/R1.mp4", title: "Heritage Weaves",   desc: "Intricate detailing on premium silk dupattas." },
  { id: 2, video: "/R2.mp4", title: "Timeless Elegance", desc: "Designed for wedding trousseaus and trousseaux." },
  { id: 3, video: "/R3.mp4", title: "Festive Vibes",     desc: "Bright Haldi & Mehendi colour stories." },
  { id: 4, video: "/R1.mp4", title: "Bridal Couture",    desc: "Curated for the modern Indian bride." },
  { id: 5, video: "/R2.mp4", title: "Silk Stories",      desc: "Premium Banarasi & Kanjivaram weaves." },
  { id: 6, video: "/R3.mp4", title: "Occasion Wear",     desc: "From festivals to family celebrations." },
  { id: 7, video: "/R1.mp4", title: "Royal Splendor",    desc: "Zari work that commands attention." },
  { id: 8, video: "/R2.mp4", title: "Handloom Grace",    desc: "Artisan-crafted beauty, thread by thread." },
];

// Duplicate for seamless infinite loop — track = 2× set width
const TRACK_REELS = [...BASE_REELS, ...BASE_REELS];

const InstagramFeed = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#F9F6F1] overflow-hidden">

      {/* ── Header (constrained) ── */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center mb-14">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaInstagram className="w-3.5 h-3.5" />
            @manchandafabrics
          </span>
          <h2
            className="text-4xl sm:text-5xl font-light text-[#111111] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Instagram Reels
          </h2>
          <div className="w-12 h-[1.5px] bg-[#C8A45D] mx-auto mb-5" />
          <p
            className="text-[14px] text-[#7A7A7A] font-light max-w-md mx-auto mb-7"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Follow our latest ethnic fashion inspiration.
          </p>
          <a
            href="https://instagram.com/manchandafabrics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 border border-[#C8A45D] text-[#C8A45D] text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#C8A45D] hover:text-white transition-all duration-300 rounded-full"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaInstagram className="w-4 h-4" />
            Follow on Instagram
          </a>
        </div>
      </div>

      {/* ── Full-viewport Infinite Carousel ── */}
      <div
        style={{ overflow: "hidden", width: "100%" }}
      >
        {/* The track: exactly 2× set width, animation moves -50% = one full set */}
        <div
          style={{
            display: "flex",
            width: `${SLOT * TRACK_REELS.length}px`,
            animation: "marquee 36s linear infinite",
            willChange: "transform",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
        >
          {TRACK_REELS.map((reel, idx) => (
            <div
              key={idx}
              style={{
                width: `${CARD_W}px`,
                marginRight: `${CARD_GAP}px`,
                flexShrink: 0,
              }}
            >
              {/* 9:16 portrait card */}
              <div
                className="relative overflow-hidden rounded-2xl shadow-lg group"
                style={{ aspectRatio: "9/16", background: "#0a0a0a" }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                >
                  <source src={reel.video} type="video/mp4" />
                </video>

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Instagram icon */}
                <div className="absolute top-3 right-3 text-white/60">
                  <FaInstagram className="w-4 h-4" />
                </div>

                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3
                    className="text-[15px] font-light leading-snug mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {reel.title}
                  </h3>
                  <p
                    className="text-[10px] text-white/65 font-light leading-relaxed mb-3"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {reel.desc}
                  </p>
                  <span
                    className="inline-block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#C8A45D] border border-[#C8A45D]/50 px-3 py-1 rounded-full"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    View Reel
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default InstagramFeed;
