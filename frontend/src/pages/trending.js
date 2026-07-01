import React from "react";
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import ProductCard from "@components/product/ProductCard";

const TrendingCollection = ({ products, attributes }) => {
  return (
    <Layout title="Trending Collection" description="Shop the most wanted ethnic wear and sarees trending right now at Manchanda Fabrics.">
      <div className="bg-[#F5ECE8]/20 min-h-screen pb-16">
        {/* Editorial Banner */}
        <div className="relative bg-[#F5ECE8] py-16 px-4 border-b border-[#D5BBB4]/30 mb-10 text-center">
          <span className="text-[10px] bg-[#C7A46A] text-white px-3 py-1 font-extrabold uppercase tracking-widest inline-block mb-3">
            Best Sellers
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-[#2B211E] mb-3">
            Trending Collection
          </h1>
          <p className="text-[#2B211E]/70 text-sm max-w-lg mx-auto font-medium font-sans">
            Explore the styles everyone is talking about. Handcrafted sarees, premium designer suits, and gold-accented ethnic ensembles.
          </p>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <span className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">
              {products?.length || 0} Items Found
            </span>
          </div>

          {products?.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-wider">
              No trending items available.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
      ProductServices.getShowingStoreProducts({}),
      AttributeServices.getShowingAttributes(),
    ]);
    return {
      props: {
        products: data?.bestSellingProducts || data?.products || [],
        attributes: attributes || [],
      },
    };
  } catch (err) {
    console.error("Error fetching trending collection data:", err);
    return {
      props: {
        products: [],
        attributes: []
      }
    };
  }
};

export default TrendingCollection;
