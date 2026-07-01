import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";
import { MultiSelect } from "react-multi-select-component";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";

const Offer = ({
  errors,
  isSave,
  coupons,
  register,
  couponList1,
  setCouponList1,
  isSubmitting,
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
        <div className="col-span-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("Offers")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-6">
            <p className="text-sm text-gray-500">
              Page title and which coupons appear on the Offers page.
            </p>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("PageTitle")}</label>
              <InputAreaTwo
                register={register}
                label="Page Title"
                name="offers_page_title"
                type="text"
                placeholder="Special Offers"
              />
              <Error errorName={errors.offers_page_title} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("SuperDiscountActiveCouponCode")}
              </label>
              <MultiSelect
                options={coupons}
                value={couponList1}
                className="rounded-xl border-gray-200"
                onChange={(v) => setCouponList1(v)}
                labelledBy="Select Coupon"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Offer;
