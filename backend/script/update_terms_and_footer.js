require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const COMBINED_TERMS_HTML = `<p>Welcome to <strong>Manchanda Fabrics</strong>. By visiting our website, exploring our catalog, or purchasing our products, you engage in our service and agree to be bound by the following Terms &amp; Conditions, including our No Return &amp; Exchange Policy and Privacy Policy. Please read them carefully.</p>

<h2>1. General Online Store Terms</h2>
<p>By using this website, you confirm that you are at least the age of majority in your jurisdiction. All products, services, and content provided on this website are for personal and legitimate use only. You may not use our products or platform for any unauthorized or unlawful activity.</p>

<h2>2. Product Information &amp; Fabric Characteristics</h2>
<p>We take pride in presenting our handcrafted ethnic wear, unstitched suit fabrics, and luxury textiles with the highest accuracy. However, please note:</p>
<ul>
  <li>Natural handloom and artisanal fabrics may have subtle variations in weave, texture, embroidery, and block printing, which are inherent characteristics of handmade craftsmanship.</li>
  <li>Due to studio lighting, digital photography, and varied screen colour profiles, slight color variations between actual fabric and on-screen images may occur.</li>
  <li>Product prices and availability are subject to change without prior notice.</li>
</ul>

<h2>3. Orders &amp; Billing</h2>
<p>We reserve the right to accept, limit, or decline any order placed with us. When placing an order, you agree to provide complete, current, and accurate billing and delivery details so that we can promptly process and dispatch your parcel.</p>

<h2>4. Shipping &amp; Delivery</h2>
<p>We partner with reliable courier and logistics services to deliver across India. Dispatch typically takes 1–3 business days from order confirmation. Delivery timelines are estimates and may occasionally be influenced by courier transit conditions, holidays, or weather disruptions.</p>

<h2>5. Strict No Exchange &amp; No Return Policy</h2>
<div style="background-color: #fbf2f2; border-left: 4px solid #B0322F; padding: 16px 20px; font-weight: 600; color: #2c2320; border-radius: 6px; font-size: 1.02rem; margin: 1.2rem 0 1.5rem 0; line-height: 1.6;">
All sales are final. We strictly do not accept any returns, refunds, or exchanges under any circumstances.
</div>
<p>At Manchanda Fabrics, our dedicated team carefully inspects every article for defects, measurements, and fabric integrity before it is packed and dispatched. Because of this thorough quality control process, our policy is as follows:</p>
<ul>
  <li><strong>No Cancellations:</strong> Orders cannot be cancelled, modified, or refunded once placed.</li>
  <li><strong>No Returns or Refunds:</strong> We do not accept returns or process refunds once the product has been delivered.</li>
  <li><strong>No Exchanges:</strong> We do not offer exchanges for colour preference, size mismatch, or change of mind.</li>
  <li><strong>Pre-Purchase Assistance:</strong> We encourage you to carefully check product descriptions, fabric types, and measurements before placing an order. If you need any assistance or have questions prior to purchase, please reach out to our team via WhatsApp.</li>
</ul>

<h2>6. Privacy Policy &amp; Data Protection</h2>
<p>We respect your privacy and are committed to safeguarding your personal data:</p>
<ul>
  <li><strong>Information We Collect:</strong> We collect essential information such as your name, email address, phone number, and delivery address when you register or place an order.</li>
  <li><strong>How We Use Your Data:</strong> Your data is used exclusively to fulfill your orders, send delivery tracking updates, answer customer inquiries, and improve our services.</li>
  <li><strong>No Selling of Data:</strong> We do not sell, rent, or lease your personal information to any third parties or marketing agencies.</li>
  <li><strong>Trusted Partners:</strong> We only share necessary delivery details (name, address, contact number) with licensed logistics providers to ensure delivery of your parcels.</li>
  <li><strong>Cookies:</strong> Our website uses standard session cookies to remember cart items and provide a smooth browsing experience.</li>
  <li><strong>Security:</strong> We implement rigorous technical and administrative security measures to protect your information against unauthorized access, loss, or alteration.</li>
</ul>

<h2>7. Intellectual Property</h2>
<p>All brand names, logos, images, text, and visual content published on this website are the intellectual property of Manchanda Fabrics and may not be copied, reproduced, or used without our express written consent.</p>

<h2>8. Governing Law &amp; Jurisdiction</h2>
<p>These terms and all transactions through Manchanda Fabrics shall be governed by and interpreted under the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Delhi, India.</p>

<h2>9. Contact Us</h2>
<p>If you have any questions regarding these Terms &amp; Conditions, please contact us:</p>
<ul>
  <li><strong>Address:</strong> 12-A, Krishna Cloth Market, Chandni Chowk, Delhi – 110006</li>
  <li><strong>Phone / WhatsApp:</strong> +91-9650544554</li>
  <li><strong>Email:</strong> manchandafabrics@gmail.com</li>
</ul>`;

const updateTermsAndFooter = async () => {
  try {
    await connectDB();
    console.log("Connected to database...");

    const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
    if (!doc) {
      console.log("storeCustomizationSetting not found!");
      process.exit(1);
    }

    if (!doc.setting) doc.setting = {};

    // 1. Update Terms & Conditions content
    if (!doc.setting.term_and_condition) doc.setting.term_and_condition = {};
    doc.setting.term_and_condition.title = {
      en: "Terms & Conditions",
      de: "Terms & Conditions",
    };
    doc.setting.term_and_condition.description = {
      en: COMBINED_TERMS_HTML,
      de: COMBINED_TERMS_HTML,
    };

    // 2. Update Footer quickLinks in manchandaHomepage
    if (!doc.setting.manchandaHomepage) doc.setting.manchandaHomepage = {};
    if (!doc.setting.manchandaHomepage.footer) doc.setting.manchandaHomepage.footer = {};
    
    doc.setting.manchandaHomepage.footer.quickLinks = [
      { title: "About Us", href: "/about-us" },
      { title: "My Orders", href: "/user/my-orders" },
      { title: "Terms & Conditions", href: "/terms-and-conditions" },
      { title: "Contact us", href: "/contact-us" },
    ];

    doc.markModified("setting");
    await doc.save();

    console.log("Successfully updated Terms & Conditions and Footer quickLinks in MongoDB!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error updating DB:", err);
    process.exit(1);
  }
};

updateTermsAndFooter();
