import { useEffect, useRef, useState } from "react";
import { IoStar, IoCheckmarkCircle } from "react-icons/io5";

const REVIEWS = [
  {
    id: 1,
    name: "Sunita K.",
    location: "Delhi",
    initials: "SK",
    rating: 5,
    date: "June 2026",
    text: "Ordered a Banarasi Silk Saree for my daughter's wedding. It arrived in 2 days. The packaging was beautiful and felt like a luxury gift. The fabric quality is absolutely premium.",
    product: "Banarasi Silk Saree",
    verified: true,
  },
  {
    id: 2,
    name: "Priya S.",
    location: "Mumbai",
    initials: "PS",
    rating: 5,
    date: "May 2026",
    text: "The georgette saree I got is exactly as shown — clean weave, perfect weight. Manchanda Fabrics has become my go-to for finding authentic ethnic pieces.",
    product: "Georgette Designer Saree",
    verified: true,
  },
  {
    id: 3,
    name: "Meenakshi R.",
    location: "Ludhiana",
    initials: "MR",
    rating: 5,
    date: "June 2026",
    text: "Was skeptical at first to buy fabric online, but the pure cotton material exceeded my expectations. Breathable and gorgeous prints. Will definitely shop again!",
    product: "Printed Cotton Fabric",
    verified: true,
  },
  {
    id: 4,
    name: "Sneha R.",
    location: "Chennai",
    initials: "SR",
    rating: 5,
    date: "April 2026",
    text: "Customer service was super responsive on WhatsApp. Had a small query about the blouse fabric and they replied with images in minutes. The suit set is gorgeous.",
    product: "Festive Silk Suit",
    verified: true,
  },
  {
    id: 5,
    name: "Vikram T.",
    location: "Hyderabad",
    initials: "VT",
    rating: 5,
    date: "May 2026",
    text: "Ordered handloom cotton fabrics for my boutique. Every piece has authentic weave and rich color. Excellent quality at this price point.",
    product: "Handloom Cotton Fabric",
    verified: true,
  },
  {
    id: 6,
    name: "Ananya D.",
    location: "Pune",
    initials: "AD",
    rating: 5,
    date: "June 2026",
    text: "Bought a designer saree as a gift for my mother. She absolutely loved the craftsmanship. Thank you Manchanda Fabrics!",
    product: "Designer Silk Saree",
    verified: true,
  },
];

const STATS = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "4.9★", label: "Average Rating" },
  { value: "Pan India", label: "Safe Shipping" },
  { value: "100%", label: "Authentic Quality" },
];

const Stars = () => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <IoStar key={s} className="text-[#9C6A5A] text-xs" />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="relative flex flex-col justify-between gap-4 rounded-xl border border-[#E6D1CB] bg-white p-6 hover:border-[#9C6A5A]/50 transition-all duration-300 w-[350px] shrink-0 shadow-sm">
    {/* Top part */}
    <div>
      <div className="flex justify-between items-center mb-3">
        <Stars />
        <span className="text-[#3B2A25]/60 text-[10px]">{review.date}</span>
      </div>
      <p className="text-[#3B2A25]/85 text-xs leading-relaxed italic">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>

    {/* Bottom part */}
    <div className="mt-4 pt-3 border-t border-[#E6D1CB]/40 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FAF7F5] border border-[#E6D1CB] flex items-center justify-center shrink-0">
          <span className="text-[#9C6A5A] text-[10px] font-black">{review.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[#3B2A25] text-xs font-black truncate">{review.name}</span>
            {review.verified && (
              <IoCheckmarkCircle className="text-[#9C6A5A] text-[12px] shrink-0" />
            )}
          </div>
          <p className="text-[#3B2A25]/60 text-[9px] uppercase tracking-widest">{review.location}</p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAF7F5] border border-[#E6D1CB] rounded-full w-fit">
        <span className="w-1 h-1 rounded-full bg-[#9C6A5A]" />
        <span className="text-[#3B2A25]/75 text-[8px] uppercase tracking-widest font-bold">{review.product}</span>
      </div>
    </div>
  </div>
);

export default function CustomerReviewSection() {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const SPEED = 0.5;
  const doubledReviews = [...REVIEWS, ...REVIEWS, ...REVIEWS];

  // Mobile slideshow state
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const animate = () => {
      if (!paused) {
        posRef.current += SPEED;
        const totalW = track.scrollWidth;
        const singleW = totalW / 3;
        if (posRef.current >= singleW) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  // Mobile slideshow auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 md:py-20 bg-[#FAF7F5] border-t border-[#E6D1CB] overflow-hidden font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9C6A5A] mb-2">
            Customer Reviews
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#3B2A25]">
            Loved by Our Patrons
          </h2>
          <div className="h-[2px] w-12 bg-[#9C6A5A] mx-auto mt-4" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-4xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4 px-3 rounded-lg bg-white border border-[#E6D1CB] shadow-sm">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#3B2A25]">{stat.value}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#3B2A25]/60 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View: Scrolling Marquee Row */}
      <div 
        className="hidden md:block relative overflow-hidden py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left & Right Gradients for smooth fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAF7F5] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAF7F5] to-transparent z-10 pointer-events-none" />

        <div 
          ref={trackRef} 
          className="flex gap-4" 
          style={{ willChange: "transform", width: "max-content" }}
        >
          {doubledReviews.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} />
          ))}
        </div>
      </div>

      {/* Mobile View: 1 Card Slide Show */}
      <div className="block md:hidden px-6">
        <div className="relative overflow-hidden w-full min-h-[220px] flex items-center justify-center">
          {REVIEWS.map((review, idx) => {
            const isCurrent = idx === activeMobileIndex;
            return (
              <div
                key={review.id}
                className={`absolute w-full max-w-[340px] transition-all duration-500 ease-in-out ${
                  isCurrent
                    ? "opacity-100 scale-100 translate-x-0 relative z-10"
                    : "opacity-0 scale-95 translate-x-12 absolute pointer-events-none z-0"
                }`}
              >
                <ReviewCard review={review} />
              </div>
            );
          })}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-1.5 mt-5">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveMobileIndex(idx)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: idx === activeMobileIndex ? "18px" : "6px",
                backgroundColor: idx === activeMobileIndex ? "#9C6A5A" : "#E6D1CB",
              }}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
