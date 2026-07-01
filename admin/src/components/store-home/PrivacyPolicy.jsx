import { Button } from "@windmill/react-ui";
import { Editor } from "react-draft-wysiwyg";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

import spinnerLoadingImage from "@/assets/img/spinner.gif";
import Error from "@/components/form/others/Error";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";

const PolicySection = ({ title, pageTitleName, editorState, setEditorState, errors, register, titleFieldLabel }) => (
  <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-5">
    <h3 className="text-lg font-bold text-[#004f56]">{title}</h3>
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{titleFieldLabel}</label>
      <InputAreaTwo
        register={register}
        label={titleFieldLabel}
        name={pageTitleName}
        type="text"
        placeholder={title}
      />
      <Error errorName={errors[pageTitleName]} />
    </div>
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">Page Content</label>
      <Editor
        editorState={editorState}
        wrapperClassName="demo-wrapper"
        editorClassName="demo-editor"
        onEditorStateChange={setEditorState}
        editorStyle={{ border: "1px solid #e5e7eb", padding: "0 15px", minHeight: 200 }}
      />
    </div>
  </div>
);

const PrivacyPolicy = ({
  isSave,
  errors,
  register,
  textEdit,
  setTextEdit,
  termsConditionsTextEdit,
  setTermsConditionsTextEdit,
  refundReturnPolicyTextEdit,
  setRefundReturnPolicyTextEdit,
  shippingDeliveryPolicyTextEdit,
  setShippingDeliveryPolicyTextEdit,
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

      <div className="grid grid-cols-12 font-sans pr-4 space-y-8">
        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("PrivacyPolicyTermsTitle")}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Legal page titles and content.</p>
        </div>

        <div className="col-span-12 space-y-8">
          <PolicySection
            title={t("PrivacyPolicy")}
            pageTitleName="privacy_page_title"
            editorState={textEdit}
            setEditorState={setTextEdit}
            errors={errors}
            register={register}
            titleFieldLabel="Page Title"
          />
          <PolicySection
            title={t("TermsConditions")}
            pageTitleName="termsConditions_page_title"
            editorState={termsConditionsTextEdit}
            setEditorState={setTermsConditionsTextEdit}
            errors={errors}
            register={register}
            titleFieldLabel="Page Title"
          />
          <PolicySection
            title="Refund & Return Policy"
            pageTitleName="refund_return_page_title"
            editorState={refundReturnPolicyTextEdit}
            setEditorState={setRefundReturnPolicyTextEdit}
            errors={errors}
            register={register}
            titleFieldLabel="Page Title"
          />
          <PolicySection
            title="Shipping & Delivery Policy"
            pageTitleName="shipping_delivery_page_title"
            editorState={shippingDeliveryPolicyTextEdit}
            setEditorState={setShippingDeliveryPolicyTextEdit}
            errors={errors}
            register={register}
            titleFieldLabel="Page Title"
          />
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
