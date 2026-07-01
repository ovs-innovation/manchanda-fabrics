import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";

const CHECKOUT_LABELS = [
  { name: "personal_details", label: "Personal Details (section title)" },
  { name: "continue_button", label: "Continue Button" },
  { name: "order_summary", label: "Order Summary (section title)" },
  { name: "apply_button", label: "Apply Coupon Button" },
  { name: "discount", label: "Discount Label" },
  { name: "total_cost", label: "Total Label" },
  { name: "confirm_button", label: "Place Order Button" },
];

const Checkout = ({ isSave, errors, register, isSubmitting }) => {
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
        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("Checkout")}</h2>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Customize button and section labels on the checkout page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {CHECKOUT_LABELS.map((field) => (
              <div key={field.name} className="bg-[#f9fafb] rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                <InputAreaTwo
                  register={register}
                  label={field.label}
                  name={field.name}
                  type="text"
                  placeholder={field.label}
                />
                <Error errorName={errors[field.name]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
