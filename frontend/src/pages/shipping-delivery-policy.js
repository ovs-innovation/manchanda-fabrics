import React from "react";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import PolicyPage from "@components/policy/PolicyPage";

const DEFAULT_CONTENT = `<h2>Shipping</h2>
<ul>
  <li>Enjoy <strong>express shipping</strong> on all orders.</li>
  <li>Delivery is completed within <strong>5-7 working days</strong> from the date of dispatch.</li>
</ul>
<h2>Where We Deliver</h2>
<p>Manchanda Fabrics delivers across all major cities and towns in India, packed carefully so your order reaches you in perfect condition.</p>
<h2>Order Tracking</h2>
<p>Once your order is dispatched, we send you a tracking link on WhatsApp, SMS, and email so you can follow your parcel until it arrives.</p>
<h2>Delivery Help</h2>
<p>If a delivery is missed due to an incorrect address or if no one is available, our courier will attempt re-delivery. For any help, message us on WhatsApp or visit our Contact page.</p>`;

const ShippingDeliveryPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <PolicyPage
      metaTitle="Shipping & Delivery Policy"
      metaDescription="Shipping and delivery policy of Manchanda Fabrics"
      eyebrow="Orders & Delivery"
      title={
        showingTranslateValue(storeCustomizationSetting?.shipping_delivery_policy?.title) ||
        "Shipping & Delivery Policy"
      }
      intro="How and when your order reaches you."
      loading={loading}
      error={error}
      cmsData={
        storeCustomizationSetting?.shipping_delivery_policy?.description || DEFAULT_CONTENT
      }
    />
  );
};

export default ShippingDeliveryPolicy;
