import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";

import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import Uploader from "@/components/image-uploader/Uploader";
import TextAreaCom from "@/components/form/others/TextAreaCom";

const SeoSetting = ({
  errors,
  register,
  isSave,
  favicon,
  setFavicon,
  metaImg,
  setMetaImg,
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

      <div className="grid grid-cols-12 font-sans max-w-2xl">
        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">SEO Settings</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("Favicon")}</label>
              <Uploader imageUrl={favicon} setImageUrl={setFavicon} folder="favicon" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("MetaTitle")}</label>
              <InputAreaTwo
                register={register}
                label={t("MetaTitle")}
                name="meta_title"
                type="text"
                placeholder="Manchanda Fabrics — Premium Ethnic Wear"
              />
              <Error errorName={errors.meta_title} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("MetaDescription")}</label>
              <TextAreaCom
                required
                register={register}
                label={t("MetaDescription")}
                name="meta_description"
                type="text"
                placeholder="Shop sarees, suits & fabrics online"
              />
              <Error errorName={errors.meta_description} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("MetaImage")}</label>
              <Uploader imageUrl={metaImg} setImageUrl={setMetaImg} folder="seo" />
              <p className="text-xs text-gray-400 mt-2">Used when sharing links on social media</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeoSetting;
