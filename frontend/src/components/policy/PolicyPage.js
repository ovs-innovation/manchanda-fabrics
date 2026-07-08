import React from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

import Layout from "@layout/Layout";
import CMSkeleton from "@components/preloader/CMSkeleton";

const RED = "#B0322F";

const PolicyPage = ({
  metaTitle,
  metaDescription,
  eyebrow = "Manchanda Fabrics",
  title,
  intro,
  cmsData,
  loading,
  error,
}) => {
  // CMSkeleton runs the value through showingTranslateValue, which expects a
  // { en, hi, ... } object. Wrap plain HTML strings so the content renders.
  const content =
    typeof cmsData === "string" ? { en: cmsData } : cmsData;

  return (
    <Layout title={metaTitle} description={metaDescription}>
      <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-[#f7f4f0]">
        {/* Simple header */}
        <div className="bg-white border-b border-[#eee3d8]">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 lg:py-16 text-center">
            <p
              className="text-[11px] tracking-[0.3em] uppercase font-semibold mb-3"
              style={{ color: RED }}
            >
              {eyebrow}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2c2320] tracking-tight">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 text-[15px] text-[#5f544d] leading-relaxed">
                {intro}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[#8a7d74]">
              <Link href="/" className="hover:text-[#2c2320] transition-colors">
                Home
              </Link>
              <FiChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#2c2320] font-medium">{title}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
          <div className="bg-white rounded-2xl border border-[#ece3d8] p-6 sm:p-9 lg:p-11">
            <div className="policy-content">
              <CMSkeleton
                html
                count={16}
                height={16}
                error={error}
                loading={loading}
                data={content}
              />
            </div>
          </div>

          <p className="text-center text-[13px] text-[#8a7d74] mt-8">
            Questions? Reach us any time on the{" "}
            <Link href="/contact-us" className="font-semibold" style={{ color: RED }}>
              Contact page
            </Link>
            .
          </p>
        </div>
      </div>

      <style jsx global>{`
        .policy-content h1,
        .policy-content h2,
        .policy-content h3 {
          color: #2c2320;
          font-weight: 600;
          margin-top: 1.9rem;
          margin-bottom: 0.8rem;
          font-size: 1.22rem;
          line-height: 1.4;
        }
        .policy-content h1 {
          font-size: 1.45rem;
        }
        .policy-content h3 {
          font-size: 1.05rem;
        }
        .policy-content h1:first-child,
        .policy-content h2:first-child,
        .policy-content h3:first-child {
          margin-top: 0;
        }
        .policy-content p {
          color: #55493f;
          font-size: 0.97rem;
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        .policy-content ul,
        .policy-content ol {
          padding-left: 1.3rem;
          margin-bottom: 1.2rem;
          color: #55493f;
        }
        .policy-content ul {
          list-style-type: disc;
        }
        .policy-content ol {
          list-style-type: decimal;
        }
        .policy-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          font-size: 0.96rem;
        }
        .policy-content li::marker {
          color: ${RED};
        }
        .policy-content strong {
          color: #2c2320;
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
};

export default PolicyPage;
