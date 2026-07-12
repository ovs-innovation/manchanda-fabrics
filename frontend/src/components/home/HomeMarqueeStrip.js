import { DEFAULT_HOMEPAGE } from "@utils/homepageDefaults";

const HomeMarqueeStrip = ({ phrases: phrasesProp }) => {
  const phrases =
    Array.isArray(phrasesProp) && phrasesProp.length > 0
      ? phrasesProp
      : DEFAULT_HOMEPAGE.marqueePhrases;

  const row = phrases.map((p, i) => (
    <span key={i} className="inline-flex items-center">
      <span className="mx-6 text-lg sm:text-2xl font-semibold text-[#111111] whitespace-nowrap">
        {p}
      </span>
      <span className="text-[#111111] text-xl select-none">✦</span>
    </span>
  ));

  return (
    <section className="bg-white border-y border-black/5 overflow-hidden py-6">
      <div className="marquee-track flex w-max" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex shrink-0 items-center">{row}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{row}</div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .marquee-track {
            animation: home-marquee 40s linear infinite;
          }
          @keyframes home-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `
      }} />
    </section>
  );
};

export default HomeMarqueeStrip;
