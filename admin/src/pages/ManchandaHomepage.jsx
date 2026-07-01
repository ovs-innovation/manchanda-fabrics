import { useEffect, useMemo, useState } from "react";
import { Button } from "@windmill/react-ui";
import { Link, useLocation } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import {
  FiGrid,
  FiImage,
  FiTrendingUp,
  FiStar,
  FiList,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import Uploader from "@/components/image-uploader/Uploader";
import useManchandaHomepage from "@/hooks/useManchandaHomepage";
import ProductServices from "@/services/ProductServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const TABS = [
  { path: "/store/homepage/overview", key: "overview", label: "Overview", icon: FiGrid },
  { path: "/store/homepage/hero", key: "hero", label: "Hero Slides", icon: FiImage },
  { path: "/store/homepage/trending", key: "trending", label: "Trending Products", icon: FiTrendingUp },
  { path: "/store/homepage/new-arrivals", key: "newArrivals", label: "New Arrivals", icon: FiStar },
  { path: "/store/homepage/categories", key: "categories", label: "Category Banners", icon: FiGrid },
  { path: "/store/homepage/order", key: "order", label: "Section Ordering", icon: FiList },
];

const Input = ({ label, value, onChange, placeholder = "" }) => (
  <label className="block mb-4">
    <span className="text-sm font-medium text-store-700 dark:text-store-200">{label}</span>
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 w-full border border-store-200 dark:border-store-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-store-900 dark:text-store-100 focus:outline-none focus:border-store-400"
    />
  </label>
);

