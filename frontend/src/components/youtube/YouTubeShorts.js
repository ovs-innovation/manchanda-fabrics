import React from "react";
import { FaYoutube } from "react-icons/fa";

/*
  Same carousel math as InstagramFeed:
  - SLOT = 190 + 16 = 206px
  - 8 cards per set × 206px = 1648px (fills all screens)
  - 2 sets = 16 cards total, animation translateX(-50%) = seamless
*/
const CARD_W = 190;
const CARD_GAP = 16;
const SLOT = CARD_W + CARD_GAP;

const BASE_SHORTS = [
  {
    id: 1,
    thumb: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
    title: "How to Style a Silk Saree",
    desc: "Draping tips for the modern Indian bride.",
  },
  {
    id: 2,
    thumb: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    title: "Behind the Weave",
    desc: "A peek inside our handloom workshop.",
  },
  {
    id: 3,
    thumb: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
    title: "New Arrivals — Unboxing",
    desc: "Fresh Banarasi silk suits just arrived.",
  },
  {
    id: 4,
    thumb: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    title: "Fabric Care Guide",
    desc: "Preserve your premium silks for generations.",
  },
  {
    id: 5,
    thumb: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
    title: "Wedding Season Edit",
    desc: "Curated trousseaux for the perfect shaadi.",
  },
  {
    id: 6,
    thumb: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
    title: "Cotton vs Silk",
    desc: "Expert guide to choosing the right fabric.",
  },
  {
    id: 7,
    thumb: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    title: "Festival Lookbook",
    desc: "Diwali, Eid & Navratri outfit inspiration.",
  },
  {
    id: 8,
    thumb: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
    title: "Boutique Tour",
    desc: "Step inside our premium fabric studio.",
  },
];

const TRACK_SHORTS = [...BASE_SHORTS, ...BASE_SHORTS];

const YouTubeShorts = () => {
  return (
    <section className="py-20 sm:py-24 bg-white overflow-hidden">

      {/* ── Header (constrained) ── */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center mb-14">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FF0000] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaYoutube className="w-4 h-4" />
            Manchanda Fabrics
          </span>
          <h2
            className="text-4xl sm:text-5xl font-light text-[#111111] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            YouTube Shorts
          </h2>
          <div className="w-12 h-[1.5px] bg-[#C8A45D] mx-auto mb-5" />
          <p
            className="text-[14px] text-[#7A7A7A] font-light max-w-md mx-auto mb-7"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Discover styling videos and behind-the-scenes from our boutique.
          </p>
          <a
            href="https://youtube.com/@manchandafabrics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#FF0000] text-white text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#cc0000] transition-all duration-300 rounded-full hover:shadow-lg"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaYoutube className="w-4 h-4" />
            Subscribe
          </a>
        </div>
      </div>

      {/* ── Full-viewport Infinite Carousel (reverse direction) ── */}
      <div style={{ overflow: "hidden", width: "100%" }}>
        <div
          style={{
            display: "flex",
            width: `${SLOT * TRACK_SHORTS.length}px`,
            animation: "marquee 40s linear infinite reverse",
            willChange: "transform",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
        >
          {TRACK_SHORTS.map((short, idx) => (
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
                className="relative overflow-hidden rounded-2xl shadow-lg group cursor-pointer"
                style={{ aspectRatio: "9/16" }}
              >
                {/* Thumbnail */}
                <img
                  src={short.thumb}
                  alt={short.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                {/* YouTube play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* YouTube badge */}
                <div className="absolute top-3 right-3">
                  <FaYoutube className="w-5 h-5 text-[#FF0000]" />
                </div>

                {/* Bottom text */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3
                    className="text-[15px] font-light leading-snug mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {short.title}
                  </h3>
                  <p
                    className="text-[10px] text-white/65 font-light"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {short.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default YouTubeShorts;
