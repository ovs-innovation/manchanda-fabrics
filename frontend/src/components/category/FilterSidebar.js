import React, { useEffect, useState } from "react";
import { IoClose, IoStar } from "react-icons/io5";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FilterSidebar = ({
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  selectedRating,
  setSelectedRating,
  selectedDiscount,
  setSelectedDiscount,
  onClearAll,
}) => {
  const { showingTranslateValue, currency } = useUtilsFunction();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [openSections, setOpenSections] = useState({
    rating: false,
    discount: false,
    category: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await CategoryServices.getShowingCategory();
        const root = (categoryData || []).find(
          (c) => c.id === "Root" || c.name?.en?.toLowerCase() === "home"
        );
        setCategories(root?.children?.length ? root.children : categoryData || []);
      } catch (err) {
        console.error("Error fetching filter data", err);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategories(catId);
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
  };

  const ratings = [4, 3, 2, 1];
  const discounts = [50, 40, 30, 20, 10];

  return (
    <div className="font-sans">
      <div className="pb-4 border-b border-[#E6D1CB]/60 flex justify-between items-center">
        <h2 className="text-base font-bold uppercase tracking-widest text-[#3B2A25]">Filters</h2>
        <button
          onClick={onClearAll}
          className="text-[#9C6A5A] text-xs font-bold uppercase hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Active Filters */}
      {(selectedCategories.length > 0 ||
        selectedRating > 0 ||
        selectedDiscount > 0 ||
        priceRange.min > 0 ||
        priceRange.max < 100000) && (
        <div className="py-3 flex flex-wrap gap-2 border-b border-[#E6D1CB]/50">
          {
            (() => {
              const tags = [];
              const consumed = new Set();

              for (const parentCat of categories) {
                if (parentCat.children && parentCat.children.length > 0) {
                  const childIds = parentCat.children.map((c) => c._id);
                  const allSelected = childIds.every((id) => selectedCategories.includes(id));
                  if (allSelected) {
                    tags.push({ id: parentCat._id, name: parentCat.name, isParent: true });
                    childIds.forEach((id) => consumed.add(id));
                    consumed.add(parentCat._id);
                  }
                }
              }

              for (const catId of selectedCategories) {
                if (consumed.has(catId)) continue;
                let cat = categories.find((c) => c._id === catId);
                if (!cat) {
                  for (const parentCat of categories) {
                    if (parentCat.children) {
                      const child = parentCat.children.find((c) => c._id === catId);
                      if (child) {
                        cat = child;
                        break;
                      }
                    }
                  }
                }
                if (cat) tags.push({ id: catId, name: cat.name, isParent: false });
              }

              return tags.map((t) => (
                <span key={t.id} className="inline-flex items-center px-2 py-1 bg-[#FAF7F5] border border-[#E6D1CB]/60 text-xs rounded-lg text-[#3B2A25] font-medium">
                  {showingTranslateValue(t.name)}
                  <IoClose
                    className="ml-1.5 cursor-pointer text-[#3B2A25]/60 hover:text-[#3B2A25]"
                    onClick={() => {
                      if (t.isParent) {
                        const parent = categories.find((c) => c._id === t.id);
                        const childIds = parent?.children?.map((c) => c._id) || [t.id];
                        handleCategoryChange(childIds);
                      } else {
                        handleCategoryChange(t.id);
                      }
                    }}
                  />
                </span>
              ));
            })()
          }
          {priceRange.min > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-[#FAF7F5] border border-[#E6D1CB]/60 text-xs rounded-lg text-[#3B2A25] font-medium">
              Min: {priceRange.min}
              <IoClose
                className="ml-1.5 cursor-pointer text-[#3B2A25]/60 hover:text-[#3B2A25]"
                onClick={() => setPriceRange((prev) => ({ ...prev, min: 0 }))}
              />
            </span>
          )}
          {priceRange.max < 100000 && (
            <span className="inline-flex items-center px-2 py-1 bg-[#FAF7F5] border border-[#E6D1CB]/60 text-xs rounded-lg text-[#3B2A25] font-medium">
              Max: {priceRange.max}
              <IoClose
                className="ml-1.5 cursor-pointer text-[#3B2A25]/60 hover:text-[#3B2A25]"
                onClick={() =>
                  setPriceRange((prev) => ({ ...prev, max: 100000 }))
                }
              />
            </span>
          )}
          {selectedRating > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-[#FAF7F5] border border-[#E6D1CB]/60 text-xs rounded-lg text-[#3B2A25] font-medium">
              {selectedRating}★ & above
              <IoClose
                className="ml-1.5 cursor-pointer text-[#3B2A25]/60 hover:text-[#3B2A25]"
                onClick={() => setSelectedRating(0)}
              />
            </span>
          )}
          {selectedDiscount > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-[#FAF7F5] border border-[#E6D1CB]/60 text-xs rounded-lg text-[#3B2A25] font-medium">
              {selectedDiscount}%+ Off
              <IoClose
                className="ml-1.5 cursor-pointer text-[#3B2A25]/60 hover:text-[#3B2A25]"
                onClick={() => setSelectedDiscount(0)}
              />
            </span>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="border-b border-[#E6D1CB]/50">
        <button
          onClick={() => toggleSection("category")}
          className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
        >
          Categories
          {openSections.category ? <FiChevronUp className="text-[#3B2A25]/70" /> : <FiChevronDown className="text-[#3B2A25]/70" />}
        </button>
        {openSections.category && (
          <div className="pb-4 max-h-96 overflow-y-auto">
            {/* All Categories option */}
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="cat-all"
                checked={selectedCategories.length === 0}
                onChange={() => setSelectedCategories("all")}
                className="rounded border-[#E6D1CB]/60 text-[#9C6A5A] bg-white focus:ring-[#9C6A5A] focus:ring-offset-0 focus:outline-none w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="cat-all"
                className="ml-2 text-sm font-bold text-[#3B2A25]/85 cursor-pointer flex-1 hover:text-[#9C6A5A] transition-colors"
              >
                All Categories
              </label>
            </div>
            {categories.map((cat) => {
              const hasChildren = cat?.children && cat.children.length > 0;
              const isExpanded = expandedCategories[cat._id];
              
              return (
                <div key={cat._id} className="mb-2">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        id={`cat-${cat._id}`}
                        checked={
                          selectedCategories.includes(cat._id) || 
                          (cat.children && cat.children.length > 0 && cat.children.every((c) => selectedCategories.includes(c._id)))
                        }
                        onChange={() => {
                          const ids = (cat.children && cat.children.length > 0) ? [cat._id, ...cat.children.map(c => c._id)] : [cat._id];
                          handleCategoryChange(ids);
                        }}
                        className="rounded border-[#E6D1CB]/60 text-[#9C6A5A] bg-white focus:ring-[#9C6A5A] focus:ring-offset-0 focus:outline-none w-4 h-4"
                      />
                      <label
                        htmlFor={`cat-${cat._id}`}
                        className="ml-2 text-sm font-medium text-[#3B2A25]/85 cursor-pointer flex-1 hover:text-[#9C6A5A] transition-colors"
                      >
                        {showingTranslateValue(cat.name)}
                      </label>
                    </div>
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(cat._id);
                        }}
                        className="ml-2 p-1 text-[#3B2A25]/60 hover:text-[#9C6A5A] transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <FiChevronUp className="text-xs" />
                        ) : (
                          <FiChevronDown className="text-xs" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-2 mb-3 border-l-2 border-[#E6D1CB]/60 pl-4 space-y-2">
                      {cat.children.map((subCat) => (
                        <div key={subCat._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`subcat-${subCat._id}`}
                            checked={selectedCategories.includes(subCat._id)}
                            onChange={() => handleCategoryChange(subCat._id)}
                            className="rounded border-[#E6D1CB]/60 text-[#9C6A5A] bg-white focus:ring-[#9C6A5A] focus:ring-offset-0 focus:outline-none w-4 h-4"
                          />
                          <label
                            htmlFor={`subcat-${subCat._id}`}
                            className="ml-2 text-sm text-[#3B2A25]/75 font-medium cursor-pointer hover:text-[#9C6A5A] transition-colors"
                          >
                            {showingTranslateValue(subCat.name)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-[#E6D1CB]/50 py-4">
        <h3 className="text-sm font-bold uppercase text-[#3B2A25] mb-4">Price</h3>
        <div className="flex items-center gap-2">
          <select
            value={priceRange.min}
            onChange={(e) => handlePriceChange(e, "min")}
            className="w-full text-xs bg-white text-[#3B2A25] border border-[#E6D1CB]/60 rounded-lg p-2 focus:ring-[#9C6A5A] focus:border-[#9C6A5A] focus:outline-none"
          >
            <option value="0">0 {currency}</option>
            <option value="500">500 {currency}</option>
            <option value="1000">1000 {currency}</option>
            <option value="5000">5000 {currency}</option>
            <option value="10000">10000 {currency}</option>
            <option value="50000">50000 {currency}</option>
          </select>
          <span className="text-[#3B2A25]/60 text-xs">to</span>
          <select
            value={priceRange.max}
            onChange={(e) => handlePriceChange(e, "max")}
            className="w-full text-xs bg-white text-[#3B2A25] border border-[#E6D1CB]/60 rounded-lg p-2 focus:ring-[#9C6A5A] focus:border-[#9C6A5A] focus:outline-none"
          >
            <option value={priceRange.max}>
              {priceRange.max >= 100000 ? "Max" : `${priceRange.max} ${currency}`}
            </option>
            <option value="1000">1000 {currency}</option>
            <option value="5000">5000 {currency}</option>
            <option value="10000">10000 {currency}</option>
            <option value="50000">50000 {currency}</option>
            <option value="100000">100000 {currency}</option>
          </select>
        </div>
        <input
          type="range"
          min="0"
          max="100000"
          step="500"
          value={priceRange.max}
          onChange={(e) => handlePriceChange(e, "max")}
          className="w-full mt-4 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#9C6A5A]"
          style={{
            background: `linear-gradient(to right, #9C6A5A 0%, #9C6A5A ${
              (priceRange.max / 100000) * 100
            }%, #E6D1CB/30 ${(priceRange.max / 100000) * 100}%, #E6D1CB/30 100%)`,
          }}
        />
      </div>

      {/* Customer Ratings */}
      <div className="border-b border-[#E6D1CB]/50">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
        >
          Customer Ratings
          {openSections.rating ? <FiChevronUp className="text-[#3B2A25]/70" /> : <FiChevronDown className="text-[#3B2A25]/70" />}
        </button>
        {openSections.rating && (
          <div className="pb-4">
            {ratings.map((rating) => (
              <div
                key={rating}
                className="flex items-center mb-2 cursor-pointer group"
                onClick={() => setSelectedRating(rating)}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                  className="text-[#9C6A5A] bg-white border-[#E6D1CB]/60 focus:ring-[#9C6A5A] focus:ring-offset-0 focus:outline-none w-4 h-4"
                />
                <div className="ml-2 flex items-center text-sm text-[#3B2A25]/80 font-medium group-hover:text-[#9C6A5A] transition-colors">
                  {rating} <IoStar className="text-[#9C6A5A] ml-1 mr-1" /> & above
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount */}
      <div className="border-b border-[#E6D1CB]/50">
        <button
          onClick={() => toggleSection("discount")}
          className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
        >
          Discount
          {openSections.discount ? <FiChevronUp className="text-[#3B2A25]/70" /> : <FiChevronDown className="text-[#3B2A25]/70" />}
        </button>
        {openSections.discount && (
          <div className="pb-4">
            {discounts.map((discount) => (
              <div
                key={discount}
                className="flex items-center mb-2 cursor-pointer group"
                onClick={() => setSelectedDiscount(discount)}
              >
                <input
                  type="radio"
                  name="discount"
                  checked={selectedDiscount === discount}
                  onChange={() => setSelectedDiscount(discount)}
                  className="text-[#9C6A5A] bg-white border-[#E6D1CB]/60 focus:ring-[#9C6A5A] focus:ring-offset-0 focus:outline-none w-4 h-4"
                />
                <label className="ml-2 text-sm text-[#3B2A25]/80 font-medium cursor-pointer group-hover:text-[#9C6A5A] transition-colors">
                  {discount}% or more
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
