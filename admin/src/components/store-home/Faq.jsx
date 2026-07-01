import { FiInfo } from "react-icons/fi";
import { Link } from "react-router-dom";

const Faq = () => {
  return (
    <>
      <div className="bg-[#F5ECE8] border border-[#D5BBB4]/60 rounded-2xl p-8 max-w-2xl">
        <div className="flex gap-4">
          <FiInfo className="text-[#93614E] text-2xl shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-[#93614E] mb-2">FAQs are managed separately</h2>
            <p className="text-sm text-[#2B211E]/80 mb-4">
              Questions &amp; answers on the FAQ page come from the FAQs section in admin — not from
              this customization tab.
            </p>
            <Link
              to="/faqs"
              className="inline-flex items-center px-5 py-2.5 bg-[#004f56] text-white text-sm font-semibold rounded-xl hover:bg-[#003840] transition-colors"
            >
              Manage FAQs →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
