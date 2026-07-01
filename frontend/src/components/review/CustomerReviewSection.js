import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoStar, IoCheckmarkCircle } from "react-icons/io5";
import TestimonialServices from "@services/TestimonialServices";

const FALLBACK_REVIEWS = [
  {
    id: 1,
    name: "Sunita K.",
    location: "Delhi",
    initials: "SK",
    rating: 5,
    date: "June 2026",
    text: "Ordered an embroidered silk suit set for my daughter's wedding. Beautiful packaging and premium fabric — truly Biba-level quality.",
    product: "Festive Silk Suit Set",
    verified: true,
  },
  {
    id: 2,
    name: "Priya S.",
    location: "Mumbai",
    initials: "PS",
    rating: 5,
    date: "May 2026",
    text: "The straight cotton suit I received is exactly as shown — soft fabric, elegant print, perfect for daily wear. Manchanda is my go-to for ethnic suits.",
    product: "Cotton Straight Suit",
    verified: true,
  },
  {
    id: 3,
    name: "Meenakshi R.",
    location: "Ludhiana",
    initials: "MR",
    rating: 5,
    date: "June 2026",
    text: "Bought unstitched suit fabric online — pure cotton with rich handblock prints. Tailored into a gorgeous salwar set for Karwa Chauth.",
    product: "Handblock Cotton Suit Fabric",
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
  <div className="flex gap-0.5 text-[#C7A46A]">
    {[...Array(5)].map((_, i) => (
      <IoStar key={i} className="w-4 h-4" />
    ))}
  </div>
);

const mapApiReview = (item, index) => ({
  id: item._id || index,
  name: item.name || item.customer_name || "Customer",
  location: item.city || item.location || "India",
  initials: (item.name || "C").slice(0, 2).toUpperCase(),
  rating: Number(item.rating) || 5,
  date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "",
  text: item.description || item.review || item.comment || "",
  product: item.product_name || item.designation || "Manchanda Fabrics",
  verified: true,
});

const CustomerReviewSection = () => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: apiReviews } = useQuery({
    queryKey: ["publicTestimonials"],
    queryFn: () => TestimonialServices.getPublicTestimonials(),
    staleTime: 5 * 60 * 1000,
  });

  const reviews =
    Array.isArray(apiReviews) && apiReviews.length > 0
      ? apiReviews.filter((r) => r.status !== "hide").map(mapApiReview)
      : FALLBACK_REVIEWS;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length < 2) return;

    const scrollToCard = (index) => {
      const card = el.children[index];
      if (!card) return;
      const left = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    };

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % reviews.length;
        scrollToCard(next);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93614E] mb-2">Patron Stories</p>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-light text-[#2B211E] font-serif">Loved by Our Customers</h2>
        <div className="h-[1px] w-12 bg-[#C7A46A] mx-auto mt-3 sm:mt-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-12">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-[#D5BBB4]/30">
            <p className="text-lg sm:text-2xl font-semibold text-[#93614E]">{stat.value}</p>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#2B211E]/60 mt-1 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-1 px-1"
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="snap-center shrink-0 w-[min(88vw,300px)] sm:w-[340px] bg-white border border-[#D5BBB4]/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F5ECE8] text-[#93614E] font-semibold flex items-center justify-center">
                {review.initials}
              </div>
              <div>
                <p className="font-medium text-[#2B211E]">{review.name}</p>
                <p className="text-xs text-[#2B211E]/50">{review.location}</p>
              </div>
            </div>
            <Stars />
            <p className="text-sm text-[#2B211E]/80 mt-3 leading-relaxed line-clamp-4">{review.text}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-[#2B211E]/50">
              <span>{review.product}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-[#93614E]">
                  <IoCheckmarkCircle /> Verified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReviewSection;
