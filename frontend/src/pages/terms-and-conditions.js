import React from "react";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import PolicyPage from "@components/policy/PolicyPage";

const DEFAULT_CONTENT = `<p>This website is operated by Manchanda Fabrics. Throughout the site, the terms "we", "us" and "our" refer to Manchanda Fabrics. By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including the additional terms and policies referenced herein. Please read these Terms carefully before using our website. If you do not agree to all the terms, you may not access the website or use any services.</p>
<h2>1. Online Store Terms</h2>
<p>By agreeing to these Terms, you confirm that you are at least the age of majority in your state, or that you have given us consent to allow any minor dependents to use this site. You may not use our products for any illegal or unauthorized purpose, nor may you violate any laws in your jurisdiction. You must not transmit any worms, viruses or any code of a destructive nature. A breach of any of these Terms will result in immediate termination of your Services.</p>
<h2>2. General Conditions</h2>
<p>We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell or exploit any portion of the Service without our express written permission.</p>
<h2>3. Accuracy of Information</h2>
<p>We are not responsible if information made available on this site is not accurate, complete or current. Any reliance on the material on this site is at your own risk. We reserve the right to modify the contents of this site at any time.</p>
<h2>4. Products & Pricing</h2>
<p>Prices for our products are subject to change without notice. We have made every effort to display the colours and images of our products as accurately as possible, but we cannot guarantee that your screen's display of any colour will be accurate. Since fabrics are natural, slight variations in shade or texture may occur. We reserve the right to limit quantities or discontinue any product at any time.</p>
<h2>5. Billing & Account Information</h2>
<p>We reserve the right to refuse any order you place with us. You agree to provide current, complete and accurate purchase and account information for all purchases. Please review our Return &amp; Exchange Policy for more detail.</p>
<h2>6. Personal Information</h2>
<p>Your submission of personal information through the store is governed by our Privacy Policy.</p>
<h2>7. Prohibited Uses</h2>
<p>You are prohibited from using the site or its content for any unlawful purpose, to violate any laws, to infringe our intellectual property, to harass or abuse others, to submit false information, or to upload malicious code. We reserve the right to terminate your use of the Service for violating any of these prohibited uses.</p>
<h2>8. Limitation of Liability</h2>
<p>We do not guarantee that your use of our service will be uninterrupted, timely, secure or error-free. The service and all products delivered to you are provided "as is" and "as available" for your use. To the maximum extent permitted by law, Manchanda Fabrics shall not be liable for any injury, loss or damages arising from your use of the service or any products purchased.</p>
<h2>9. Governing Law</h2>
<p>These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India, under the jurisdiction of Delhi.</p>
<h2>10. Changes to Terms</h2>
<p>We reserve the right to update, change or replace any part of these Terms of Service by posting updates to our website. It is your responsibility to check this page periodically for changes. Your continued use of the website following any changes constitutes acceptance of those changes.</p>`;

const TermAndConditions = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, loading, error } = useGetSetting();

  return (
    <PolicyPage
      metaTitle="Terms & Conditions"
      metaDescription="Terms and conditions of Manchanda Fabrics"
      eyebrow="Legal"
      title={
        showingTranslateValue(storeCustomizationSetting?.term_and_condition?.title) ||
        "Terms & Conditions"
      }
      intro="A few simple terms for shopping with Manchanda Fabrics."
      loading={loading}
      error={error}
      cmsData={
        storeCustomizationSetting?.term_and_condition?.description || DEFAULT_CONTENT
      }
    />
  );
};

export default TermAndConditions;
