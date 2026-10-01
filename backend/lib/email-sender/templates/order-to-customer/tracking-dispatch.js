const orderTrackingDispatchBody = (option) => {
  const shopName = option.shop_name || "Manchanda Fabrics";
  const logo =
    option.logo ||
    `${(process.env.STORE_URL || "https://manchandafabrics.com").replace(/\/$/, "")}/manchandalogo.png`;

  const itemsHtml = (option.cart || [])
    .map((item) => {
      const title =
        typeof item.title === "object"
          ? item.title.en || item.title.name || "Suit Material"
          : item.title || "Suit Material";
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F1E8E4;font-size:13px;">
          <div style="color:#3B2A25;font-weight:600;flex:1;padding-right:12px;">${title}</div>
          <div style="color:#6B5B55;font-size:12px;white-space:nowrap;">Qty: <strong>${item.quantity || 1}</strong></div>
        </div>
      `;
    })
    .join("");

  return `
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Dispatched - ${shopName}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #3B2A25; margin: 0; padding: 0; background: #FAF7F5; }
    .wrap { max-width: 600px; margin: 24px auto; background: #ffffff; border: 1px solid #E6D1CB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .bar { height: 6px; background: #9C6A5A; }
    .body { padding: 28px 30px; }
    .header { text-align: center; margin-bottom: 22px; }
    .logo { max-width: 160px; max-height: 64px; object-fit: contain; margin: 0 auto 12px; display: block; }
    .badge { display: inline-block; background: #E8F5E9; color: #2E7D32; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 12px; margin-bottom: 8px; }
    h1 { color: #9C6A5A; margin: 0 0 8px; font-size: 24px; font-weight: 700; }
    .greeting { color: #3B2A25; font-size: 15px; margin: 0; }
    
    .tracking-card { background: #FAF7F5; border: 1.5px solid #9C6A5A; border-radius: 12px; padding: 20px; margin: 24px 0 20px 0; text-align: center; }
    .tracking-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #6B5B55; margin-bottom: 6px; }
    .tracking-number { font-size: 20px; font-weight: 900; color: #3B2A25; letter-spacing: 0.08em; font-family: 'Courier New', Courier, monospace; margin: 4px 0 12px 0; word-break: break-all; }
    .courier-meta { display: flex; justify-content: center; gap: 16px; font-size: 12px; color: #6B5B55; margin-bottom: 16px; flex-wrap: wrap; }
    .courier-pill { background: #ffffff; border: 1px solid #E6D1CB; padding: 3px 10px; border-radius: 6px; font-weight: 700; color: #3B2A25; }
    
    .btn { display: inline-block; padding: 13px 30px; background: #9C6A5A; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; letter-spacing: 0.03em; }
    
    .meta-box { background: #FAF7F5; border: 1px solid #E6D1CB; border-radius: 10px; padding: 16px 18px; margin: 20px 0; }
    .meta-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13.5px; }
    .meta-label { color: #6B5B55; }
    .meta-value { color: #3B2A25; font-weight: 700; }
    
    .items-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #6B5B55; margin: 20px 0 8px 0; }
    
    .security-note { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #92400E; margin-top: 20px; line-height: 1.4; }
    .footer { text-align: center; font-size: 11.5px; color: #9CA3AF; padding: 18px 24px; border-top: 1px solid #F1E8E4; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="bar"></div>
    <div class="body">
      <div class="header">
        <img class="logo" src="${logo}" alt="${shopName}" />
        <span class="badge">🚚 Dispatched &amp; In Transit</span>
        <h1>Your Parcel Has Shipped!</h1>
        <p class="greeting">Hi ${option.name || "there"}, exciting news! Your order <strong>#${option.invoice}</strong> has been packed and handed over to our courier partner.</p>
      </div>

      <div class="tracking-card">
        <div class="tracking-label">AWB / Tracking Number</div>
        <div class="tracking-number">${option.trackingNumber || "Assigned"}</div>
        <div class="courier-meta">
          <span>Courier Partner: <span class="courier-pill">${option.courierName || "Express Courier"}</span></span>
          ${option.destinationCity ? `<span>Destination: <span class="courier-pill">${option.destinationCity}</span></span>` : ""}
        </div>
        <div>
          <a href="${option.trackingUrl}" class="btn" target="_blank">Track Your Package Live &rarr;</a>
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Order Reference:</span>
          <span class="meta-value">#${option.invoice}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Dispatch Date:</span>
          <span class="meta-value">${option.dispatchDate || new Date().toLocaleDateString("en-IN")}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Payment Method:</span>
          <span class="meta-value">${option.paymentMethod || "Prepaid"}</span>
        </div>
        ${option.destinationAddress ? `
        <div class="meta-row" style="flex-direction:column;gap:3px;margin-top:4px;">
          <span class="meta-label">Shipping Destination:</span>
          <span class="meta-value" style="font-weight:500;font-size:12.5px;">${option.destinationAddress}</span>
        </div>` : ""}
      </div>

      ${(option.cart && option.cart.length > 0) ? `
      <div>
        <div class="items-title">Items in This Parcel</div>
        ${itemsHtml}
      </div>` : ""}

      <div class="security-note">
        <strong>⚠️ Delivery Note:</strong> For your security, please inspect the tamper-evident packaging tape upon delivery. Do not accept if the outer parcel is torn or tampered.
      </div>

      <p style="font-size:13px;color:#6B5B55;margin-top:20px;text-align:center;">
        Questions about your shipment? Write to <a href="mailto:${option.contact_email}" style="color:#9C6A5A;font-weight:700;">${option.contact_email}</a> or reach out on WhatsApp/Helpline: +91 88824 00949.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${shopName}. All rights reserved.<br/>
      Thank you for choosing Manchanda Fabrics.
    </div>
  </div>
</body>
</html>`;
};

module.exports = { orderTrackingDispatchBody };
