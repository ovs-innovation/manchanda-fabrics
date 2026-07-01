import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings, FiInfo } from "react-icons/fi";
import { Link } from "react-router-dom";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import Uploader from "@/components/image-uploader/Uploader";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import SwitchToggle from "@/components/form/switch/SwitchToggle";

const HomePage = ({
  register,
  errors,
  headerLogo,
  setHeaderLogo,
  isSave,
  isSubmitting,
  setCategoriesMenuLink,
  categoriesMenuLink,
  setAboutUsMenuLink,
  aboutUsMenuLink,
  setContactUsMenuLink,
  contactUsMenuLink,
  setOffersMenuLink,
  offersMenuLink,
}) => {
  const { t } = useTranslation();

  const menuItems = [
    {
      label: t("Categories"),
      name: "categories",
      toggle: categoriesMenuLink,
      setToggle: setCategoriesMenuLink,
    },
    {
      label: t("AboutUs"),
      name: "about_us",
      toggle: aboutUsMenuLink,
      setToggle: setAboutUsMenuLink,
    },
    {
      label: t("ContactUs"),
      name: "contact_us",
      toggle: contactUsMenuLink,
      setToggle: setContactUsMenuLink,
    },
    {
      label: t("Offers"),
      name: "offers",
      toggle: offersMenuLink,
      setToggle: setOffersMenuLink,
    },
  ];

  return (
    <>
      <div className="sticky top-0 z-20 flex justify-end">
        {isSubmitting ? (
          <Button disabled type="button" className="h-10 px-6">
            <img src={spinnerLoadingImage} alt="Loading" width={20} height={10} />
            <span className="font-serif ml-2 font-light">{t("Processing")}</span>
          </Button>
        ) : (
          <Button type="submit" className="h-10 px-6">
            {isSave ? t("SaveBtn") : t("UpdateBtn")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 font-sans pr-4">
        <div className="col-span-12 mb-8">
          <div className="bg-[#F5ECE8] border border-[#D5BBB4]/60 rounded-2xl p-5 flex gap-3">
            <FiInfo className="text-[#93614E] text-xl shrink-0 mt-0.5" />
            <div className="text-sm text-[#2B211E]/80">
              <p className="font-semibold text-[#93614E] mb-1">Homepage content</p>
              <p>
                Hero banners, category banners, trending & new arrivals are managed in{" "}
                <Link to="/store/homepage/overview" className="text-[#004f56] font-semibold underline">
                  Homepage Manager
                </Link>
                . Contact details & address are in the{" "}
                <Link
                  to="/store/customization?storeTab=contact-us-setting"
                  className="text-[#004f56] font-semibold underline"
                >
                  Contact Us
                </Link>{" "}
                tab. SEO in{" "}
                <Link
                  to="/store/customization?storeTab=seo-settings"
                  className="text-[#004f56] font-semibold underline"
                >
                  SEO Settings
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="col-span-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("Header")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100">
            <p className="text-sm text-gray-500 mb-8">
              Store logo and top-bar contact info shown on every page.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("HeaderText")}
                  </label>
                  <InputAreaTwo
                    register={register}
                    label={t("HeaderText")}
                    name="help_text"
                    type="text"
                    placeholder={t("weAreAvailable")}
                  />
                  <Error errorName={errors.help_text} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("PhoneNumber")}
                  </label>
                  <InputAreaTwo
                    register={register}
                    label={t("PhoneNumber")}
                    name="phone_number"
                    type="text"
                    placeholder="+91 98765 43210"
                  />
                  <Error errorName={errors.phone_number} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("HeaderLogo")}
                </label>
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#004f56] transition-colors text-center">
                  <Uploader
                    imageUrl={headerLogo}
                    setImageUrl={setHeaderLogo}
                    useOriginalSize
                  />
                  <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                    Recommended: 150×50px
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation menu */}
        <div className="col-span-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("MenuEditor")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100">
            <p className="text-sm text-gray-500 mb-8">
              Menu labels and visibility for the main navigation links.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                >
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    {item.label}
                  </label>
                  <InputAreaTwo
                    register={register}
                    label={item.label}
                    name={item.name}
                    type="text"
                    placeholder={item.label}
                  />
                  <Error errorName={errors[item.name]} />
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                    <SwitchToggle handleProcess={item.setToggle} processOption={item.toggle} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
