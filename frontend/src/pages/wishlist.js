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

const Wishlist = ({ attributes }) => {
  const { t } = useTranslation("common");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    if (typeof window !== "undefined") {
      const storedWishlist = localStorage.getItem("wishlist");
      if (storedWishlist) {
        try {
          setWishlistItems(JSON.parse(storedWishlist));
        } catch (error) {
          console.error("Error parsing wishlist:", error);
          setWishlistItems([]);
        }
      }
      setLoading(false);
    }
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item._id !== productId
    );
    setWishlistItems(updatedWishlist);
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    }
    notifySuccess(t("Product removed from wishlist"));
  };

  return (
    <Layout title={t("Wishlist")} description={t("Your wishlist items")}>
      <div className="mx-auto max-w-screen-2xl px-4 py-10   sm:px-10">
        {loading ? (
          <Loading loading={loading} />
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
              href="/"
              className="inline-block px-6 py-3 bg-store-500 text-white rounded-md hover:bg-store-600 transition-colors"
            >
              {t("Continue Shopping")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold font-serif">
                {t("My Wishlist")} ({wishlistItems.length} {wishlistItems.length === 1 ? t("item") : t("items")})
              </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
              {wishlistItems.map((product, i) => (
                <div key={i} className="relative group">
                  <ProductCard product={product} attributes={attributes} />
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 z-20 p-2 bg-white rounded-full shadow-md hover:bg-store-500 hover:text-white transition-colors"
                    aria-label={t("Remove from wishlist")}
                  >
                    <FiTrash2 className="w-4 h-4" />
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

