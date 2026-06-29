import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button, Input, Select } from "@windmill/react-ui";
import { MultiSelect } from "react-multi-select-component";
import { FiSave, FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiImage, FiTrendingUp, FiStar, FiGrid, FiInstagram, FiList } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import Loading from "@/components/preloader/Loading";
import Uploader from "@/components/image-uploader/Uploader";
import useRasaHomepage from "@/hooks/useRasaHomepage";
import ProductServices from "@/services/ProductServices";

const SECTIONS = [
  { path: "/homepage/overview", key: "overview", label: "Overview", icon: FiGrid },
  { path: "/homepage/hero", key: "hero", label: "Hero Slides", icon: FiImage },
  { path: "/homepage/trending", key: "trending", label: "Trending Products", icon: FiTrendingUp },
  { path: "/homepage/new-arrivals", key: "newArrivals", label: "New Arrivals", icon: FiStar },
  { path: "/homepage/categories", key: "categories", label: "Category Banners", icon: FiGrid },
  { path: "/homepage/instagram", key: "instagram", label: "Instagram Feed", icon: FiInstagram },
  { path: "/homepage/order", key: "order", label: "Section Ordering", icon: FiList },
];

const RasaHomepage = () => {
  const location = useLocation();
  const { loading, saving, homepage, setHomepage, save } = useRasaHomepage();
  const [productOptions, setProductOptions] = useState([]);

  const activeSection = useMemo(() => {
    if (location.pathname === "/homepage" || location.pathname === "/homepage/overview") {
      return "overview";
    }
    const match = SECTIONS.find((s) => s.path === location.pathname);
    return match?.key || "overview";
  }, [location.pathname]);

  useEffect(() => {
    ProductServices.getAllProducts({ page: 1, limit: 200, status: "show" })
      .then((res) => {
        const list = res?.products || res?.data || [];
        setProductOptions(
          list.map((p) => ({
            label: p.title?.en || p.title || p.slug,
            value: p._id,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const selectedTrending = productOptions.filter((o) =>
    (homepage.trendingProductIds || []).includes(o.value)
  );
  const selectedNewArrivals = productOptions.filter((o) =>
    (homepage.newArrivalProductIds || []).includes(o.value)
  );

  if (loading) return <Loading loading={loading} />;

  const renderContent = () => {
    switch (activeSection) {
      case "hero": {
        const slides = homepage.heroSlides || [];
        
        const updateSlideField = (index, field, value) => {
          const newSlides = [...slides];
          newSlides[index] = { ...newSlides[index], [field]: value };
          setHomepage({ ...homepage, heroSlides: newSlides });
        };

        const addSlide = () => {
          const newSlides = [
            ...slides,
            {
              style: "layout-left-framed",
              badge: "New Season",
              title: "New Heritage Slide",
              subtitle: "Elegant description of your products.",
              highlight: "Premium Quality",
              btnText: "Shop Now",
              link: "/search",
              image: ""
            }
          ];
          setHomepage({ ...homepage, heroSlides: newSlides });
        };

        const deleteSlide = (index) => {
          const newSlides = slides.filter((_, idx) => idx !== index);
          setHomepage({ ...homepage, heroSlides: newSlides });
        };

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Configure your storefront hero slideshow. Drag or use buttons to rearrange order, set custom text overlays and slide background images.
              </p>
              <Button onClick={addSlide} size="small" className="bg-[#008f89] hover:bg-[#00736e]">
                <FiPlus className="mr-1" /> Add Slide
              </Button>
            </div>

            {slides.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-700 text-gray-400">
                No hero slides defined. Click &quot;Add Slide&quot; to create one.
              </div>
            ) : (
              slides.map((slide, idx) => (
                <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900/50 space-y-4 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => deleteSlide(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete Slide"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column: Info Fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Layout Style</label>
                        <Select
                          value={slide.style || "layout-left-framed"}
                          onChange={(e) => updateSlideField(idx, "style", e.target.value)}
                        >
                          <option value="layout-left-framed">Framed Left Box</option>
                          <option value="layout-right-split">Right Split Panel</option>
                          <option value="layout-center-minimal">Center Minimal Overlay</option>
                          <option value="layout-offset-box">Offset Corner Box</option>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Badge Tag</label>
                          <Input
                            value={slide.badge || ""}
                            onChange={(e) => updateSlideField(idx, "badge", e.target.value)}
                            placeholder="e.g. Signature Collection"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Highlight Tag</label>
                          <Input
                            value={slide.highlight || ""}
                            onChange={(e) => updateSlideField(idx, "highlight", e.target.value)}
                            placeholder="e.g. Pure Silk • Handloom"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slide Title</label>
                        <Input
                          value={slide.title || ""}
                          onChange={(e) => updateSlideField(idx, "title", e.target.value)}
                          placeholder="Exquisite Gaji Silk"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle / Description</label>
                        <Input
                          value={slide.subtitle || ""}
                          onChange={(e) => updateSlideField(idx, "subtitle", e.target.value)}
                          placeholder="Short description of the collections showcased"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Text</label>
                          <Input
                            value={slide.btnText || ""}
                            onChange={(e) => updateSlideField(idx, "btnText", e.target.value)}
                            placeholder="Shop Now"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Link</label>
                          <Input
                            value={slide.link || ""}
                            onChange={(e) => updateSlideField(idx, "link", e.target.value)}
                            placeholder="e.g. /search?category=silk"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Image Uploader */}
                    <div className="flex flex-col justify-center">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Slide Image</label>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Uploader
                          folder="settings/slider"
                          imageUrl={slide.image || slide.bgImage}
                          setImageUrl={(url) => updateSlideField(idx, "image", url)}
                        />
                        <p className="text-[10px] text-gray-400 mt-2 text-center">Recommended Size: 1600 x 600 px</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      }

      case "instagram": {
        const posts = homepage.instagramPosts || [];

        const updatePostField = (index, field, value) => {
          const newPosts = [...posts];
          newPosts[index] = { ...newPosts[index], [field]: value };
          setHomepage({ ...homepage, instagramPosts: newPosts });
        };

        const addPost = () => {
          const newPosts = [
            ...posts,
            {
              url: "https://www.instagram.com/manchandafabrics",
              image: ""
            }
          ];
          setHomepage({ ...homepage, instagramPosts: newPosts });
        };

        const deletePost = (index) => {
          const newPosts = posts.filter((_, idx) => idx !== index);
          setHomepage({ ...homepage, instagramPosts: newPosts });
        };

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Manage the featured posts shown in your storefront Instagram grid section.
              </p>
              <Button onClick={addPost} size="small" className="bg-[#008f89] hover:bg-[#00736e]">
                <FiPlus className="mr-1" /> Add Post
              </Button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-700 text-gray-400">
                No Instagram posts configured. Click &quot;Add Post&quot; to link your socials.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, idx) => (
                  <div key={idx} className="border border-gray-150 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3 relative flex flex-col justify-between">
                    <button
                      type="button"
                      onClick={() => deletePost(idx)}
                      className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                      title="Delete Post"
                    >
                      <FiTrash2 size={14} />
                    </button>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Post Link URL</label>
                        <Input
                          value={post.url || ""}
                          onChange={(e) => updatePostField(idx, "url", e.target.value)}
                          placeholder="https://www.instagram.com/p/..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Post Image</label>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Uploader
                            folder="settings/instagram"
                            imageUrl={post.image}
                            setImageUrl={(url) => updatePostField(idx, "image", url)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "trending":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Pick products for the Trending section. You can also tag products with &quot;Trending Product&quot; on the Add Product form.
            </p>
            <MultiSelect
              options={productOptions}
              value={selectedTrending}
              onChange={(selected) =>
                setHomepage({
                  ...homepage,
                  trendingProductIds: selected.map((s) => s.value),
                })
              }
              labelledBy="Select trending products"
            />
          </div>
        );

      case "newArrivals":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Pick products for New Arrivals. You can also tag products with &quot;New Arrival&quot; on the Add Product form.
            </p>
            <MultiSelect
              options={productOptions}
              value={selectedNewArrivals}
              onChange={(selected) =>
                setHomepage({
                  ...homepage,
                  newArrivalProductIds: selected.map((s) => s.value),
                })
              }
              labelledBy="Select new arrival products"
            />
          </div>
        );

      case "categories": {
        const banners = homepage.categoryBanners || [];

        const updateBannerField = (index, field, value) => {
          const newBanners = [...banners];
          newBanners[index] = { ...newBanners[index], [field]: value };
          setHomepage({ ...homepage, categoryBanners: newBanners });
        };

        const addBanner = () => {
          const newBanners = [
            ...banners,
            {
              title: "New Category",
              slug: "sarees",
              image: ""
            }
          ];
          setHomepage({ ...homepage, categoryBanners: newBanners });
        };

        const deleteBanner = (index) => {
          const newBanners = banners.filter((_, idx) => idx !== index);
          setHomepage({ ...homepage, categoryBanners: newBanners });
        };

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Configure your category banners visible on the main page.
              </p>
              <Button onClick={addBanner} size="small" className="bg-[#008f89] hover:bg-[#00736e]">
                <FiPlus className="mr-1" /> Add Category Banner
              </Button>
            </div>

            {banners.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-700 text-gray-400">
                No category banners configured. Click &quot;Add Category Banner&quot;.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {banners.map((banner, idx) => (
                  <div key={idx} className="border border-gray-150 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-900/50 space-y-3 relative flex flex-col justify-between">
                    <button
                      type="button"
                      onClick={() => deleteBanner(idx)}
                      className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                      title="Delete Banner"
                    >
                      <FiTrash2 size={14} />
                    </button>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Banner Title</label>
                          <Input
                            value={banner.title || ""}
                            onChange={(e) => updateBannerField(idx, "title", e.target.value)}
                            placeholder="Banarasi Sarees"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Slug</label>
                          <Input
                            value={banner.slug || ""}
                            onChange={(e) => updateBannerField(idx, "slug", e.target.value)}
                            placeholder="sarees"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image</label>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Uploader
                            folder="settings/categories"
                            imageUrl={banner.image}
                            setImageUrl={(url) => updateBannerField(idx, "image", url)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "order": {
        const currentOrder = (homepage.sectionOrder || ["Hero", "Categories", "New Arrival", "Trending", "Instagram"]).filter(s => s !== "Brands");
        const moveSection = (index, direction) => {
          const newOrder = [...currentOrder];
          const targetIndex = index + direction;
          if (targetIndex < 0 || targetIndex >= newOrder.length) return;
          const temp = newOrder[index];
          newOrder[index] = newOrder[targetIndex];
          newOrder[targetIndex] = temp;
          setHomepage({ ...homepage, sectionOrder: newOrder });
        };
        return (
          <div className="space-y-4 max-w-xl">
            <p className="text-sm text-gray-500 mb-2">
              Homepage display sequence: click the Up/Down arrows below to re-arrange the section order on the frontend.
            </p>
            <div className="divide-y border rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 overflow-hidden">
              {currentOrder.map((sec, idx) => (
                <div key={sec} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{sec}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, -1)}
                      className={`p-2 rounded-lg transition-colors ${
                        idx === 0
                          ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <FiArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentOrder.length - 1}
                      onClick={() => moveSection(idx, 1)}
                      className={`p-2 rounded-lg transition-colors ${
                        idx === currentOrder.length - 1
                          ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <FiArrowDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTIONS.filter((s) => s.key !== "overview").map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.path}
                  to={s.path}
                  className="block p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{s.label}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Configure your store's {s.label.toLowerCase()} dynamically.</p>
                </Link>
              );
            })}
          </div>
        );
    }
  };

  return (
    <>
      <PageTitle>Manchanda Fabrics Homepage Manager</PageTitle>
      <AnimatedContent>
        <div className="flex flex-wrap gap-2 mb-6">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            return (
              <Link
                key={s.path}
                to={s.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  isActive
                    ? "bg-[#050505] text-[#D4AF37] border-[#D4AF37]"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-450 border-gray-200 dark:border-gray-750 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                {s.label}
              </Link>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6 shadow-sm">
          {renderContent()}
        </div>

        {activeSection !== "overview" && (
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="bg-[#008f89]">
              <FiSave className="mr-2" />
              {saving ? "Saving..." : "Save Homepage"}
            </Button>
          </div>
        )}
      </AnimatedContent>
    </>
  );
};

export default RasaHomepage;
