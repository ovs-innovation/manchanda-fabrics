import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
//internal import

import Layout from "@layout/Layout";
import useAddToCart from "@hooks/useAddToCart";
import Loading from "@components/preloader/Loading";
import ProductCard from "@components/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import AttributeServices from "@services/AttributeServices";
import ProductServices from "@services/ProductServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import ProductDetailsSection from "@components/product/ProductDetailsSection";
import { notifyError } from "@utils/toast";
import { useSession } from "next-auth/react";

import { getExpectedDeliveryTime } from "@utils/deliveryTime";
import CustomerServices from "@services/CustomerServices";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

import AishaProductHero from "@components/product/AishaProductHero";

const ProductScreen = ({ product, attributes, relatedProducts }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { state: userState } = useContext(UserContext) || {};

  // Get user info from session, context, or cookies
  const cookieUserInfo = (typeof window !== "undefined") ? (() => {
    try { const c = Cookies.get("userInfo"); return c ? JSON.parse(c) : null; } catch (e) { return null; }
  })() : null;



  // also expose a userInfo object for other usages (cookies/context/session)
  const userInfo = session?.user || userState?.userInfo || cookieUserInfo || null;

  const { lang, showingTranslateValue, getNumber, currency, getNumberTwo } =
    useUtilsFunction();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { handleAddItem } = useAddToCart();
  const { globalSetting } = useGetSetting();

  // Handle Product View Tracking
  useEffect(() => {
    if (product?._id) {
      // 1. Backend Tracking (fire and forget)
      ProductServices.addProductView({ productId: product._id }).catch(err =>
        console.error("Tracking view failed", err)
      );

      // 2. Guest LocalStorage Tracking
      if (!session?.user && typeof window !== "undefined") {
        try {
          let history = [];
          const stored = localStorage.getItem("recentlyViewed");
          if (stored) history = JSON.parse(stored);

          // Remove if exists (to move to top)
          history = history.filter(p => p._id !== product._id);

          // Add current
          history.unshift({
            _id: product._id,
            viewedAt: Date.now()
          });

          // Limit to 10
          if (history.length > 10) history = history.slice(0, 10);

          localStorage.setItem("recentlyViewed", JSON.stringify(history));
        } catch (e) {
          console.error("LS Error", e);
        }
      }
    }
  }, [product, session]);

  // react hook

  const [value, setValue] = useState("");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [selectedColorVar, setSelectedColorVar] = useState(null);
  const [stock, setStock] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectVariant, setSelectVariant] = useState({});
  const [selectVa, setSelectVa] = useState({});
  const [variantTitle, setVariantTitle] = useState([]);
  const [, setVariants] = useState([]);
  const [dynamicTitle, setDynamicTitle] = useState("");
  const [dynamicDescription, setDynamicDescription] = useState("");
  const [variantDynamicSections, setVariantDynamicSections] = useState(null);
  const [variantMediaSections, setVariantMediaSections] = useState(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("product-description");
  const [showStickyBottomBar, setShowStickyBottomBar] = useState(false);
  const [, setShareUrl] = useState("");
  const [, setExpectedDeliveryTime] = useState(null);

  // Fetch shipping address if user is logged in
  const { data: shippingAddressData } = useQuery({
    queryKey: ["shippingAddress", { id: userInfo?.id }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userInfo?.id,
      }),
    select: (data) => data?.shippingAddress,
    enabled: !!userInfo?.id,
  });

  // Get product media (images + optional video) - supports up to 5 items
  const productImages = useMemo(() => {
    const media = [];

    // Add images first
    if (Array.isArray(product?.image)) {
      media.push(
        ...product.image.filter(
          (img) => img && typeof img === "string" && img.trim() !== ""
        )
      );
    } else if (product?.image) {
      media.push(product.image);
    }

    // If legacy 'video' field exists, also push it into media array
    if (
      product?.video &&
      typeof product.video === "string" &&
      product.video.trim() !== ""
    ) {
      media.push(product.video);
    }

    return media.slice(0, 5);
  }, [product?.image, product?.video]);

  // Combine Default Color and Color Variants
  const combinedColorVariants = useMemo(() => {
    const list = [];
    if (product?.defaultColorName) {
      list.push({
        colorName: product.defaultColorName,
        colorCode: product.defaultColorCode || "#000000",
        images: productImages || [],
        stock: Number(product.stock) || 0,
        sku: product.sku || "",
        isDefault: true,
      });
    }
    if (product?.colorVariants && Array.isArray(product.colorVariants)) {
      list.push(...product.colorVariants.map(cv => ({ ...cv, isDefault: false })));
    }
    return list;
  }, [product, productImages]);

  // Initialize color variant selection
  useEffect(() => {
    if (combinedColorVariants && combinedColorVariants.length > 0) {
      setSelectedColorVar(combinedColorVariants[0]);
    } else {
      setSelectedColorVar(null);
    }
  }, [combinedColorVariants]);

  // Simple stock derivation to avoid infinite variant loops
  useEffect(() => {
    if (!product) return;
    if (product.defaultColorName || (product.colorVariants && product.colorVariants.length > 0)) return;

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      // sum of variant quantities as overall stock
      const total = product.variants.reduce(
        (sum, v) => sum + (Number(v.quantity) || 0),
        0
      );
      setStock(total);
    } else {
      setStock(Number(product.stock) || 0);
    }
  }, [product]);

  // Update images, active image, and stock based on color variant selection
  useEffect(() => {
    if (selectedColorVar) {
      const imgs = selectedColorVar.images || [];
      const newImages = imgs.length > 0 ? imgs : productImages;
      setCurrentImages(newImages);
      if (newImages.length > 0) {
        setActiveImage(newImages[0]);
      }
      setStock(selectedColorVar.stock);
    }
  }, [selectedColorVar, productImages]);

  // Keep a sharable URL in sync with current selection (includes query params)
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window === "undefined") return;

    // Always take the real browser URL so that we include query params
    setShareUrl(window.location.href);
  }, [router.isReady, router.asPath]);

  // Auto-select first available variant on initial load
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;
    if (!variantTitle || variantTitle.length === 0) return;

    // If we already have any attribute selected, don't override
    if (selectVa && Object.keys(selectVa).some((key) => selectVa[key])) return;

    // Pick first variant with stock > 0, otherwise just first variant
    const firstAvailableVariant =
      product.variants.find((v) => Number(v.quantity) > 0) ||
      product.variants[0];

    if (!firstAvailableVariant) return;

    const initialSelection = {};
    variantTitle.forEach((att) => {
      if (firstAvailableVariant[att._id]) {
        initialSelection[att._id] = firstAvailableVariant[att._id];
      }
    });

    if (Object.keys(initialSelection).length === 0) return;

    // Initialize attribute selection; price/images/stock will be synced
    // by the variant-matching effect below.
    setSelectVa(initialSelection);
    setSelectVariant((prev) =>
      Object.keys(prev || {}).length === 0 ? initialSelection : prev
    );
  }, [product?.variants, variantTitle]);

  useEffect(() => {
    // Trigger when we have variants and some selection
    if (!product?.variants || product.variants.length === 0) return;

    // Check if we have any attribute selection
    const attributeKeys = variantTitle?.map(att => att._id) || [];
    const hasSelection = value || (selectVa && Object.keys(selectVa).length > 0 && attributeKeys.some(key => selectVa[key]));

    if (!hasSelection) {
      return;
    }

    if (hasSelection) {
      // Merge current selectVa with selectVariant to get complete selection
      const mergedSelection = { ...selectVariant, ...selectVa };

      // Filter out non-attribute keys for comparison
      const attributeKeys = variantTitle?.map(att => att._id) || [];

      // If we have attribute keys, filter by them; otherwise use all variants
      let result = product?.variants || [];

      if (attributeKeys.length > 0) {
        result = product?.variants?.filter((variant) => {
          // Check if variant matches all selected attributes
          return attributeKeys.every((attrKey) => {
            const selectedValue = mergedSelection[attrKey];
            // If no selection for this attribute, skip it (allow any value)
            if (!selectedValue) return true;
            return variant[attrKey] === selectedValue;
          });
        }) || [];
      }

      const res = result?.map((item) => {
        const itemCopy = { ...item };
        const keysToDelete = ["originalPrice", "price", "discount", "quantity", "barcode", "sku", "productId", "image", "images", "title", "description"];
        keysToDelete.forEach((key) => {
          delete itemCopy[key];
        });
        return itemCopy;
      });

      const filterKey = Object.keys(Object.assign({}, ...res));
      const selectVar = filterKey?.reduce(
        (obj, key) => ({ ...obj, [key]: mergedSelection[key] || selectVariant[key] }),
        {}
      );
      const newObj = Object.entries(selectVar).reduce(
        (a, [k, v]) => (v ? ((a[k] = v), a) : a),
        {}
      );

      // Find the variant that matches all selected attributes
      let result2 = null;

      if (Object.keys(newObj).length > 0) {
        result2 = result?.find((v) =>
          Object.keys(newObj).every((k) => newObj[k] === v[k])
        );
      } else if (result.length > 0) {
        // If no specific selection, use first matching variant
        result2 = result[0];
      }

      // console.log("result2", result2);
      if (result.length <= 0 || result2 === undefined || result2 === null) {
        // If no exact match, try to find partial match
        if (result.length > 0) {
          result2 = result[0];
        } else {
          setStock(0);
          return;
        }
      }

      setVariants(result);
      const sameVariant =
        result2 && selectVariant && result2._id === selectVariant._id;
      if (!sameVariant) {
        setSelectVariant(result2);
        setSelectVa(result2);
      }

      // Get variant images - prioritize variant images
      let variantImages = [];
      if (Array.isArray(result2?.images) && result2.images.length > 0) {
        variantImages = result2.images;
      } else if (result2?.image) {
        variantImages = [result2.image];
      }

      // If variant has video, add it to images array
      if (result2?.video && typeof result2.video === "string" && result2.video.trim() !== "") {
        if (!variantImages.includes(result2.video)) {
          variantImages.push(result2.video);
        }
      }

      // Combine variant images with other product-level images
      const combinedImages = [...variantImages];
      productImages.forEach(img => {
        if (img && typeof img === "string" && !combinedImages.includes(img)) {
          combinedImages.push(img);
        }
      });
      const variantImage = combinedImages.length > 0
        ? combinedImages[0]
        : (productImages[0] || "");
      setActiveImage(variantImage);
      setCurrentImages(combinedImages);

      setStock(result2?.quantity);
      const price = getNumber(result2?.price);
      const originalPrice = getNumber(result2?.originalPrice);

      // Use actual discount percentage from database (variant discount)
      // Check variant discount first, then fallback to product discount
      const variantDiscount = getNumber(result2?.discount ?? result2?.prices?.discount ?? null);
      const productDiscount = getNumber(product?.prices?.discount ?? 0);
      // Use variant discount if available, otherwise use product discount
      const discount = variantDiscount !== null && variantDiscount !== undefined ? variantDiscount : productDiscount;

      console.log("Discount Debug (result2):", {
        result2: result2,
        result2Discount: result2?.discount,
        result2PricesDiscount: result2?.prices?.discount,
        variantDiscount,
        productDiscount,
        productPricesDiscount: product?.prices?.discount,
        finalDiscount: discount
      });

      setDiscount(discount);
      console.log("Discount state set to:", discount);
      setPrice(price);
      setOriginalPrice(originalPrice);

      // Set dynamic title and description - variant first, then product
      const variantTitleText = showingTranslateValue(result2?.title);
      const variantDescText = showingTranslateValue(result2?.description);
      setDynamicTitle(variantTitleText || showingTranslateValue(product?.title));
      setDynamicDescription(variantDescText || showingTranslateValue(product?.description));

      // Set variant-specific dynamic and media sections
      // Always set if array exists, even if sections have isVisible: false
      setVariantDynamicSections(
        Array.isArray(result2?.dynamicSections) && result2.dynamicSections.length > 0
          ? result2.dynamicSections
          : null
      );
      setVariantMediaSections(
        Array.isArray(result2?.mediaSections) && result2.mediaSections.length > 0
          ? result2.mediaSections
          : null
      );
    } else if (product?.variants?.length > 0) {
      const result = product?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      setVariants(result);

      // Pick first variant with non-zero price, fall back to index 0
      const pricedVariant =
        product.variants.find(
          (v) => getNumber(v?.price ?? 0) > 0
        ) || product.variants[0];

      setStock(pricedVariant?.quantity);
      setSelectVariant(pricedVariant);
      setSelectVa(pricedVariant);

      // Get variant image - handle both variant.image (string) and variant.images (array)
      const firstVariantImageArr =
        Array.isArray(pricedVariant?.images) && pricedVariant.images.length > 0
          ? pricedVariant.images
          : pricedVariant?.image
            ? [pricedVariant.image]
            : [];

      const firstVariantImage =
        firstVariantImageArr[0] || productImages[0] || "";
      setActiveImage(firstVariantImage);
      setCurrentImages(
        firstVariantImageArr.length > 0 ? firstVariantImageArr : productImages
      );

      const rawVariantPrice =
        pricedVariant?.price ?? product?.prices?.price ?? 0;
      const rawVariantOriginal =
        pricedVariant?.originalPrice ??
        product?.prices?.originalPrice ??
        rawVariantPrice;

      const price = getNumber(rawVariantPrice);
      const originalPrice = getNumber(rawVariantOriginal);

      // Use actual discount percentage from database (variant or product discount)
      const variantDiscount = getNumber(pricedVariant?.discount ?? pricedVariant?.prices?.discount ?? null);
      const productDiscount = getNumber(product?.prices?.discount ?? 0);
      // Use variant discount if available, otherwise use product discount
      const discount = variantDiscount !== null && variantDiscount !== undefined ? variantDiscount : productDiscount;

      console.log("Discount Debug (pricedVariant):", {
        pricedVariantDiscount: pricedVariant?.discount,
        pricedVariantPricesDiscount: pricedVariant?.prices?.discount,
        variantDiscount,
        productDiscount,
        finalDiscount: discount
      });

      setDiscount(discount);
      setPrice(price);
      setOriginalPrice(originalPrice);

      // Set dynamic title and description - variant first, then product
      const firstVariantTitleText = showingTranslateValue(pricedVariant?.title);
      const firstVariantDescText = showingTranslateValue(
        pricedVariant?.description
      );
      setDynamicTitle(
        firstVariantTitleText || showingTranslateValue(product?.title)
      );
      setDynamicDescription(
        firstVariantDescText || showingTranslateValue(product?.description)
      );

      // Set variant-specific dynamic and media sections
      setVariantDynamicSections(
        Array.isArray(pricedVariant?.dynamicSections) &&
          pricedVariant.dynamicSections.length > 0
          ? pricedVariant.dynamicSections
          : null
      );
      setVariantMediaSections(
        Array.isArray(pricedVariant?.mediaSections) &&
          pricedVariant.mediaSections.length > 0
          ? pricedVariant.mediaSections
          : null
      );
    } else {
      setStock(product?.stock);
      setActiveImage(productImages[0] || "");

      const baseRawPrice = product?.prices?.price ?? 0;
      const baseRawOriginal =
        product?.prices?.originalPrice ?? baseRawPrice;

      const price = getNumber(baseRawPrice);
      const originalPrice = getNumber(baseRawOriginal);

      // Use actual discount percentage from database (product discount)
      const discount = getNumber(product?.prices?.discount ?? 0);

      console.log("Discount Debug (no variant):", {
        productPricesDiscount: product?.prices?.discount,
        finalDiscount: discount
      });

      setDiscount(discount);
      setPrice(price);
      setOriginalPrice(originalPrice);

      // Set dynamic title and description - use product title/description when no variant
      setDynamicTitle(showingTranslateValue(product?.title));
      setDynamicDescription(showingTranslateValue(product?.description));

      // Reset variant-specific sections when no variant
      setVariantDynamicSections(null);
      setVariantMediaSections(null);
    }
  }, [
    product?.prices?.discount,
    product?.prices?.originalPrice,
    product?.prices?.price,
    product?.stock,
    product.variants,
    selectVa,
    selectVariant,
    value,
    productImages,
    variantTitle,
    showingTranslateValue,
    getNumber,
    product?.title,
    product?.description,
  ]);

  useEffect(() => {
    // Initialize gallery images and active image when product media changes
    const initialImage = productImages[0] || "";
    setActiveImage(initialImage);
    setCurrentImages((prev) =>
      prev && prev.length > 0 ? prev : productImages
    );
    // Initialize dynamic title and description on mount
    if (!dynamicTitle) {
      setDynamicTitle(showingTranslateValue(product?.title));
    }
    if (!dynamicDescription) {
      setDynamicDescription(showingTranslateValue(product?.description));
    }
  }, [productImages]);

  // Calculate expected delivery time
  useEffect(() => {
    const calculateDelivery = async () => {
      try {
        console.log("Calculating delivery time...", {
          hasGlobalSetting: !!globalSetting,
          hasShippingAddress: !!shippingAddressData,
          globalSetting: globalSetting ? {
            hasAddress: !!globalSetting.address,
            hasPostCode: !!globalSetting.post_code
          } : null
        });

        const deliveryTime = await getExpectedDeliveryTime(
          globalSetting,
          shippingAddressData
        );

        console.log("Delivery time result:", deliveryTime);
        setExpectedDeliveryTime(deliveryTime);
      } catch (error) {
        console.error("Error calculating delivery time:", error);
        // Set to null on error so we show the location picker
        setExpectedDeliveryTime(null);
      }
    };

    calculateDelivery();

    const handleLocationUpdate = () => {
      console.log("Location updated event received, recalculating delivery time...");
      calculateDelivery();
    };

    if (typeof window !== "undefined") {
      window.addEventListener('locationUpdated', handleLocationUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('locationUpdated', handleLocationUpdate);
      }
    };
  }, [globalSetting, shippingAddressData]);

  // Additional useEffect to handle variant changes when selectVa changes (for immediate updates on button click)
  useEffect(() => {
    // Only trigger if we have variants
    if (!product?.variants || product.variants.length === 0) return;

    // Get attribute keys
    const attributeKeys = variantTitle?.map(att => att._id) || [];
    if (attributeKeys.length === 0) return;

    // Check if selectVa has any attribute selections
    const hasAttributeSelection = selectVa && Object.keys(selectVa).some(key => attributeKeys.includes(key));

    if (!hasAttributeSelection) return;

    // Find matching variant based on selected attributes
    const matchingVariant = product.variants.find((variant) => {
      return attributeKeys.every((attrKey) => {
        const selectedValue = selectVa[attrKey];
        // If attribute is selected, it must match; if not selected, allow any value
        if (!selectedValue) return true;
        return variant[attrKey] === selectedValue;
      });
    });

    // Compare by SKU or by checking if attributes match
    const isDifferent = !selectVariant ||
      matchingVariant?.sku !== selectVariant?.sku ||
      attributeKeys.some(key => matchingVariant[key] !== selectVariant[key]);

    if (matchingVariant && isDifferent) {
      setSelectVariant(matchingVariant);

      // Update images immediately - prioritize variant images
      let variantImages = [];
      if (Array.isArray(matchingVariant?.images) && matchingVariant.images.length > 0) {
        variantImages = matchingVariant.images;
      } else if (matchingVariant?.image) {
        variantImages = [matchingVariant.image];
      }

      // If variant has video, add it to images array
      if (matchingVariant?.video && typeof matchingVariant.video === "string" && matchingVariant.video.trim() !== "") {
        if (!variantImages.includes(matchingVariant.video)) {
          variantImages.push(matchingVariant.video);
        }
      }

      // Combine variant images with other product-level images
      const combinedImages = [...variantImages];
      productImages.forEach(img => {
        if (img && typeof img === "string" && !combinedImages.includes(img)) {
          combinedImages.push(img);
        }
      });
      const variantImage = combinedImages.length > 0
        ? combinedImages[0]
        : (productImages[0] || "");
      setActiveImage(variantImage);
      setCurrentImages(combinedImages);

      // Update price, stock, etc. immediately
      setStock(matchingVariant?.quantity || 0);
      const price = getNumber(matchingVariant?.price);
      const originalPrice = getNumber(matchingVariant?.originalPrice);

      // Use actual discount percentage from database (variant discount)
      const variantDiscount = getNumber(matchingVariant?.discount ?? matchingVariant?.prices?.discount ?? null);
      const productDiscount = getNumber(product?.prices?.discount ?? 0);
      // Use variant discount if available, otherwise use product discount
      const discount = variantDiscount !== null && variantDiscount !== undefined ? variantDiscount : productDiscount;

      setDiscount(discount);
      setPrice(price);
      setOriginalPrice(originalPrice);

      // Update dynamic title and description immediately
      const variantTitleText = showingTranslateValue(matchingVariant?.title);
      const variantDescText = showingTranslateValue(matchingVariant?.description);
      setDynamicTitle(variantTitleText || showingTranslateValue(product?.title));
      setDynamicDescription(variantDescText || showingTranslateValue(product?.description));

      // Update variant-specific dynamic and media sections immediately
      // Always set if array exists, even if sections have isVisible: false
      setVariantDynamicSections(
        Array.isArray(matchingVariant?.dynamicSections) && matchingVariant.dynamicSections.length > 0
          ? matchingVariant.dynamicSections
          : null
      );
      setVariantMediaSections(
        Array.isArray(matchingVariant?.mediaSections) && matchingVariant.mediaSections.length > 0
          ? matchingVariant.mediaSections
          : null
      );
    }
  }, [selectVa, variantTitle, product?.variants, productImages, showingTranslateValue, getNumber, product?.title, product?.description, selectVariant]);

  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;

    // Get all keys present in the variants
    const variantKeys = Object.keys(Object.assign({}, ...product.variants));

    // Filter out standard keys like _id, title, price, originalPrice, quantity, sku, barcode, images, image, etc.
    const attributeKeys = variantKeys.filter(key =>
      !["_id", "title", "price", "originalPrice", "quantity", "sku", "barcode", "image", "images", "dynamicSections", "mediaSections", "video", "discount"].includes(key)
    );

    // Map each attributeKey to an attribute object (virtual or DB matched)
    const dynamicVarTitle = attributeKeys.map(key => {
      // Find matching attribute in database attributes if exists
      const dbAtt = attributes?.find(att => att._id === key || att.name?.en?.toLowerCase() === key.toLowerCase() || att.title?.en?.toLowerCase() === key.toLowerCase());
      if (dbAtt) return dbAtt;

      // Otherwise build a virtual one dynamically from the variant values
      const values = [...new Set(product.variants.map(v => v[key]).filter(Boolean))];
      return {
        _id: key,
        name: { en: key.charAt(0).toUpperCase() + key.slice(1) },
        title: { en: key.charAt(0).toUpperCase() + key.slice(1) },
        option: "BUTTON",
        variants: values.map(val => ({
          _id: val,
          name: { en: val }
        }))
      };
    });

    setVariantTitle(dynamicVarTitle);
  }, [product?.variants, attributes]);

  useEffect(() => {
    setIsLoading(false);
  }, [product]);

  // Scroll spy to update active tab and show/hide sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "product-description",
        "specification",
        "additional-information",
        "faq"
      ];

      let currentSection = "";
      const isDesktop = window.innerWidth >= 1024;
      // Desktop: Header (~100px) + Tabs (~60px) + Buffer = ~180px
      // Mobile: Header (~64px) + Tabs (~60px) + Buffer = ~140px
      const offset = isDesktop ? 180 : 140;

      // Check if product-description section is reached to show sticky bottom bar (mobile only)
      const productDescriptionElement = document.getElementById("product-description");
      if (productDescriptionElement && !isDesktop) {
        const rect = productDescriptionElement.getBoundingClientRect();
        // Show sticky bottom bar when product description section reaches top
        const shouldShowSticky = rect.top <= offset;
        setShowStickyBottomBar(shouldShowSticky);
      } else {
        setShowStickyBottomBar(false);
      }

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset) {
            currentSection = sectionId;
          }
        }
      }

      if (currentSection) {
        setActiveTab(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll active tab into view when it changes
  useEffect(() => {
    const tabContainer = document.querySelector('.tab-navigation-container');
    if (!tabContainer || !activeTab) return;

    const activeButton = tabContainer.querySelector(`[data-tab="${activeTab}"]`);
    if (activeButton) {
      const containerWidth = tabContainer.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;

      const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      tabContainer.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  const handleAddToCart = (p) => {
    if (stock <= 0) return notifyError("Insufficient stock");

    const hasVariants = product?.variants && product.variants.length > 0;
    if (
      hasVariants &&
      (!selectVariant || Object.keys(selectVariant).length === 0)
    ) {
      return notifyError("Please select all variants first!");
    }

    const updatedProduct = { ...product };
    delete updatedProduct.variants;
    delete updatedProduct.categories;
    delete updatedProduct.description;

    // Ensure we have a valid price
    const currentPrice = price > 0
      ? price
      : getNumber(selectVariant?.price ?? product?.prices?.price ?? 0);

    const currentOriginalPrice = originalPrice > 0
      ? originalPrice
      : getNumber(selectVariant?.originalPrice ?? product?.prices?.originalPrice ?? currentPrice);

    const colorSuffix = selectedColorVar ? `-${selectedColorVar.colorName}` : "";
    const variantSuffix = hasVariants ? `-${variantTitle?.map((att) => selectVariant[att._id]).join("-")}` : "";
    const itemId = `${p._id}${colorSuffix}${variantSuffix}`;

    const baseTitle = dynamicTitle || showingTranslateValue(product?.title);
    const colorText = selectedColorVar ? ` - ${selectedColorVar.colorName}` : "";
    const variantText = hasVariants ? "-" + variantTitle?.map(att => att.variants?.find(v => v._id === selectVariant[att._id])).map(el => showingTranslateValue(el?.name)).join("-") : "";
    const itemTitle = `${baseTitle}${colorText}${variantText}`;

    const newItem = {
      ...updatedProduct,
      isCombination: hasVariants,
      id: itemId,
      title: itemTitle,
      image: selectedColorVar?.images?.[0] || activeImage || product.image?.[0] || product.images?.[0],
      variant: selectVariant,
      color: selectedColorVar?.colorName || undefined,
      colorVariants: product.colorVariants || [],
      price: currentPrice,
      originalPrice: currentOriginalPrice,
    };

    handleAddItem(newItem, quantity);
  };



  const { t } = useTranslation("common");

  const productFaqs = useMemo(() => {
    // Handle new listSectionSchema structure (with items array)
    if (product?.faqs && typeof product.faqs === 'object' && !Array.isArray(product.faqs)) {
      // New structure: { enabled, icon, title, items: [{ key, value }] }
      if (product.faqs.items && Array.isArray(product.faqs.items)) {
        return product.faqs.items
          .filter(
            (item) =>
              item &&
              (item.key || item.value) &&
              (item.key?.trim() || item.value?.trim()) &&
              product.faqs.enabled !== false
          )
          .map((item) => ({
            question: item.key || item.value || "",
            answer: item.value || item.key || "",
            answerType: "custom",
            isVisible: true,
          }));
      }
      return [];
    }

    // Handle old array structure (backward compatibility)
    if (Array.isArray(product?.faqs)) {
      return product.faqs.filter(
        (faq) =>
          faq &&
          faq?.question &&
          faq.question.trim() !== "" &&
          faq?.isVisible !== false
      );
    }

    return [];
  }, [product?.faqs]);

  // category name slug
  const category_name = (showingTranslateValue(product?.category?.name) || "")
    .toLowerCase()
    .replace(/[^A-Z0-9]+/gi, "-");

  const categoryRelatedProducts = useMemo(() => {
    const currentId = product?._id?.toString();
    const currentSlug = router.query?.slug;
    return (relatedProducts || []).filter(
      (p) =>
        p?._id?.toString() !== currentId &&
        p?.slug !== currentSlug
    );
  }, [relatedProducts, product?._id, router.query?.slug]);



  // NOTE: Variant URL syncing disabled to avoid navigation loops during Buy Now flow.
  // If you want to re-enable deep-linking by variant, restore the previous
  // useEffects that read/write variant params from/to the URL.

  // console.log("discount", discount);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const rect = element.getBoundingClientRect();
      // Header is approx 80-100px. Tabs are 50-60px. Total ~140-160px. 
      // Using 180px provides a safe buffer so the title is clearly visible.
      const offset = 180;
      const targetPosition = window.pageYOffset + rect.top - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout
          title={dynamicTitle || showingTranslateValue(product?.title)}
          description={dynamicDescription || showingTranslateValue(product.description)}
        >
          <div className="bg-white py-8 lg:py-12">
            <div className="mx-auto px-6 sm:px-12 lg:px-16 max-w-screen-2xl">
              <div className="flex items-center pb-6 justify-between gap-4">
                <nav className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                  <Link href="/" className="hover:text-[#111111] transition-colors flex items-center">
                    Home
                  </Link>
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                  <Link
                    href={`/collections/${category_name}?_id=${product?.category?._id}`}
                    className="hover:text-[#111111] transition-colors hover:underline"
                  >
                    {category_name}
                  </Link>
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-semibold truncate max-w-[150px] sm:max-w-xs">
                    {dynamicTitle || showingTranslateValue(product?.title)}
                  </span>
                </nav>
              </div>
              <AishaProductHero
                product={{ ...product, colorVariants: combinedColorVariants }}
                dynamicTitle={dynamicTitle}
                dynamicDescription={dynamicDescription}
                productImages={productImages}
                currentImages={currentImages}
                price={price}
                originalPrice={originalPrice}
                discount={discount}
                currency={currency}
                stock={stock}
                variantTitle={variantTitle}
                selectVariant={selectVariant}
                selectVa={selectVa}
                setValue={setValue}
                setSelectVa={setSelectVa}
                setSelectVariant={setSelectVariant}
                lang={lang}
                showingTranslateValue={showingTranslateValue}
                getNumber={getNumber}
                categoryName={category_name}
                categoryId={product?.category?._id}
                onAddToCart={() => handleAddToCart(product)}
                quantity={quantity}
                onQuantityChange={setQuantity}
                selectedColorVar={selectedColorVar}
                setSelectedColorVar={setSelectedColorVar}
                t={t}
              />

              <div className="mt-16 max-w-4xl">
                          {/* Product Highlights Section */}
                          {product?.productHighlights?.enabled !== false && product?.productHighlights?.items?.length > 0 && (
                            <div className="mt-8 border border-neutral-200/60 rounded-lg p-6 bg-white">
                              <div className="flex items-center gap-3 mb-4">
                                {product.productHighlights.icon && (
                                  <img src={product.productHighlights.icon} alt="" className="w-10 h-10" />
                                )}
                                <h2 className="text-xl font-semibold text-gray-800">
                                  {product.productHighlights.title || "Product Highlights"}
                                </h2>
                              </div>
                              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 text-justify">
                                {product.productHighlights.items.map((item, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Premium Tab Navigation */}
                          <div className="sticky top-16 lg:top-[80px] z-40 bg-white/80 backdrop-blur-md mt-12 mb-8 py-1 border-b border-neutral-200/50 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]">
                            <div className="max-w-screen-2xl mx-auto px-4 lg:px-12">
                              <div className="flex gap-6 overflow-x-auto tab-navigation-container">
                                {product?.productDescription?.enabled !== false && (
                                  <button
                                    data-tab="product-description"
                                    onClick={() => handleTabClick("product-description")}
                                    className={`relative py-4 text-sm font-bold transition-all whitespace-nowrap ${activeTab === "product-description"
                                        ? "text-[#111111]"
                                        : "text-gray-400 hover:text-gray-600"
                                      }`}
                                  >
                                    Description
                                    {activeTab === "product-description" && (
                                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#111111]" />
                                    )}
                                  </button>
                                )}
                                {product?.dynamicSections?.some(s => s?.name?.toLowerCase().includes("specification")) && (
                                  <button
                                    data-tab="specification"
                                    onClick={() => handleTabClick("specification")}
                                    className={`relative py-4 text-sm font-bold transition-all whitespace-nowrap ${activeTab === "specification"
                                        ? "text-[#111111]"
                                        : "text-gray-400 hover:text-gray-600"
                                      }`}
                                  >
                                    Specification
                                    {activeTab === "specification" && (
                                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#111111]" />
                                    )}
                                  </button>
                                )}
                                {productFaqs.length > 0 && (
                                  <button
                                    data-tab="faq"
                                    onClick={() => handleTabClick("faq")}
                                    className={`relative py-4 text-sm font-bold transition-all whitespace-nowrap ${activeTab === "faq"
                                        ? "text-[#111111]"
                                        : "text-gray-400 hover:text-gray-600"
                                      }`}
                                  >
                                    FAQs
                                    {activeTab === "faq" && (
                                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#111111]" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Product Description Section */}
                          {product?.productDescription?.enabled !== false && product?.productDescription?.description && (
                            <div id="product-description" className="mt-8 py-6 bg-transparent">
                              <div className="flex items-center gap-3 mb-4">
                                {product.productDescription.icon && (
                                  <img src={product.productDescription.icon} alt="" className="w-10 h-10" />
                                )}
                                <h2 className="text-xl font-semibold text-gray-800">
                                  {product.productDescription.title || "Product Description"} of {dynamicTitle || showingTranslateValue(product?.title)}
                                </h2>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                {product.productDescription.description}
                              </p>
                            </div>
                          )}

                          {/* Specification Section */}
                          {product?.dynamicSections?.some(s => s?.name?.toLowerCase().includes("specification")) && (
                            <div id="specification" className="mt-8 py-6 bg-transparent">
                              {product.dynamicSections
                                .filter(s => s?.name?.toLowerCase().includes("specification"))
                                .map((section, idx) => (
                                  <div key={idx} className="mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                      <h2 className="text-xl font-semibold text-gray-800">
                                        {section.name} of {dynamicTitle || showingTranslateValue(product?.title)}
                                      </h2>
                                    </div>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 text-justify">
                                      {section.subsections
                                        ?.filter(sub => sub?.type !== "paragraph" && (sub?.key || sub?.value))
                                        .map((sub, subIdx) => (
                                          <li key={subIdx}>
                                            <strong>{sub.key || sub.title}:</strong> {sub.value || sub.content}
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Additional Information Section */}
                          {product?.additionalInformation?.enabled !== false && product?.additionalInformation?.subsections?.length > 0 && (
                            <div id="additional-information" className="mt-8 py-6 bg-transparent">
                              <div className="flex items-center gap-3 mb-4">
                                {product.additionalInformation.icon && (
                                  <img src={product.additionalInformation.icon} alt="" className="w-10 h-10" />
                                )}
                                <h2 className="text-xl font-semibold text-gray-800">
                                  {product.additionalInformation.title || "Additional Information"}
                                </h2>
                              </div>
                              <div className="space-y-6">
                                {product.additionalInformation.subsections.map((subsection, idx) => (
                                  <div key={idx} className="bg-transparent py-4 border-b border-neutral-200/60 last:border-none">
                                    <h3 className="inline-block px-3 py-1 mb-3 text-sm font-semibold text-[#111111] bg-neutral-100 rounded-full">
                                      {subsection.label}
                                    </h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 text-justify">
                                      {subsection.items.map((item, itemIdx) => (
                                        <li key={itemIdx} className="leading-relaxed">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Product Details Section (Dynamic & Media) */}
                          <ProductDetailsSection
                            dynamicSections={variantDynamicSections || product?.dynamicSections}
                            mediaSections={variantMediaSections || product?.mediaSections}
                            selectedAttributes={selectVa || selectVariant || {}}
                            isVariantSpecific={!!variantDynamicSections}
                          />


                          {/* Modern FAQ Section */}
                          {productFaqs.length > 0 && (
                            <div id="faq" className="mt-12 py-8 bg-transparent">
                              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-[#111111] rounded-full" />
                                {product?.faqs?.title || (product?.faqTitle && product.faqTitle.trim().length
                                  ? product.faqTitle
                                  : t("frequentlyAskedQuestions") ||
                                  "Common Questions")}
                              </h3>
                              <div className="space-y-4">
                                {productFaqs.map((faq, index) => {
                                  const isOpen = activeFaqIndex === index;
                                  return (
                                    <div key={`${faq.question}-${index}`} className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'border-neutral-300 bg-neutral-50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/50'}`}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveFaqIndex(isOpen ? null : index)
                                        }
                                        className="w-full flex items-center justify-between text-left px-6 py-5 focus:outline-none"
                                      >
                                        <span className="text-base font-bold text-gray-800 pr-4">
                                          {faq.question}
                                        </span>
                                        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#111111]' : 'text-gray-400'}`}>
                                          <FiChevronDown className="w-5 h-5" />
                                        </span>
                                      </button>
                                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-store-100/50 pt-4">
                                          {faq.answerType === "yes" || faq.answerType === "no"
                                            ? faq.answer
                                            : faq.answer || faq.customAnswer || ""}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}


                          {/* Manufacturer Details Section */}
                          {product?.manufacturerDetails?.enabled !== false && product?.manufacturerDetails?.items?.length > 0 && (
                            <div className="mt-8 py-6 bg-transparent">
                              <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {product?.manufacturerDetails?.title || "Manufacturer details"}
                              </h3>
                              <div className="space-y-2 text-sm text-gray-600 text-justify">
                                {product.manufacturerDetails.items.map((item, idx) => (
                                  <p key={idx} className="leading-relaxed">
                                    {item}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Disclaimer Section */}
                          {product?.disclaimer?.enabled !== false && product?.disclaimer?.description && (
                            <div className="mt-2 py-6 bg-transparent">
                              <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {product?.disclaimer?.title || "Disclaimer"}
                              </h3>
                              <div className="text-sm text-gray-600 leading-relaxed text-justify">
                                <p className="leading-relaxed">
                                  {typeof product.disclaimer.description === 'object' && product.disclaimer.description !== null
                                    ? showingTranslateValue(product.disclaimer.description)
                                    : product.disclaimer.description}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Contact Section */}
                          {/* <div className="mt-4 p-6 bg-white">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                              In case of any issues, contact us:
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              {(() => {
                                // Try storeCustomizationSetting first, then fallback to globalSetting
                                // Get email - handle both translated object and plain string
                                const emailRaw = storeCustomizationSetting?.contact_us?.email_box_email || globalSetting?.email;
                                const email = emailRaw 
                                  ? (typeof emailRaw === 'object' && emailRaw !== null && !Array.isArray(emailRaw) ? showingTranslateValue(emailRaw) : (typeof emailRaw === 'string' ? emailRaw : ""))
                                  : "";
                                
                                // Get phone - handle both translated object and plain string
                                const phoneRaw = storeCustomizationSetting?.contact_us?.call_box_phone || globalSetting?.contact;
                                const phone = phoneRaw 
                                  ? (typeof phoneRaw === 'object' && phoneRaw !== null && !Array.isArray(phoneRaw) ? showingTranslateValue(phoneRaw) : (typeof phoneRaw === 'string' ? phoneRaw : ""))
                                  : "";
                                
                                // Get address - handle both translated object and plain string
                                const addressRaw = storeCustomizationSetting?.contact_us?.address_box_address_one || globalSetting?.address;
                                const address = addressRaw 
                                  ? (typeof addressRaw === 'object' && addressRaw !== null && !Array.isArray(addressRaw) ? showingTranslateValue(addressRaw) : (typeof addressRaw === 'string' ? addressRaw : ""))
                                  : "";
                                
                                return (
                                  <>
                                    {(email || phone) ? (
                                      <p className="leading-relaxed">
                                        {email && (
                                          <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
                                            {email}
                                          </a>
                                        )}
                                        {email && phone && " | "}
                                        {phone && (
                                          <a href={`tel:${phone}`} className="text-blue-600 hover:text-blue-800">
                                            {phone}
                                          </a>
                                        )}
                                      </p>
                                    ) : null}
                                    {address ? (
                                      <p className="leading-relaxed">
                                        Address: {address}
                                      </p>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </div>
                          </div> */}

                          {/* Enhanced Sticky Bottom Bar (Mobile only) */}
                          {showStickyBottomBar && (
                            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-t border-neutral-200/50 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] lg:hidden transition-all duration-300 slide-up">
                              <div className="max-w-screen-2xl mx-auto px-5 py-4">
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-xs font-bold text-gray-500 truncate mb-1.5 uppercase tracking-wider">
                                      {dynamicTitle || showingTranslateValue(product?.title)}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black text-gray-900 tracking-tight">
                                        {currency}
                                        {getNumberTwo(
                                          price > 0 ? price : getNumber((product?.variants?.[0]?.price ?? product?.prices?.price) || 0)
                                        )}
                                      </span>
                                      {discount > 0 && (
                                        <span className="text-xs font-bold text-green-600">
                                          ({discount}% OFF)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    type="button"
                                    className="flex-shrink-0 h-12 px-8 text-sm font-semibold uppercase tracking-[0.14em] flex items-center justify-center bg-[#111111] text-white active:scale-95 transition-all"
                                  >
                                    Add To Cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

              </div>

              {/* Variant Specification Section */}
              {/* {product?.variants && product.variants.length > 0 && (
                <div className="mt-8 pt-8">
                  <VariantSpecification
                    variants={product.variants}
                    variantTitle={variantTitle}
                    attributes={attributes}
                    onVariantSelect={(variant) => {
                      setSelectVariant(variant);
                      setSelectVa(variant);
                      const variantImages = Array.isArray(variant?.images) 
                        ? variant.images 
                        : (variant?.image ? [variant.image] : []);
                      setActiveImage(variantImages[0] || productImages[0] || "");
                      setStock(variant?.quantity || 0);
                      const price = getNumber(variant?.price);
                      const originalPrice = getNumber(variant?.originalPrice);
                      const discountPercentage = getNumber(
                        ((originalPrice - price) / originalPrice) * 100
                      );
                      setDiscount(getNumber(discountPercentage));
                      setPrice(price);
                      setOriginalPrice(originalPrice);
                      
                      // Update dynamic title and description - variant first, then product
                      const variantTitleText = showingTranslateValue(variant?.title);
                      const variantDescText = showingTranslateValue(variant?.description);
                      setDynamicTitle(variantTitleText || showingTranslateValue(product?.title));
                      setDynamicDescription(variantDescText || showingTranslateValue(product?.description));
                    }}
                    selectedVariant={selectVariant}
                  />
                </div>
              )} */}



              {/* Related products — same category */}
              {categoryRelatedProducts.length > 0 && (
                <div className="pt-12 lg:pt-16 pb-10 border-t border-neutral-200 mt-12">
                  <h3
                    className="text-2xl sm:text-3xl font-semibold text-[#111111] mb-8 text-center"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {t("relatedProducts")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
                    {categoryRelatedProducts.slice(0, 12).map((relatedProduct) => (
                      <ProductCard
                        key={relatedProduct._id}
                        product={relatedProduct}
                        attributes={attributes}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

// you can use getServerSideProps alternative for getStaticProps and getStaticPaths

export const getServerSideProps = async (context) => {
  const { slug } = context.params;

  const [data, attributes] = await Promise.all([
    ProductServices.getShowingStoreProducts({
      category: "",
      slug: slug,
    }),

    AttributeServices.getShowingAttributes({}),
  ]);
  let product = {};

  if (slug) {
    product = data?.products?.find((p) => p.slug === slug);
  }

  return {
    props: {
      product,
      attributes,
      relatedProducts: data?.relatedProducts,
    },
  };
};

export default ProductScreen;

