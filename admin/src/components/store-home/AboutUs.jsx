import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import TextAreaCom from "@/components/form/others/TextAreaCom";

const AboutUs = ({ isSave, register, errors, isSubmitting }) => {
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
            <h2 className="text-xl font-bold text-[#004f56]">{t("AboutUs")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-6">
            <p className="text-sm text-gray-500">
              Hero section text on the About Us page. Other sections use fixed Manchanda branding.
            </p>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hero Title</label>
              <InputAreaTwo
                register={register}
                label="Hero Title"
                name="about_page_Top_title"
                type="text"
                placeholder="Weave Your Story With Timeless Elegance"
              />
              <Error errorName={errors.about_page_Top_title} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hero Description</label>
              <TextAreaCom
                register={register}
                label="Hero Description"
                name="about_us_top_description"
                type="text"
                placeholder="Brief brand story shown below the title"
              />
              <Error errorName={errors.about_us_top_description} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
