import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { FiShoppingBag, FiChevronDown } from "react-icons/fi";

import MainModal from "@components/modal/MainModal";
import useAddToCart from "@hooks/useAddToCart";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { PRODUCT_PLACEHOLDER } from "@utils/brandAssets";

const formatInr = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ReelModal = ({ open, onClose, product, video, image }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { handleAddItem } = useAddToCart();
  const { showingTranslateValue } = useUtilsFunction();
  const [descOpen, setDescOpen] = useState(true);

  if (!product) return null;

  const title =
    showingTranslateValue(product?.title) || product?.name || "Product";
  const description = showingTranslateValue(product?.description) || "";
  const priceVal = product?.prices?.price ?? product?.price ?? null;
  const originalVal = product?.prices?.originalPrice ?? null;
  const priceText = formatInr(priceVal);
  const originalText =
    originalVal && originalVal > priceVal ? formatInr(originalVal) : null;
  const slug = product?.slug;
  const thumb = image || product?.image?.[0] || PRODUCT_PLACEHOLDER;

  const addToCart = () => {
    const cartItem = {
      ...product,
      id: product?._id || slug,
      slug,
      title,
      image: thumb,
      prices: product?.prices || { price: priceVal, originalPrice: originalVal },
    };
    handleAddItem(cartItem, 1);
  };

  const goToProduct = () => {
    onClose();
    if (slug) router.push(`/product/${slug}`);
  };

  return (
    <MainModal modalOpen={open} setModalOpen={onClose}>
      <div
        className="inline-block w-full max-w-3xl my-8 text-left align-middle bg-white shadow-2xl rounded-2xl overflow-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left — reel video */}
          <div className="md:w-1/2 bg-black flex items-center justify-center">
            <div className="w-full aspect-[9/16] max-h-[70vh] relative">
              {video ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={video}
                  poster={thumb}
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={thumb}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              )}
            </div>
          </div>

          {/* Right — product */}
          <div className="md:w-1/2 flex flex-col max-h-[70vh]">
            <div className="p-5 sm:p-6 overflow-y-auto">
              {/* Header: thumb + title + price */}
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-50">
                  <img
                    src={thumb}
                    alt={title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#111111] leading-snug">
                    {title}
                  </h3>
                  {priceText && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-[#B0322F]">
                        Rs. {priceText}
                      </span>
                      {originalText && (
                        <span className="text-[12px] text-neutral-400 line-through">
                          Rs. {originalText}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                onClick={addToCart}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-[#111111] text-white text-[13px] font-semibold uppercase tracking-[0.14em] py-3.5 rounded-lg hover:bg-black/85 transition-colors"
              >
                <FiShoppingBag className="w-4 h-4" />
                {t("Add to Cart")}
              </button>

              <button
                type="button"
                onClick={goToProduct}
                className="mt-3 w-full text-center text-[12px] font-medium uppercase tracking-[0.14em] text-[#B0322F] hover:underline"
              >
                {t("View full details")}
              </button>

              {/* Description */}
              {description && (
                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setDescOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]"
                  >
                    <span>{t("Description")}</span>
                    <FiChevronDown
                      className={`w-4 h-4 transition-transform ${
                        descOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {descOpen && (
                    <div
                      className="mt-3 text-[13px] leading-relaxed text-neutral-600 reel-desc"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <style jsx global>{`
          .reel-desc ul {
            list-style: disc;
            padding-left: 1.1rem;
            margin: 0.5rem 0;
          }
          .reel-desc p {
            margin-bottom: 0.5rem;
          }
        `}</style>
      </div>
    </MainModal>
  );
};

export default ReelModal;
