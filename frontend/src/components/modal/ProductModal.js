import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

//internal import
import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import Tags from "@components/common/Tags";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import MainModal from "@components/modal/MainModal";
import Discount from "@components/common/Discount";
import { PRODUCT_PLACEHOLDER } from "@utils/brandAssets";
import VariantList from "@components/variants/VariantList";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import { handleLogEvent } from "src/lib/analytics";
import ProductServices from "@services/ProductServices";

const ProductModal = ({
  modalOpen,
  setModalOpen,
  product,
  attributes,
  currency,
}) => {
  const router = useRouter();
  const { setIsLoading, isLoading } = useContext(SidebarContext);
  const { t } = useTranslation("ns1");

  const { handleAddItem, setItem, item } = useAddToCart();
  const { lang, showingTranslateValue, getNumber, getNumberTwo } =
    useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  // Get dynamic contact number
  const contactNumber =

    storeCustomizationSetting?.footer?.bottom_contact ||
    globalSetting?.contact ||
    "+0044235234";

  // react hook
  const [gajjiProducts, setGajjiProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [value, setValue] = useState("");
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectVariant, setSelectVariant] = useState({});
  const [selectVa, setSelectVa] = useState({});
  const [variantTitle, setVariantTitle] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (modalOpen && gajjiProducts.length === 0) {
      ProductServices.getShowingStoreProducts({ category: "gaji-silk" })
        .then((res) => {
          const list = res?.products || [];
          setGajjiProducts(list);
        })
        .catch((err) => console.error("Error fetching Gaji Silk products:", err));
    }
  }, [modalOpen, gajjiProducts.length]);

  useEffect(() => {
    if (gajjiProducts.length > 0 && product) {
      const productSeed = product._id || product.slug || "";
      const seedSum = productSeed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = seedSum % gajjiProducts.length;
      setActiveProduct(gajjiProducts[index]);
    } else {
      setActiveProduct(null);
    }
  }, [gajjiProducts, product]);

  useEffect(() => {
    // console.log('value', value, activeProduct);
    if (!activeProduct) return;
    if (value) {
      const result = activeProduct?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      const res = result?.map(
        ({
          originalPrice,
          price,
          discount,
          quantity,
          barcode,
          sku,
          productId,
          image,
          ...rest
        }) => ({
          ...rest,
        })
      );

      const filterKey = Object.keys(Object.assign({}, ...res));
      const selectVar = filterKey?.reduce(
        (obj, key) => ({ ...obj, [key]: selectVariant[key] }),
        {}
      );
      const newObj = Object.entries(selectVar).reduce(
        (a, [k, v]) => (v ? ((a[k] = v), a) : a),
        {}
      );

      const result2 = result?.find((v) =>
        Object.keys(newObj).every((k) => newObj[k] === v[k])
      );

      // console.log("result2", result2);

      if (result.length <= 0 || result2 === undefined) return setStock(0);

      setVariants(result);
      setSelectVariant(result2);
      setSelectVa(result2);
      setImg(result2?.image);
      setStock(result2?.quantity);
      const variantPrice = getNumber(result2?.price);
      const variantOriginalPrice = getNumber(result2?.originalPrice);
      const discountPercentage = getNumber(((variantOriginalPrice - variantPrice) / (variantOriginalPrice || variantPrice)) * 100);
      setDiscount(getNumber(discountPercentage));
      setPrice(variantPrice);
      setOriginalPrice(variantOriginalPrice);
    } else if (activeProduct?.variants?.length > 0) {
      const result = activeProduct?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      setVariants(result);
      setStock(activeProduct.variants[0]?.quantity);
      setSelectVariant(activeProduct.variants[0]);
      setSelectVa(activeProduct.variants[0]);
      setImg(activeProduct.variants[0]?.image);
      const variantPrice0 = getNumber(activeProduct.variants[0]?.price);
      const variantOriginalPrice0 = getNumber(activeProduct.variants[0]?.originalPrice);
      const discountPercentage0 = getNumber(((variantOriginalPrice0 - variantPrice0) / (variantOriginalPrice0 || variantPrice0)) * 100);
      setDiscount(getNumber(discountPercentage0));
      setPrice(variantPrice0);
      setOriginalPrice(variantOriginalPrice0);
    } else {
      setStock(activeProduct?.stock);
      setImg(activeProduct?.image?.[0] || activeProduct?.images?.[0]);
      const retailPrice = getNumber(activeProduct?.prices?.price);
      const retailOriginalPrice = getNumber(activeProduct?.prices?.originalPrice);
      const discountPercentage = getNumber(((retailOriginalPrice - retailPrice) / (retailOriginalPrice || retailPrice)) * 100);
      setDiscount(getNumber(discountPercentage));
      setPrice(retailPrice);
      setOriginalPrice(retailOriginalPrice);
    }
  }, [
    activeProduct?.prices?.discount,
    activeProduct?.prices?.originalPrice,
    activeProduct?.prices?.price,
    activeProduct?.stock,
    activeProduct?.variants,
    selectVa,
    selectVariant,
    value,
    activeProduct,
  ]);
  // console.log("activeProduct", activeProduct);

  useEffect(() => {
    if (!activeProduct) return;
    const res = Object.keys(Object.assign({}, ...activeProduct?.variants));

    const varTitle = attributes?.filter((att) => res.includes(att?._id));

    setVariantTitle(varTitle?.sort());
  }, [variants, attributes, activeProduct]);

  const handleAddToCart = (p) => {
    try {
      if (stock <= 0) {
        return notifyError("Insufficient stock");
      }

      const hasVariants = activeProduct?.variants && activeProduct.variants.length > 0;
      if (
        hasVariants &&
        (!selectVariant || Object.keys(selectVariant).length === 0)
      ) {
        return notifyError("Please select all variant first!");
      }

      const { variants, categories, description, ...updatedProduct } = activeProduct;
      const priceToUse = !hasVariants ? getNumber(p?.prices?.price) : getNumber(price);
      const originalToUse = !hasVariants ? getNumber(p?.prices?.originalPrice) : getNumber(originalPrice);

      const newItem = {
        ...updatedProduct,
        isCombination: hasVariants,
        id: `${!hasVariants
          ? p._id
          : p._id +
          "-" +
          variantTitle?.map((att) => selectVariant[att._id]).join("-")
          }`,
        title: `${!hasVariants
          ? showingTranslateValue(p.title)
          : showingTranslateValue(p.title) +
          "-" +
          variantTitle
            ?.map((att) =>
              att.variants?.find((v) => v._id === selectVariant[att._id])
            )
            .map((el) => showingTranslateValue(el?.name))
          }`,
        image: img || p?.image?.[0] || p?.images?.[0] || PRODUCT_PLACEHOLDER,
        variant: selectVariant || {},
        price: priceToUse,
        originalPrice: originalToUse,
        mrp: originalToUse,
        stock: stock,
      };

      console.log("ProductModal: Adding to cart newItem:", newItem);
      handleAddItem(newItem, item);
    } catch (err) {
      console.error("ProductModal: handleAddToCart failed:", err);
    }
  };

  const handleMoreInfo = (slug) => {
    setModalOpen(false);

    router.push(`/product/${slug}`);
    setIsLoading(!isLoading);
    handleLogEvent("product", `opened ${slug} product details`);
  };

  if (!activeProduct) {
    return (
      <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <div className="inline-block overflow-hidden h-[300px] align-middle transition-all transform bg-white shadow-xl rounded-2xl w-full max-w-4xl p-10 flex items-center justify-center text-center text-gray-500 font-serif">
          Loading Gajji Silk details...
        </div>
      </MainModal>
    );
  }

  const category_name = showingTranslateValue(activeProduct?.category?.name)
    ?.toLowerCase()
    ?.replace(/[^A-Z0-9]+/gi, "-");

  // console.log("activeProduct", activeProduct, "stock", stock);

  return (
    <>
      <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <div className="inline-block overflow-y-auto h-full align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col lg:flex-row md:flex-row w-full max-w-4xl overflow-hidden">
            <Link href={`/product/${activeProduct.slug}`} passHref>
              <div
                onClick={() => setModalOpen(false)}
                className="flex-shrink-0 flex items-center justify-center h-auto cursor-pointer"
              >
                <Discount product={activeProduct} discount={discount} modal />
                {activeProduct.image[0] ? (
                  <Image
                    src={img || activeProduct.image[0]}
                    width={420}
                    height={420}
                    alt="product"
                  />
                ) : (
                  <Image
                    src={PRODUCT_PLACEHOLDER}
                    width={420}
                    height={420}
                    alt="product Image"
                  />
                )}
              </div>
            </Link>

            <div className="w-full flex flex-col p-5 md:p-8 text-left">
              <div className="mb-2 md:mb-2.5 block -mt-1.5">
                <Link href={`/product/${activeProduct.slug}`} passHref>
                  <h1
                    onClick={() => setModalOpen(false)}
                    className="text-heading text-lg md:text-xl lg:text-2xl font-semibold font-serif hover:text-black cursor-pointer"
                  >
                    {showingTranslateValue(activeProduct?.title)}
                  </h1>
                </Link>
                <div
                  className={`${stock <= 0 ? "relative py-1 mb-2" : "relative"
                    }`}
                >
                  <Stock stock={stock} />
                </div>
              </div>
              <p className="text-sm leading-6 text-gray-500 md:leading-6">
                {showingTranslateValue(activeProduct?.description)}
              </p>
              <div className="flex items-center my-4">
                <Price
                  product={activeProduct}
                  price={price}
                  currency={currency}
                  originalPrice={originalPrice}
                />
              </div>


              <div className="mb-6 space-y-4">
                {variantTitle?.map((a, i) => (
                  <span key={a._id}>
                    <h4 className="text-sm py-1 font-serif text-gray-700 font-bold">
                      {showingTranslateValue(a?.name)}:
                    </h4>
                    <div className="flex flex-row mb-3">
                      <VariantList
                        att={a._id}
                        lang={lang}
                        option={a.option}
                        setValue={setValue}
                        varTitle={variantTitle}
                        variants={activeProduct?.variants}
                        setSelectVa={setSelectVa}
                        selectVariant={selectVariant}
                        setSelectVariant={setSelectVariant}
                      />
                    </div>
                  </span>
                ))}
              </div>

              <div className="flex items-center mt-4">
                <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                  <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border h-11 md:h-12 border-gray-300">
                    <button
                      onClick={() => setItem(Math.max(item - 1, 1))}
                      disabled={item <= 1}
                      className="flex items-center justify-center flex-shrink-0 h-full transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-base">
                        <FiMinus />
                      </span>
                    </button>
                    <p className="font-semibold flex items-center justify-center h-full  transition-colors duration-250 ease-in-out cursor-default flex-shrink-0 text-base text-heading w-8  md:w-20 xl:w-24">
                      {item}
                    </p>
                    <button
                      onClick={() => setItem(Math.min(item + 1, stock || 0))}
                      disabled={item >= (stock || 0)}
                      className="flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-base">
                        <FiPlus />
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAddToCart(activeProduct);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={stock < 1}
                    className={`text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-white px-4 ml-4 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 hover:text-white bg-${storeCustomizationSetting?.theme?.color || 'green'}-500 hover:bg-${storeCustomizationSetting?.theme?.color || 'green'}-600 w-full h-12`}
                  >
                    {stock < 1 ? t("common:soldOut") || "Sold Out" : t("common:addToCart")}
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                  <div>
                    <span className="font-serif font-semibold py-1 text-sm d-block">
                      <span className="text-gray-700">
                        {t("common:category")}:
                      </span>{" "}
                      <Link
                        href={`/collections/${category_name}?_id=${activeProduct?.category?._id}`}
                      >
                        <button
                          type="button"
                          className="text-gray-600 font-serif font-medium underline ml-2 hover:text-teal-600"
                          onClick={() => setIsLoading(!isLoading)}
                        >
                          {category_name}
                        </button>
                      </Link>
                    </span>

                    <Tags product={activeProduct} />
                  </div>

                  <div>
                    <button
                      onClick={() => handleMoreInfo(activeProduct.slug)}
                      className="font-sans font-medium text-sm text-orange-500"
                    >
                      {t("common:moreInfo")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Call Us To Order By Mobile Number :{" "}
                  <a
                    href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                    className="text-store-500 font-semibold hover:text-store-600 hover:underline"
                  >
                    {contactNumber}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default ProductModal;
