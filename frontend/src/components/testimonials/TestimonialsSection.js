import React from "react";
import { IoStar, IoCheckmarkCircle } from "react-icons/io5";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sunita Verma",
    role: "Working Professional",
    item: "Pure Kanchipuram Silk Saree",
    rating: 5,
    comment: "Absolutely stunning saree. The quality of the silk and the zari work is top-notch. It was the highlight of our family gathering. Highly recommend Manchanda Fabrics for authentic silk sarees.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Priya Sen",
    role: "Boutique Owner",
    item: "Premium Banarasi Brocade Fabric",
    rating: 5,
    comment: "The fabrics here are exceptional. As a boutique owner, I'm extremely picky about fabric quality and authenticity. The silk printed fabrics are pure bliss to work with.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Meera Nair",
    role: "Homemaker",
    item: "Festive Embroidered Silk Suit",
    rating: 5,
    comment: "The designs are elegant and very sophisticated. The ordering process was simple, and the support team assisted me on WhatsApp for my sizing options. Will purchase again!",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&q=80",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[#FAF7F5] border-t border-[#E6D1CB]">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E6D1CB] text-[#9C6A5A] text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
            <span>Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#3B2A25] mb-4">
            Loved by Our Patrons
          </h2>
          <p className="text-sm text-[#3B2A25]/70">
            Hear from our community of boutique customers, professionals, and families who celebrate life's moments with Manchanda Fabrics.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 font-sans">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="group relative bg-white border border-[#E6D1CB]/50 rounded-2xl p-6 sm:p-8 hover:border-[#9C6A5A] transition-all duration-300 flex flex-col justify-between shadow-sm"
            >
              {/* Rating */}
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <IoStar key={i} className="text-[#9C6A5A] text-sm" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-[#3B2A25]/80 text-sm leading-relaxed mb-6 italic">
                  "{t.comment}"
                </p>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-6 border-t border-[#E6D1CB]/40 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E6D1CB]"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#3B2A25] tracking-tight flex items-center gap-1.5">
                    {t.name}
                    <IoCheckmarkCircle className="text-emerald-600 text-sm flex-shrink-0" title="Verified Purchase" />
                  </h4>
                  <div className="flex flex-col text-[10px] text-[#3B2A25]/60">
                    <span className="font-medium">{t.role}</span>
                    <span className="text-[#9C6A5A] font-bold truncate mt-0.5">{t.item}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
