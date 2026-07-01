import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";

const DASHBOARD_FIELDS = [
  { name: "dashboard_title", label: "Dashboard Title" },
  { name: "my_order", label: "My Orders" },
  { name: "recent_order", label: "Recent Orders" },
  { name: "update_profile", label: "Update Profile" },
  { name: "invoice_message_first", label: "Invoice Message (line 1)" },
  { name: "invoice_message_last", label: "Invoice Message (line 2)" },
  { name: "full_name", label: "Full Name Label" },
  { name: "user_phone", label: "Phone Label" },
  { name: "user_email", label: "Email Label" },
  { name: "update_button", label: "Update Button" },
  { name: "change_password", label: "Change Password" },
];

const DashboardSetting = ({ isSave, errors, register, isSubmitting }) => {
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
            <h2 className="text-xl font-bold text-[#004f56]">{t("DashboardSetting")}</h2>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Labels for user dashboard, profile &amp; order invoice pages.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DASHBOARD_FIELDS.map((field) => (
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

export default DashboardSetting;
