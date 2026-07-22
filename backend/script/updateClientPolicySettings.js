require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();

  console.log("Updating client policy settings...");
  let customSet = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (customSet) {
    if (!customSet.setting) customSet.setting = {};

    // 1. Privacy Policy
    customSet.setting.privacy_policy = {
      title: { en: "Privacy Policy" },
      description: { en: `<p>We value your privacy and are committed to protecting your personal information.</p>
<h2>Information We Collect:</h2>
<ul>
  <li>Name</li>
  <li>Phone number</li>
  <li>Email address</li>
  <li>Shipping address</li>
  <li>Billing information</li>
  <li>Order details</li>
</ul>
<h2>How We Use Your Information:</h2>
<ul>
  <li>To process and deliver orders</li>
  <li>To provide customer support</li>
  <li>To send order updates and tracking details</li>
  <li>To improve our products and services</li>
  <li>To comply with legal obligations</li>
</ul>
<h2>Data Security:</h2>
<p>We implement reasonable security measures to protect your personal information from unauthorized access, misuse, or disclosure.</p>
<h2>Third-Party Services:</h2>
<p>We may share necessary customer information with trusted logistics partners, payment gateways, and service providers solely for order fulfillment and operational purposes.</p>
<p>We do not sell customer information to third parties.</p>` }
    };

    // 2. Refund & Return Policy
    customSet.setting.refund_return_policy = {
      title: { en: "Return & Refund Policy" },
      description: { en: `<p style="background-color: #fbf2f2; border-left: 4px solid #B0322F; padding: 16px 20px; font-weight: 600; color: #2c2320; border-radius: 4px; font-size: 1.05rem; margin-bottom: 1.5rem;">All sales are final. We do not provide any return, refund, or exchange under any circumstances.</p>
<h2>Return & Exchange Policy</h2>
<p>At Manchanda Fabrics, every article is carefully checked by our team for defects before it is packed and shipped. Please read our policy below before placing your order.</p>
<ul>
  <li>Orders cannot be cancelled, returned, or exchanged once they have been placed.</li>
  <li>We have a proper team that checks for defects and handles packaging, so we make sure there is no defect in our articles.</li>
</ul>
<p>Kindly check your suit size and product details carefully before ordering.</p>
<h2>Need Help?</h2>
<p>If you have any questions before placing your order, please contact us on WhatsApp or through our Contact page. We are always happy to help you choose the right product.</p>` }
    };

    // 3. Shipping & Delivery Policy
    customSet.setting.shipping_delivery_policy = {
      title: { en: "Shipping & Delivery Policy" },
      description: { en: `<p>We currently deliver across India.</p>
<p><strong>Order Processing:</strong></p>
<ul>
  <li>Orders are typically processed within 2–4 business days after successful payment confirmation.</li>
</ul>
<p><strong>Tracking Information:</strong></p>
<ul>
  <li>Tracking details will be shared via WhatsApp within approximately 3–4 days of placing your order.</li>
</ul>
<p><strong>Estimated Delivery Timeline:</strong></p>
<ul>
  <li>Most orders are delivered within 1–2 weeks from the date of order placement. In special cases it may take up-to 3 weeks depending on the delivery address.</li>
  <li>Delivery timelines may vary depending on location, courier operations, public holidays, weather conditions, and other unforeseen circumstances.</li>
</ul>
<p>Customers are responsible for ensuring that the shipping information provided during checkout is accurate and complete.</p>
<p>In the event of delivery delays caused by courier partners or circumstances beyond our control, we will provide updates and assistance.</p>` }
    };

    // 4. Terms & Conditions
    customSet.setting.term_and_condition = {
      title: { en: "Terms & Conditions" },
      description: { en: `<p>By using this website, you agree to the following terms:</p>
<h2>1. Product Information</h2>
<p>We aim to ensure all product images and descriptions are accurate. Minor variations in color or appearance may occur due to lighting, photography, or screen settings.</p>
<h2>2. Pricing</h2>
<p>All prices are listed in INR and are subject to change without prior notice.</p>
<h2>3. Orders</h2>
<p>We reserve the right to accept, reject, or cancel any order at our discretion.</p>
<h2>4. Shipping</h2>
<p>Delivery timelines are estimates and may vary due to courier operations or unforeseen circumstances.</p>
<h2>5. Returns & Exchanges</h2>
<p>Returns and exchanges are subject to our Return & Refund Policy.</p>
<h2>6. Contact Us</h2>
<p>For any queries, please reach out to us via email or WhatsApp support.</p>
<p>Social media: @manchandafabrics</p>` }
    };

    customSet.markModified("setting");
    await customSet.save();
    console.log("✅ Updated storeCustomizationSetting client policies.");
  } else {
    console.warn("storeCustomizationSetting document not found.");
  }

  await mongoose.connection.close();
  console.log("Client policies settings update complete.");
};

run().catch(err => {
  console.error("Failed to update client policy settings:", err);
  process.exit(1);
});
