import React from "react";
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import ProductCard from "@components/product/ProductCard";
import useTranslation from "next-translate/useTranslation";

const NewArrivals = ({ products, attributes }) => {
  const { t } = useTranslation("common");

  return (
    <Layout
      title={t("New Arrivals")}
      description={t("Explore the latest drop of clothing, footwear, and accessories from Manchanda Fabrics.")}
    >
      <div className="bg-white min-h-screen pb-16">
        {/* Editorial Banner */}
        <div className="relative bg-[#FAF9F6] py-16 px-4 border-b border-gray-100 mb-10 text-center">
          <span className="text-[10px] bg-black text-[#D4AF37] px-3 py-1 font-extrabold uppercase tracking-widest inline-block mb-3">
            {t("Fresh Drop")}
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black mb-3">
            {t("New Arrivals")}
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto font-medium">
            {t(
              "Stay ahead of the curve with our latest weekly drop. Handcrafted ethnic wear, gold accents, and pure fabrics available in limited quantities."
            )}
          </p>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <span className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">
              {products?.length || 0} {products?.length === 1 ? t("itemFound") : t("itemsFound")}
            </span>
          </div>

          {products?.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-wider">
              {t("No new arrivals available.")}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8 lg:gap-10">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} attributes={attributes} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  try {
    const [data, attributes] = await Promise.all([
      ProductServices.getShowingStoreProducts({ tag: "new-arrival" }),
      AttributeServices.getShowingAttributes(),
    ]);
    return {
      props: {
        products: data?.popularProducts || data?.products || [],
        attributes: attributes || [],
      },
    };
  } catch (err) {
    console.error("Error fetching new arrivals data:", err);
    return {
      props: {
        products: [],
        attributes: []
      }
    };
  }
};

export default NewArrivals;
