import { useEffect, useMemo, useState } from "react";
import { Button } from "@windmill/react-ui";
import { Link, useLocation } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import {
  FiGrid,
  FiImage,
  FiStar,
  FiUsers,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiTrash2,
  FiLink,
} from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import Uploader from "@/components/image-uploader/Uploader";
import VideoUploader from "@/components/image-uploader/VideoUploader";
import useManchandaHomepage from "@/hooks/useManchandaHomepage";
import ProductServices from "@/services/ProductServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const TABS = [
  { path: "/store/homepage/overview", key: "overview", label: "Overview", icon: FiGrid },
  { path: "/store/homepage/hero", key: "hero", label: "Hero Banner", icon: FiImage },
  { path: "/store/homepage/products", key: "products", label: "Home Products", icon: FiStar },
  { path: "/store/homepage/founder", key: "founder", label: "Our Story", icon: FiUsers },
  { path: "/store/homepage/stores", key: "stores", label: "Stores", icon: FiMapPin },
  { path: "/store/homepage/contact", key: "contact", label: "WhatsApp & Video", icon: FiMessageCircle },
  { path: "/store/homepage/footer", key: "footer", label: "Footer", icon: FiLink },
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

const Select = ({ label, value, onChange, options }) => (
  <label className="block mb-4">
    <span className="text-sm font-medium text-store-700 dark:text-store-200">{label}</span>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-store-200 dark:border-store-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-store-900 dark:text-store-100 focus:outline-none focus:border-store-400"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

const TextArea = ({ label, value, onChange, rows = 4, placeholder = "" }) => (
  <label className="block mb-4">
    <span className="text-sm font-medium text-store-700 dark:text-store-200">{label}</span>
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
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
    TABS.find((t) => location.pathname.startsWith(t.path))?.key || "overview";

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

  const selectedNewArrivals = productOptions.filter((o) =>
    (homepage.newArrivalProductIds || []).map(String).includes(o.value)
  );
  const selectedTrending = productOptions.filter((o) =>
    (homepage.trendingProductIds || []).map(String).includes(o.value)
  );

  const updateFounder = (patch) =>
    setHomepage({ ...homepage, founder: { ...homepage.founder, ...patch } });

  const updateVideoShopping = (patch) =>
    setHomepage({
      ...homepage,
      videoShopping: { ...homepage.videoShopping, ...patch },
    });

  const updateStores = (stores) => setHomepage({ ...homepage, stores });

  const updateFooter = (patch) =>
    setHomepage({ ...homepage, footer: { ...homepage.footer, ...patch } });

  const renderHero = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
          Hero background video
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Upload your homepage hero video here — no need to type any file path.
        </p>
        <VideoUploader
          value={homepage.heroVideo || ""}
          onChange={(url) => setHomepage({ ...homepage, heroVideo: url })}
          folder="homepage-videos"
          title="Upload hero video"
          hint="MP4, MOV or WEBM"
          maxSizeMB={100}
        />
      </div>
      <Input label="Welcome text" value={homepage.heroWelcome} onChange={(v) => setHomepage({ ...homepage, heroWelcome: v })} />
      <Input label="Brand name" value={homepage.heroBrandName} onChange={(v) => setHomepage({ ...homepage, heroBrandName: v })} />
      <Input label="Tagline" value={homepage.heroTagline} onChange={(v) => setHomepage({ ...homepage, heroTagline: v })} />
      <Input label="Button text" value={homepage.heroCtaText} onChange={(v) => setHomepage({ ...homepage, heroCtaText: v })} />
      <Input label="Button link" value={homepage.heroCtaLink} onChange={(v) => setHomepage({ ...homepage, heroCtaLink: v })} placeholder="/search" />
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500 mb-3">
          Products in homepage <strong>New Arrivals</strong> grid. Leave empty to auto-pick by tag.
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
          labelledBy="New arrivals"
        />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-3">
          Products in homepage <strong>Shop Latest Collection</strong> reels. Leave empty to auto-pick by tag.
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
          labelledBy="Shop Latest Collection"
        />
      </div>
    </div>
  );

  const renderFounder = () => {
    const f = homepage.founder || {};
    return (
      <div className="space-y-2">
        <Input label="Small label" value={f.eyebrow} onChange={(v) => updateFounder({ eyebrow: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Title line 1" value={f.titleLine1} onChange={(v) => updateFounder({ titleLine1: v })} />
          <Input label="Title highlight" value={f.titleHighlight} onChange={(v) => updateFounder({ titleHighlight: v })} />
        </div>
        <TextArea label="Paragraph 1" value={f.paragraph1} onChange={(v) => updateFounder({ paragraph1: v })} />
        <TextArea label="Paragraph 2" value={f.paragraph2} onChange={(v) => updateFounder({ paragraph2: v })} />
        <TextArea label="Paragraph 3" value={f.paragraph3} onChange={(v) => updateFounder({ paragraph3: v })} />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Main photo</p>
            <Uploader imageUrl={f.mainImage} setImageUrl={(url) => updateFounder({ mainImage: url })} folder="homepage" />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Secondary photo</p>
            <Uploader imageUrl={f.secondaryImage} setImageUrl={(url) => updateFounder({ secondaryImage: url })} folder="homepage" />
          </div>
        </div>
        <Input label="Signature" value={f.signature} onChange={(v) => updateFounder({ signature: v })} />
        <Input label="Est. line" value={f.estLine} onChange={(v) => updateFounder({ estLine: v })} />
      </div>
    );
  };

  const renderStores = () => {
    const stores = homepage.stores || [];
    return (
      <div className="space-y-6">
        {stores.map((store, index) => (
          <div key={index} className="border rounded-xl p-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Store {index + 1}</h3>
              <button type="button" onClick={() => updateStores(stores.filter((_, i) => i !== index))} className="text-red-500">
                <FiTrash2 />
              </button>
            </div>
            <Input label="Name" value={store.name} onChange={(v) => {
              const next = [...stores];
              next[index] = { ...next[index], name: v };
              updateStores(next);
            }} />
            <Input label="Address" value={store.address} onChange={(v) => {
              const next = [...stores];
              next[index] = { ...next[index], address: v };
              updateStores(next);
            }} />
            <Uploader imageUrl={store.image} setImageUrl={(url) => {
              const next = [...stores];
              next[index] = { ...next[index], image: url };
              updateStores(next);
            }} folder="homepage" />
          </div>
        ))}
        <Button type="button" onClick={() => updateStores([...stores, { name: "", address: "", image: "" }])}>
          <FiPlus className="mr-2 inline" /> Add Store
        </Button>
      </div>
    );
  };

  const renderContact = () => {
    const vs = homepage.videoShopping || {};
    const numbersText = (homepage.whatsappNumbers || []).join("\n");
    const marqueeText = (homepage.marqueePhrases || []).join("\n");
    return (
      <div className="space-y-6">
        <div>
          <TextArea
            label="WhatsApp numbers (one per line, with country code 91...)"
            value={numbersText}
            onChange={(v) =>
              setHomepage({
                ...homepage,
                whatsappNumbers: v.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            rows={3}
          />
        </div>
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Live Video Shopping Settings</h3>
          <Select
            label="Enable Live Video Shopping"
            value={vs.enabled !== false ? "true" : "false"}
            onChange={(v) => updateVideoShopping({ enabled: v === "true" })}
            options={[
              { label: "Enabled", value: "true" },
              { label: "Disabled", value: "false" },
            ]}
          />
          <Input label="Section Title" value={vs.title} onChange={(v) => updateVideoShopping({ title: v })} />
          <Input label="Section Description" value={vs.subtitle} onChange={(v) => updateVideoShopping({ subtitle: v })} />
          <Input label="Business Hours" value={vs.businessHours} onChange={(v) => updateVideoShopping({ businessHours: v })} placeholder="11:30 AM – 8:00 PM" />
          <Input label="WhatsApp Number" value={vs.whatsapp} onChange={(v) => updateVideoShopping({ whatsapp: v })} placeholder="919650544554" />
          <Input label="Button Text" value={vs.buttonText} onChange={(v) => updateVideoShopping({ buttonText: v })} placeholder="Start Video Shopping" />
          <p className="text-sm font-medium mb-2">Section Image (Optional)</p>
          <Uploader imageUrl={vs.image} setImageUrl={(url) => updateVideoShopping({ image: url })} folder="homepage" />
        </div>
        <div className="border-t pt-6">
          <TextArea
            label="Marquee phrases (one per line)"
            value={marqueeText}
            onChange={(v) =>
              setHomepage({
                ...homepage,
                marqueePhrases: v.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            rows={6}
          />
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    const f = homepage.footer || {};

    const LinkListEditor = ({ label, listKey }) => {
      const list = f[listKey] || [];
      const updateList = (next) => updateFooter({ [listKey]: next });
      return (
        <div className="border rounded-xl p-4 bg-white dark:bg-gray-800">
          <p className="text-sm font-semibold mb-3">{label}</p>
          <div className="space-y-3">
            {list.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  value={item.title || ""}
                  onChange={(e) => {
                    const next = [...list];
                    next[index] = { ...next[index], title: e.target.value };
                    updateList(next);
                  }}
                  placeholder="Label"
                  className="flex-1 border border-store-200 dark:border-store-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-store-900 dark:text-store-100 focus:outline-none focus:border-store-400"
                />
                <input
                  value={item.href || ""}
                  onChange={(e) => {
                    const next = [...list];
                    next[index] = { ...next[index], href: e.target.value };
                    updateList(next);
                  }}
                  placeholder="/link"
                  className="flex-1 border border-store-200 dark:border-store-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-store-900 dark:text-store-100 focus:outline-none focus:border-store-400"
                />
                <button
                  type="button"
                  onClick={() => updateList(list.filter((_, i) => i !== index))}
                  className="text-red-500 mt-2"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
          <Button
            layout="outline"
            size="small"
            className="mt-3"
            onClick={() => updateList([...list, { title: "", href: "" }])}
          >
            <FiPlus className="mr-1 inline" /> Add link
          </Button>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
            Contact details shown in footer
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Leave phones empty to reuse your WhatsApp numbers, and address/email empty to reuse
            your business settings.
          </p>
          <Input
            label="Address"
            value={f.address}
            onChange={(v) => updateFooter({ address: v })}
            placeholder="Chandni Chowk, Delhi"
          />
          <Input
            label="Email"
            value={f.email}
            onChange={(v) => updateFooter({ email: v })}
            placeholder="manchandafabrics@gmail.com"
          />
          <TextArea
            label="Phone numbers (one per line)"
            value={(f.phones || []).join("\n")}
            onChange={(v) =>
              updateFooter({
                phones: v.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            rows={3}
          />
          <Input
            label="Store hours"
            value={f.hours}
            onChange={(v) => updateFooter({ hours: v })}
            placeholder="Mon – Sat · 11 AM – 8 PM (Sun closed)"
          />
          <Input
            label="Instagram link"
            value={f.instagram}
            onChange={(v) => updateFooter({ instagram: v })}
            placeholder="https://www.instagram.com/manchandafabrics"
          />
          <Input
            label="Facebook link"
            value={f.facebook}
            onChange={(v) => updateFooter({ facebook: v })}
            placeholder="https://www.facebook.com/manchandafabrics"
          />
          <Input
            label="WhatsApp number (with country code)"
            value={f.whatsapp}
            onChange={(v) => updateFooter({ whatsapp: v })}
            placeholder="919650544554"
          />
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <TextArea
            label="Brand story (about text)"
            value={f.brandStory}
            onChange={(v) => updateFooter({ brandStory: v })}
            rows={4}
          />
        </div>

        <LinkListEditor label="Quick Links column" listKey="quickLinks" />
        <LinkListEditor label="Collection column" listKey="collectionLinks" />
        <LinkListEditor label="Special Collection column" listKey="specialCollection" />

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-semibold mb-3">Copyright line</p>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Company name"
              value={f.copyrightName}
              onChange={(v) => updateFooter({ copyrightName: v })}
              placeholder="VastoraTech"
            />
            <Input
              label="Company link"
              value={f.copyrightUrl}
              onChange={(v) => updateFooter({ copyrightUrl: v })}
              placeholder="https://vastoratech.com/"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "hero") return renderHero();
    if (activeTab === "products") return renderProducts();
    if (activeTab === "founder") return renderFounder();
    if (activeTab === "stores") return renderStores();
    if (activeTab === "contact") return renderContact();
    if (activeTab === "footer") return renderFooter();
    return (
      <div className="admin-card p-5 text-sm text-store-700 dark:text-store-200 space-y-3">
        <p>Edit your website homepage content from here — hero, products, family story, stores, and WhatsApp.</p>
        <p className="text-store-500">Changes appear on the live site within about 10 seconds after you click Save.</p>
        <ul className="list-disc pl-5 space-y-1 text-store-600">
          <li><strong>Business & Contact</strong> — logo, email, phone (Settings menu)</li>
          <li><strong>Hero Banner</strong> — welcome text, brand name, video</li>
          <li><strong>Home Products</strong> — New Arrivals & reel products</li>
          <li><strong>Our Story</strong> — Manchanda family section</li>
          <li><strong>Stores</strong> — store locations on homepage</li>
          <li><strong>WhatsApp & Video</strong> — order numbers & video shopping banner</li>
          <li><strong>Footer</strong> — contact, links, brand story & copyright</li>
        </ul>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading website content...</div>;
  }

  return (
    <>
      <PageTitle subtitle="Manage what customers see on your homepage">
        Website Content
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
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active
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
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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
