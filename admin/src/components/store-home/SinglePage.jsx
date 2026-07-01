import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings, FiInfo } from "react-icons/fi";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import TextAreaCom from "@/components/form/others/TextAreaCom";

const TRUST_POINTS = [
  {
    label: "Free / Fast Delivery",
    name: "slug_page_card_description_one",
    placeholder: "Pan-India delivery on all orders",
  },
  {
    label: "Easy Returns",
    name: "slug_page_card_description_two",
    placeholder: "Hassle-free returns within 7 days",
  },
  {
    label: "Authentic Quality",
    name: "slug_page_card_description_three",
    placeholder: "Premium fabrics sourced from trusted weavers",
  },
  {
    label: "Secure Payment",
    name: "slug_page_card_description_four",
    placeholder: "UPI, cards & COD accepted",
  },
];

const SinglePageSetting = ({
  isSave,
  register,
  errors,
  isSubmitting,
  singleProductPageRightBox,
  setSingleProductPageRightBox,
}) => {
  const { t } = useTranslation();

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
            <p className="text-sm text-[#2B211E]/80">
              Trust badges shown on the product page sidebar (when enabled). Keep messages short and clear.
            </p>
          </div>
        </div>

        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("RightBox")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                <p className="text-xs text-gray-500 mt-1">Show trust points on product pages</p>
              </div>
              <SwitchToggle
                handleProcess={setSingleProductPageRightBox}
                processOption={singleProductPageRightBox}
              />
            </div>

            {singleProductPageRightBox && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TRUST_POINTS.map((point) => (
                  <div key={point.name} className="bg-white p-5 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {point.label}
                    </label>
                    <TextAreaCom
                      register={register}
                      label={point.label}
                      name={point.name}
                      type="text"
                      placeholder={point.placeholder}
                    />
                    <Error errorName={errors[point.name]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SinglePageSetting;
