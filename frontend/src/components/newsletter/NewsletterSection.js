import { useState } from "react";
import NewsletterServices from "@services/NewsletterServices";
import { notifyError, notifySuccess } from "@utils/toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notifyError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await NewsletterServices.addNewsletter({ email });
      notifySuccess("Welcome to the inner circle.");
      setEmail("");
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-[#FAF7F5] border-t border-[#E6D1CB]/60/60 relative overflow-hidden">
      {/* Golden aura glow */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full bg-[#9C6A5A]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute left-0 top-0 w-[300px] h-[300px] rounded-full bg-white/2 blur-[100px] pointer-events-none z-0" />

      <div className="mx-auto max-w-5xl px-4 sm:px-8 relative z-10">
        <div className="relative overflow-hidden rounded-2xl border border-[#E6D1CB]/60 bg-white px-8 py-12 sm:px-12 sm:py-16 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#0A0A0A]/90 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111] border border-[#E6D1CB]/60 text-[#9C6A5A] text-[8px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
                Exclusive Updates
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#3B2A25] mb-4">
                Stay Ahead of Every Drop
              </h2>
              <p className="text-xs sm:text-sm text-[#3B2A25]/70 leading-relaxed">
                Be the first to receive notifications on limited releases, private sales, and curated fashion drops. No spam. Only the extraordinary.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 h-13 px-5 bg-black border border-[#E6D1CB]/60 rounded-lg text-xs sm:text-sm text-[#3B2A25] placeholder-[#3B2A25]/40 focus:outline-none focus:border-[#9C6A5A] focus:ring-1 focus:ring-[#9C6A5A]/35 transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-13 px-8 bg-[#9C6A5A] hover:bg-[#EAC348] active:scale-95 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] rounded-lg transition-all duration-300 disabled:opacity-60 shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                >
                  {loading ? "Joining..." : "Subscribe"}
                </button>
              </form>
              <p className="text-[10px] text-[#3B2A25]/60 mt-3 text-center sm:text-left">
                By subscribing, you agree to our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
