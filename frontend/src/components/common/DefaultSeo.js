import React from "react";
import { DefaultSeo as NextSeo } from "next-seo";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";

const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/tu23xpla/image/upload/v1790413952/seo/manchanda_og_preview.jpg";
const DEFAULT_TITLE =
  "Manchanda Fabrics - unstitched suit fabrics, chosen with care - from our family to yours";
const DEFAULT_DESC =
  "Unstitched suit fabrics, chosen with care — from our family to yours. Handpicked suits, silks & fabrics since 1990 from Chandni Chowk, Delhi.";
const DEFAULT_URL = "https://manchandafabric.in";

const DefaultSeo = () => {
  const { globalSetting, storeCustomizationSetting } = useGetSetting();

  // Guard against legacy template values
  const rawMetaImg = storeCustomizationSetting?.seo?.meta_img;
  const isKachaBazarLegacyImg =
    !rawMetaImg ||
    rawMetaImg.includes("ahossain") ||
    rawMetaImg.includes("facebook-page_j7alju.png");

  const rawTitle = storeCustomizationSetting?.seo?.meta_title;
  const isLegacyTitle =
    !rawTitle ||
    rawTitle.toLowerCase().includes("template") ||
    rawTitle.toLowerCase().includes("kachabazar");

  const rawDesc = storeCustomizationSetting?.seo?.meta_description;
  const isLegacyDesc =
    !rawDesc ||
    rawDesc.toLowerCase().includes("template") ||
    rawDesc.toLowerCase().includes("kachabazar");

  const rawUrl = storeCustomizationSetting?.seo?.meta_url || globalSetting?.website;
  const isLegacyUrl =
    !rawUrl || rawUrl.includes("vercel.app");

  const metaTitle = isLegacyTitle ? DEFAULT_TITLE : rawTitle;
  const metaDescription = isLegacyDesc ? DEFAULT_DESC : rawDesc;
  const metaUrl = isLegacyUrl ? DEFAULT_URL : rawUrl;

  const brandLogo = pickBrandLogo(
    storeCustomizationSetting?.navbar?.logo,
    storeCustomizationSetting?.seo?.favicon,
    globalSetting?.logo
  );
  const metaImage = isKachaBazarLegacyImg ? DEFAULT_OG_IMAGE : rawMetaImg;
  const favicon = brandLogo || "/favicon.png";

  return (
    <NextSeo
      title={metaTitle}
      description={metaDescription}
      openGraph={{
        type: "website",
        locale: "en_IN",
        url: metaUrl,
        site_name: "Manchanda Fabrics",
        images: [
          {
            url: metaImage,
            width: 1200,
            height: 630,
            alt: metaTitle,
            type: "image/jpeg",
          },
        ],
      }}
      twitter={{
        handle: "@manchandafabrics",
        site: "@manchandafabrics",
        cardType: "summary_large_image",
      }}
      additionalMetaTags={[
        {
          name: "viewport",
          content:
            "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
        },
        {
          name: "mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "theme-color",
          content: "#ffffff",
        },
        {
          name: "description",
          content: metaDescription,
        },
      ]}
      additionalLinkTags={[
        {
          rel: "icon",
          href: favicon,
        },
        {
          rel: "shortcut icon",
          href: favicon,
        },
        {
          rel: "apple-touch-icon",
          href: favicon,
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
      ]}
    />
  );
};

export default DefaultSeo;
