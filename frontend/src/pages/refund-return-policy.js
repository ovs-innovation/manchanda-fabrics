import React from "react";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import PolicyPage from "@components/policy/PolicyPage";

const DEFAULT_CONTENT = `<p style="background-color: #fbf2f2; border-left: 4px solid #B0322F; padding: 16px 20px; font-weight: 600; color: #2c2320; border-radius: 4px; font-size: 1.05rem; margin-bottom: 1.5rem;">All sales are final. We do not provide any return, refund, or exchange under any circumstances.</p>
<h2>Return & Exchange Policy</h2>
<p>At Manchanda Fabrics, every article is carefully checked by our team for defects before it is packed and shipped. Please read our policy below before placing your order.</p>
<ul>
  <li>Orders cannot be cancelled, returned, or exchanged once they have been placed.</li>
  <li>We have a proper team that checks for defects and handles packaging, so we make sure there is no defect in our articles.</li>
</ul>
<p>Kindly check your suit size and product details carefully before ordering.</p>
<h2>Need Help?</h2>
<p>If you have any questions before placing your order, please contact us on WhatsApp or through our Contact page. We are always happy to help you choose the right product.</p>`;

const RefundReturnPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <PolicyPage
      metaTitle="Refund & Return Policy"
      metaDescription="Refund and return policy of Manchanda Fabrics"
      eyebrow="Customer Care"
      title={
        showingTranslateValue(storeCustomizationSetting?.refund_return_policy?.title) ||
        "No Exchange & Return"
      }
      intro="Please read our return and exchange policy carefully before ordering."
      loading={loading}
      error={error}
      cmsData={
        storeCustomizationSetting?.refund_return_policy?.description || DEFAULT_CONTENT
      }
    />
  );
};

export default RefundReturnPolicy;
