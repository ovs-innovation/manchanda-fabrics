import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import PageHeader from "@components/header/PageHeader";
import useUtilsFunction from "@hooks/useUtilsFunction";
import FaqServices from "@services/FaqServices";
import { notifyError } from "@utils/toast";

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-neutral-800">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center py-5 text-left focus:outline-none"
    >
      <span className="text-lg font-semibold text-white">{question}</span>
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-full border border-[#D4AF37] text-[#D4AF37] text-2xl font-light transition-transform ${
          isOpen ? "" : ""
        }`}
      >
        {isOpen ? "−" : "+"}
      </span>
    </button>
    {isOpen && (
      <div className="pb-6 text-base leading-7 text-neutral-300">{answer}</div>
    )}
  </div>
);

const Faq = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    setLoadingFaqs(true);
    FaqServices.getPublicFaqs()
      .then((res) => {
        // Filter out video type FAQs for the main list if needed, or handle them
        const qaFaqs = (res || []).filter(item => item.type !== 'video');
        setFaqs(qaFaqs);
      })
      .catch((err) => {
        console.error("Failed to load FAQs:", err);
      })
      .finally(() => setLoadingFaqs(false));
  }, []);

  const defaultFaqs = [
    {
      question: "How can I cancel my order?",
      answer: "If you wish to cancel your order, please message us on WhatsApp with your Order ID for a cancellation request. Our support team will assist you immediately.",
    },
    {
      question: "What is the typical delivery time?",
      answer: "Most orders are delivered within 24-48 hours. For certain locations, it may take up to 3-5 business days. You can track your order in the 'My Orders' section.",
    },
    {
      question: "Are the products sold on Manchanda Fabrics authentic?",
      answer: "Absolutely. We source our fabrics, sarees, and suits directly from trusted weavers, artisans, and premium manufacturers across India. Quality is our highest priority.",
    },
    {
      question: "How do you verify the quality of fabrics and sarees?",
      answer: "Every single piece undergoes a physical inspection for weave density, zari quality, fabric softness, and print perfection before being showcased or dispatched, ensuring premium quality.",
    },
    {
      question: "How do I return an item?",
      answer: "Returns are accepted within 7 days of delivery for unopened and undamaged products. Please refer to our Refund & Return Policy for more details.",
    },
    {
      question: "Can I pay using Cash on Delivery (COD)?",
      answer: "Yes, we offer Cash on Delivery for most locations. You can also pay online using UPI, Credit/Debit cards, or Net Banking for a contactless experience.",
    },
  ];

  // Combine API faqs with default ones if API is empty, or just show API ones if they exist
  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <Layout title="FAQ" description="Frequently Asked Questions - Manchanda Fabrics">
      {/* Premium Header */}
      <div className="bg-[#E6D1CB] py-16 lg:py-24 border-b border-[#E6D1CB]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-[#3B2A25] mb-6 uppercase tracking-tight flex items-center justify-center gap-3">
            <span className="w-1.5 h-12 bg-[#9C6A5A] rounded-full inline-block" />
            Frequently Asked Questions
          </h1>
          <p className="text-[#3B2A25]/80 text-lg md:text-xl max-w-3xl mx-auto font-sans">
            Find answers to common questions about ordering, delivery, quality, and more. We're here to help you.
          </p>
        </div>
      </div>

      <div className="bg-[#FAF7F5] py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-10">
          <div className="bg-white rounded-3xl overflow-hidden border border-[#E6D1CB] shadow-sm">
            <div className="p-6 md:p-10 lg:p-16">
              {loadingFaqs ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-16 bg-[#FAF7F5] rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {displayFaqs.map((faq, idx) => (
                    <div 
                      key={faq._id || idx} 
                      className={`border rounded-2xl transition-all duration-300 ${
                        openIndex === idx ? 'border-[#9C6A5A]/55 bg-[#FAF7F5]/50' : 'border-[#E6D1CB]/50 bg-white hover:border-[#E6D1CB]'
                      }`}
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full flex justify-between items-center p-5 md:p-6 text-left focus:outline-none"
                      >
                        <span className={`text-lg font-bold transition-colors ${openIndex === idx ? 'text-[#6F4A3D]' : 'text-[#3B2A25]'}`}>
                          {faq.question}
                        </span>
                        <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                          openIndex === idx ? 'bg-[#9C6A5A] border-[#9C6A5A] text-white' : 'bg-[#FAF7F5] border-[#E6D1CB] text-[#3B2A25]'
                        }`}>
                          <span className="text-xl leading-none">{openIndex === idx ? "−" : "+"}</span>
                        </div>
                      </button>
                      {openIndex === idx && (
                        <div className="px-5 pb-6 md:px-6 md:pb-8 animate-fadeIn">
                          <div className="h-px bg-[#E6D1CB]/40 mb-6 w-full" />
                          <p className="text-[#3B2A25]/90 leading-relaxed text-base md:text-lg">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Still have questions? Section */}
          <div className="mt-12 text-center">
            <div className="bg-[#FAF7F5] rounded-2xl p-8 border border-dashed border-[#E6D1CB]">
              <h3 className="text-xl font-serif font-medium uppercase text-[#3B2A25] mb-2 tracking-wide">Still have questions?</h3>
              <p className="text-[#3B2A25]/75 mb-6 font-sans">If you couldn't find the answer you're looking for, please get in touch with our team.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={storeCustomizationSetting?.footer?.social_whatsapp?.startsWith('http') 
                    ? storeCustomizationSetting.footer.social_whatsapp 
                    : `https://wa.me/${storeCustomizationSetting?.footer?.social_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-all shadow-md font-sans"
                >
                  Message on WhatsApp
                </a>
                <a 
                  href="/contact-us" 
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#9C6A5A] text-white rounded-xl font-bold hover:bg-[#6F4A3D] transition-all shadow-md font-sans"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </Layout>
  );
};

export default Faq;
