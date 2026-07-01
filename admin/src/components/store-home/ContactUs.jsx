import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import TextAreaCom from "@/components/form/others/TextAreaCom";

const ContactUs = ({ isSave, errors, register, isSubmitting }) => {
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
            <h2 className="text-xl font-bold text-[#004f56]">{t("ContactUs")}</h2>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Store contact details used on Contact page, footer, invoices &amp; WhatsApp.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-800">{t("CallUs")}</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone / WhatsApp</label>
                <InputAreaTwo
                  register={register}
                  label="Phone"
                  name="call_box_phone"
                  type="text"
                  placeholder="+91 98765 43210"
                />
                <Error errorName={errors.call_box_phone} />
              </div>
            </div>

            <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-800">{t("EmailUs")}</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <InputAreaTwo
                  register={register}
                  label="Email"
                  name="email_box_email"
                  type="text"
                  placeholder="info@manchandafabrics.com"
                />
                <Error errorName={errors.email_box_email} />
              </div>
            </div>

            <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-5 lg:col-span-2">
              <h3 className="font-bold text-gray-800">{t("Address")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Line 1</label>
                  <InputAreaTwo
                    register={register}
                    label="Address Line 1"
                    name="address_box_address_one"
                    type="text"
                    placeholder="12-A, Krishna Market"
                  />
                  <Error errorName={errors.address_box_address_one} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Line 2</label>
                  <InputAreaTwo
                    register={register}
                    label="Address Line 2"
                    name="address_box_address_two"
                    type="text"
                    placeholder="Chandni Chowk"
                  />
                  <Error errorName={errors.address_box_address_two} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City &amp; PIN</label>
                  <InputAreaTwo
                    register={register}
                    label="Address Line 3"
                    name="address_box_address_three"
                    type="text"
                    placeholder="Delhi - 110006"
                  />
                  <Error errorName={errors.address_box_address_three} />
                </div>
              </div>
            </div>

            <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-5 lg:col-span-2">
              <h3 className="font-bold text-gray-800">WhatsApp Group (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Group Link</label>
                  <InputAreaTwo
                    register={register}
                    label="WhatsApp Group Link"
                    name="whatsapp_group_link"
                    type="text"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                  <Error errorName={errors.whatsapp_group_link} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Group Title</label>
                  <InputAreaTwo
                    register={register}
                    label="Group Title"
                    name="whatsapp_group_title"
                    type="text"
                    placeholder="Join Our WhatsApp Group"
                  />
                  <Error errorName={errors.whatsapp_group_title} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Group Description</label>
                  <TextAreaCom
                    register={register}
                    label="Group Description"
                    name="whatsapp_group_text"
                    type="text"
                    placeholder="Get new arrivals and offers on WhatsApp"
                  />
                  <Error errorName={errors.whatsapp_group_text} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
