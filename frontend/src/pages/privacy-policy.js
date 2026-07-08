import React from "react";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import PolicyPage from "@components/policy/PolicyPage";

const DEFAULT_CONTENT = `<p>We value the trust you place in Manchanda Fabrics. Please read the following privacy policy carefully. By using and/or accessing our website you acknowledge that you have read, understood and agree to be bound by all the terms mentioned in this privacy policy and other pages of this website.</p>
<p><strong>Note:</strong> Our privacy policy is subject to change at any time without notice. The revised privacy policy is effective immediately when posted on the website. To make sure you are aware of any changes, please review this privacy policy periodically.</p>
<h2>1. Collection of Personally Identifiable Information</h2>
<p>We collect personally identifiable information such as your name, email address, phone number, and shipping and billing address when you make a purchase with Manchanda Fabrics. We may use your contact information to send you promotional and timely offers.</p>
<h2>2. Use of Demographic and Profile Data</h2>
<p>We use your personal information to provide the services you request, resolve disputes, troubleshoot problems, promote a safe service, inform you about offers, products and updates, customize your experience, and protect against fraud and other criminal activity. Where we use your information to market to you, we always give you the ability to opt out.</p>
<h2>3. Cookies</h2>
<p>A cookie is a small piece of information stored by a web server on your browser to remember information specific to you. Our cookies do not contain any personally identifiable information. You can choose to accept or decline cookies through your browser settings, but declining may affect your experience on parts of our website.</p>
<h2>4. Sharing of Personal Information</h2>
<p>We may share necessary details (like your address and phone number) with trusted logistics and delivery partners to fulfil your order. We may also disclose personal information if required to do so by law. We do not sell your personal information to third parties.</p>
<h2>5. Security Precautions</h2>
<p>Our site has security measures in place to protect against the loss, misuse and alteration of the information under our control. Once your information is with us, we follow strict security guidelines to protect it against unauthorized access.</p>
<h2>6. Contact</h2>
<p>For any questions about how your data is handled, or to view, correct or delete your information, please contact us on WhatsApp or through our Contact page.</p>`;

const PrivacyPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <PolicyPage
      metaTitle="Privacy Policy"
      metaDescription="Privacy policy of Manchanda Fabrics"
      eyebrow="Your Privacy"
      title={
        showingTranslateValue(storeCustomizationSetting?.privacy_policy?.title) ||
        "Privacy Policy"
      }
      intro="Your trust matters to us. Here is how we handle your information."
      loading={loading}
      error={error}
      cmsData={
        storeCustomizationSetting?.privacy_policy?.description || DEFAULT_CONTENT
      }
    />
  );
};

export default PrivacyPolicy;
