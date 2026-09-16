import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiTrash2 } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import ProductCard from "@components/product/ProductCard";
import Loading from "@components/preloader/Loading";
import AttributeServices from "@services/AttributeServices";
import { notifySuccess } from "@utils/toast";
import useTranslation from "next-translate/useTranslation";

import useWishlist from "@hooks/useWishlist";

const Wishlist = ({ attributes }) => {
  const { t } = useTranslation("common");
  const { items: wishlistItems, remove: removeFromWishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
    notifySuccess(t("Product removed from wishlist"));
  };

  return (
    <Layout title={t("Wishlist")} description={t("Your wishlist items")}>
      <div className="mx-auto max-w-screen-2xl px-3.5 sm:px-8 lg:px-12 py-8 sm:py-12">
        {!mounted ? (
          <Loading loading={true} />
        ) : wishlistItems?.length === 0 ? (
          <div className="mx-auto p-5 my-5 text-center">
            <Image
              className="my-4 mx-auto"
              src="/no-result.svg"
              alt="no-result"
              width={400}
              height={380}
            />
            <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
              {t("Your wishlist is empty")}
            </h2>
            <p className="text-gray-500 mt-2 mb-4">
              {t("Start adding products to your wishlist!")}
            </p>
            <Link
              href="/search"
              className="inline-block px-6 py-3 bg-[#111111] text-white rounded-md hover:bg-black transition-colors text-sm font-semibold uppercase tracking-wider"
            >
              {t("Continue Shopping")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#111111]">
                {t("My Wishlist")}{" "}
                <span className="text-sm sm:text-base font-normal text-neutral-500 font-sans">
                  ({wishlistItems.length} {wishlistItems.length === 1 ? t("item") : t("items")})
                </span>
              </h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {wishlistItems.map((product, i) => (
                <div key={product._id || i} className="relative group">
                  <ProductCard product={product} attributes={attributes} hideWishlistCompare={true} />
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-xs text-neutral-700 hover:text-[#B0322F] hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer border border-black/5"
                    aria-label={t("Remove from wishlist")}
                    title={t("Remove from wishlist")}
                  >
                    <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;

export const getServerSideProps = async () => {
  const attributes = await AttributeServices.getShowingAttributes({});

  return {
    props: {
      attributes,
    },
  };
};