const ManchandaHomepage = () => {
  const location = useLocation();
  const { showingTranslateValue } = useUtilsFunction();
  const { loading, saving, homepage, setHomepage, save } = useManchandaHomepage();
  const [products, setProducts] = useState([]);

  const activeTab =
    TABS.find((t) => location.pathname.startsWith(t.path))?.key ||
    (location.pathname === "/store/homepage" ? "overview" : "overview");

  useEffect(() => {
    ProductServices.getAllProducts({ page: 1, limit: 500 })
      .then((res) => setProducts(res?.products || []))
      .catch(() => setProducts([]));
  }, []);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        label: showingTranslateValue(p?.title) || p?.slug || p?._id,
        value: String(p._id),
      })),
    [products, showingTranslateValue]
  );

  const selectedTrending = productOptions.filter((o) =>
    (homepage.trendingProductIds || []).map(String).includes(o.value)
  );
  const selectedNewArrivals = productOptions.filter((o) =>
    (homepage.newArrivalProductIds || []).map(String).includes(o.value)
  );

  const updateSlides = (slides) => setHomepage({ ...homepage, heroSlides: slides });
  const updateBanners = (banners) => setHomepage({ ...homepage, categoryBanners: banners });

  const renderHero = () => {
    const slides = homepage.heroSlides || [];
    return (
      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Slide {index + 1}</h3>
              <button
                type="button"
                onClick={() => updateSlides(slides.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 />
              </button>
            </div>
            <Uploader
              imageUrl={slide.image}
              setImageUrl={(url) => {
                const next = [...slides];
                next[index] = { ...next[index], image: url };
                updateSlides(next);
              }}
              folder="homepage"
            />
            <Input label="Title" value={slide.title} onChange={(v) => {
              const next = [...slides];
              next[index] = { ...next[index], title: v };
              updateSlides(next);
            }} />
            <Input label="Subtitle" value={slide.subtitle} onChange={(v) => {
              const next = [...slides];
              next[index] = { ...next[index], subtitle: v };
              updateSlides(next);
            }} />
            <Input label="Button text" value={slide.btnText} onChange={(v) => {
              const next = [...slides];
              next[index] = { ...next[index], btnText: v };
              updateSlides(next);
            }} />
            <Input label="Link" value={slide.link} onChange={(v) => {
              const next = [...slides];
              next[index] = { ...next[index], link: v };
              updateSlides(next);
            }} placeholder="/search" />
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            updateSlides([
              ...slides,
              {
                title: "Timeless Elegance",
                subtitle: "Discover handcrafted Indian ethnic wear",
                btnText: "Explore Collection",
                link: "/search",
                image: "",
                style: "layout-left-framed",
              },
            ])
          }
        >
          <FiPlus className="mr-2 inline" /> Add Hero Slide
        </Button>
      </div>
    );
  };

  const renderCategories = () => {
    const banners = homepage.categoryBanners || [];
    return (
      <div className="space-y-6">
        {banners.map((banner, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Category {index + 1}</h3>
              <button
                type="button"
                onClick={() => updateBanners(banners.filter((_, i) => i !== index))}
                className="text-red-500"
              >
                <FiTrash2 />
              </button>
            </div>
            <Uploader
              imageUrl={banner.image}
              setImageUrl={(url) => {
                const next = [...banners];
                next[index] = { ...next[index], image: url };
                updateBanners(next);
              }}
              folder="homepage"
            />
            <Input label="Title" value={banner.title} onChange={(v) => {
              const next = [...banners];
              next[index] = { ...next[index], title: v };
              updateBanners(next);
            }} />
            <Input label="Category slug" value={banner.slug} onChange={(v) => {
              const next = [...banners];
              next[index] = { ...next[index], slug: v };
              updateBanners(next);
            }} placeholder="cotton-suits" />
          </div>
        ))}
        <Button type="button" onClick={() => updateBanners([...banners, { title: "", slug: "", image: "" }])}>
          <FiPlus className="mr-2 inline" /> Add Category Banner
        </Button>
      </div>
    );
  };

  const renderOrder = () => {
    const order = homepage.sectionOrder || [];
    const move = (index, direction) => {
      const next = [...order];
      const target = index + direction;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      setHomepage({ ...homepage, sectionOrder: next });
    };
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500 mb-4">
          Control homepage section sequence. Use arrows to reorder sections on the storefront.
        </p>
        {order.map((section, index) => (
          <div key={section} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-white dark:bg-gray-800">
            <span className="font-medium">{section}</span>
            <div className="flex gap-2">
              <Button layout="outline" size="small" onClick={() => move(index, -1)} disabled={index === 0}>Up</Button>
              <Button layout="outline" size="small" onClick={() => move(index, 1)} disabled={index === order.length - 1}>Down</Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "hero") return renderHero();
    if (activeTab === "trending") {
      return (
        <div>
          <p className="text-sm text-gray-500 mb-4">Pick products for the Trending section. Leave empty to use product tags or best sellers.</p>
          <MultiSelect
            options={productOptions}
            value={selectedTrending}
            onChange={(selected) =>
              setHomepage({
                ...homepage,
                trendingProductIds: selected.map((s) => s.value),
              })
            }
            labelledBy="Trending products"
          />
        </div>
      );
    }
    if (activeTab === "newArrivals") {
      return (
        <div>
          <p className="text-sm text-gray-500 mb-4">Pick products for New Arrivals. Leave empty to use new-arrival tags.</p>
          <MultiSelect
            options={productOptions}
            value={selectedNewArrivals}
            onChange={(selected) =>
              setHomepage({
                ...homepage,
                newArrivalProductIds: selected.map((s) => s.value),
              })
            }
            labelledBy="New arrival products"
          />
        </div>
      );
    }
    if (activeTab === "categories") return renderCategories();
    if (activeTab === "order") return renderOrder();
    return (
      <div className="admin-card p-5 text-sm text-store-700 dark:text-store-200 space-y-3">
        <p>Manage hero banners, curated products, category tiles, and section order for the Manchanda Fabrics storefront.</p>
        <p>Changes save to <strong>storeCustomizationSetting.manchandaHomepage</strong> and appear on the live website after refresh.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Hero slides override Store Customization sliders when configured here.</li>
          <li>Product picks override automatic trending / new-arrival fallbacks.</li>
          <li>Category banners replace default homepage category cards when added.</li>
        </ul>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading homepage settings...</div>;
  }

  return (
    <>
      <PageTitle subtitle="Hero, products, categories — all from one place">
        Homepage Manager
      </PageTitle>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                to={tab.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-store-500 text-white"
                    : "text-store-700/80 hover:bg-store-100 dark:text-store-200/80 dark:hover:bg-store-800/40"
                }`}
              >
                <Icon /> {tab.label}
              </Link>
            );
          })}
        </aside>
        <div className="flex-1 min-w-0">
          <div className="admin-card p-5 md:p-6">
          <div className="flex justify-end mb-4 gap-3 items-center">
            <p className="text-xs text-store-600/70 hidden sm:block">
              Upload images, then click Save — changes appear on the website within ~10 seconds.
            </p>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Homepage"}
            </Button>
          </div>
          {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManchandaHomepage;
