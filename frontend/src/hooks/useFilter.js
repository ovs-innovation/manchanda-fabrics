import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";
import useUtilsFunction from "@hooks/useUtilsFunction";

const useFilter = (data, allCategories = [], defaultSelectedCategories = []) => {
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [processing, setProcessing] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [sortedField, setSortedField] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedCategories, setSelectedCategories] = useState(defaultSelectedCategories || []);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const { showingTranslateValue } = useUtilsFunction();

  // Get search query from router
  const searchQuery = router.query?.query || "";
  
  // Initialize sortedField from URL when router is ready
  useEffect(() => {
    if (router.isReady && router.query?.sort && !sortedField) {
      setSortedField(router.query.sort);
    } else if (router.isReady && !router.query?.sort && !sortedField) {
      setSortedField("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // console.log("sortedfield", sortedField, data);

  const productData = useMemo(() => {
    let services = data || [];

    // Filter by Search Query (Category Name or Product Title)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      services = services.filter((product) => {
        // Search in product title
        const productTitle = showingTranslateValue(product?.title)?.toLowerCase() || "";
        if (productTitle.includes(query)) return true;

        // Search in category name
        const categoryName = showingTranslateValue(product?.category?.name)?.toLowerCase() || "";
        if (categoryName.includes(query)) return true;

        // Search in categories array (multiple categories)
        if (product?.categories && Array.isArray(product.categories)) {
          const categoryMatch = product.categories.some((cat) => {
            const catName = showingTranslateValue(cat?.name)?.toLowerCase() || "";
            return catName.includes(query);
          });
          if (categoryMatch) return true;
        }

        return false;
      });
    }

    // Filter by Category
    if (selectedCategories.length > 0) {
      const cleanStr = (val) => (val ? String(val).toLowerCase().replace(/[^a-z0-9]/g, "") : "");
      const reduceConsonants = (val) => (val ? cleanStr(val).replace(/([a-z])\1+/g, "$1") : "");
      
      const flattenAllCats = (list = []) => {
        const flattened = [];
        const walk = (items) => {
          if (!Array.isArray(items)) return;
          for (const item of items) {
            if (!item) continue;
            flattened.push(item);
            if (Array.isArray(item.children) && item.children.length > 0) {
              walk(item.children);
            }
          }
        };
        walk(list);
        return flattened;
      };

      const flattenedCategories = flattenAllCats(allCategories);

      // Build expanded sets of target identifiers
      const targetExactSet = new Set();
      const targetCleanSet = new Set();
      const targetReducedSet = new Set();

      const addTarget = (val) => {
        if (!val) return;
        const str = String(val).toLowerCase().trim();
        targetExactSet.add(str);
        const clean = cleanStr(str);
        if (clean) targetCleanSet.add(clean);
        const reduced = reduceConsonants(str);
        if (reduced) targetReducedSet.add(reduced);
      };

      selectedCategories.forEach((selectedId) => {
        if (!selectedId) return;
        addTarget(selectedId);

        const selClean = cleanStr(selectedId);
        const selReduced = reduceConsonants(selectedId);

        flattenedCategories.forEach((cat) => {
          const catId = String(cat._id || "").toLowerCase();
          const catSlug = String(cat.slug || "").toLowerCase();
          const catEn = String(cat.name?.en || cat.name || "").toLowerCase();
          const catHi = String(cat.name?.hi || "").toLowerCase();

          const isMatch =
            catId === String(selectedId).toLowerCase() ||
            (catSlug && catSlug === String(selectedId).toLowerCase()) ||
            (catSlug && cleanStr(catSlug) === selClean) ||
            (catEn && cleanStr(catEn) === selClean) ||
            (catSlug && reduceConsonants(catSlug) === selReduced) ||
            (catEn && reduceConsonants(catEn) === selReduced);

          if (isMatch) {
            addTarget(cat._id);
            addTarget(cat.slug);
            addTarget(cat.name?.en || cat.name);
            addTarget(cat.name?.hi);
            if (Array.isArray(cat.children)) {
              cat.children.forEach((child) => {
                addTarget(child._id);
                addTarget(child.slug);
                addTarget(child.name?.en || child.name);
              });
            }
          }
        });
      });

      services = services.filter((product) => {
        const prodExactSet = new Set();
        const prodCleanSet = new Set();
        const prodReducedSet = new Set();

        const addProdVal = (val) => {
          if (!val) return;
          const str = String(val).toLowerCase().trim();
          prodExactSet.add(str);
          const clean = cleanStr(str);
          if (clean) prodCleanSet.add(clean);
          const reduced = reduceConsonants(str);
          if (reduced) prodReducedSet.add(reduced);
        };

        const processCatRef = (c) => {
          if (!c) return;
          const id = (c._id || c).toString();
          addProdVal(id);
          if (c.slug) addProdVal(c.slug);
          if (c.name) {
            addProdVal(c.name.en || c.name);
            addProdVal(c.name.hi);
          }
          const matchedMeta = flattenedCategories.find((meta) => String(meta._id) === id);
          if (matchedMeta) {
            addProdVal(matchedMeta.slug);
            addProdVal(matchedMeta.name?.en || matchedMeta.name);
            addProdVal(matchedMeta.name?.hi);
          }
        };

        if (product.category) processCatRef(product.category);
        if (product.categorySlug) addProdVal(product.categorySlug);
        if (product.categoryName) addProdVal(product.categoryName);
        if (Array.isArray(product.categories)) {
          product.categories.forEach(processCatRef);
        }

        for (const item of targetExactSet) {
          if (prodExactSet.has(item)) return true;
        }
        for (const item of targetCleanSet) {
          if (prodCleanSet.has(item)) return true;
        }
        for (const item of targetReducedSet) {
          if (prodReducedSet.has(item)) return true;
        }

        return false;
      });
    }

    // Filter by Price
    services = services.filter(
      (product) =>
        product.prices?.price >= priceRange.min &&
        product.prices?.price <= priceRange.max
    );

    // Filter by Rating
    if (selectedRating > 0) {
      services = services.filter(
        (product) => (product.averageRating || 0) >= selectedRating
      );
    }

    // Filter by Discount
    if (selectedDiscount > 0) {
      services = services.filter(
        (product) => (product.prices?.discount || 0) >= selectedDiscount
      );
    }

    // Filter by Color
    if (selectedColor) {
      services = services.filter((product) => {
        const matchesDefault = product.defaultColorName?.toLowerCase() === selectedColor.toLowerCase();
        const matchesVariants = Array.isArray(product.colorVariants) && product.colorVariants.some(
          (cv) => cv.colorName?.toLowerCase() === selectedColor.toLowerCase()
        );
        return matchesDefault || matchesVariants;
      });
    }

    //filter user order
    if (router.pathname === "/user/dashboard") {
      const orderPending = services?.filter(
        (statusP) => statusP.status === "Pending"
      );
      setPending(orderPending);

      const orderProcessing = services?.filter(
        (statusO) => statusO.status === "Processing"
      );
      setProcessing(orderProcessing);

      const orderDelivered = services?.filter(
        (statusD) => statusD.status === "Delivered"
      );
      setDelivered(orderDelivered);
    }

    //service sorting with low and high price
    if (sortedField === "Low") {
      services = [...services].sort((a, b) => a.prices.price - b.prices.price);
    }
    if (sortedField === "High") {
      services = [...services].sort((a, b) => b.prices.price - a.prices.price);
    }
    if (sortedField === "newest") {
      services = [...services].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    if (sortedField === "best-selling") {
      services = [...services].sort((a, b) => (b.sales || 0) - (a.sales || 0));
    }
    if (sortedField === "most-discounted") {
      services = [...services].sort(
        (a, b) => (b.prices?.discount || 0) - (a.prices?.discount || 0)
      );
    }

    return services;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sortedField,
    data,
    priceRange,
    selectedCategories,
    selectedRating,
    selectedDiscount,
    selectedColor,
    searchQuery,
    allCategories,
  ]);

  return {
    productData,
    pending,
    processing,
    delivered,
    setSortedField,
    priceRange,
    setPriceRange,
    selectedCategories,
    setSelectedCategories,
    selectedRating,
    setSelectedRating,
    selectedDiscount,
    setSelectedDiscount,
    selectedColor,
    setSelectedColor,
  };
};

export default useFilter;
