const orderConfirmationBody = (option) => {
  const shopName = option.shop_name || "Manchanda Fabrics";
  const logo =
    option.logo ||
    `${(process.env.STORE_URL || "https://manchandafabrics.com").replace(/\/$/, "")}/manchandalogo.png`;

  return `
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <title>Order Confirmed - ${shopName}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #3B2A25; margin: 0; padding: 0; background: #FAF7F5; }
    .wrap { max-width: 600px; margin: 24px auto; background: #fff; border: 1px solid #E6D1CB; border-radius: 12px; overflow: hidden; }
    .bar { height: 6px; background: #9C6A5A; }
    .body { padding: 28px 30px; }
    .header { text-align: center; margin-bottom: 20px; }
    .logo { max-width: 160px; max-height: 64px; object-fit: contain; margin: 0 auto 12px; display: block; }
    h1 { color: #9C6A5A; margin: 0 0 8px; font-size: 24px; font-weight: 700; }
    .greeting { color: #3B2A25; font-size: 15px; margin: 0; }
    .card { background: #FAF7F5; border: 1px solid #E6D1CB; border-radius: 10px; padding: 18px 20px; margin: 22px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .label { color: #6B5B55; }
    .value { color: #3B2A25; font-weight: 700; font-family: Arial, Helvetica, sans-serif; }
    .note { font-size: 14px; color: #3B2A25; margin: 18px 0 0; }
    .attach { background: #F5ECE8; border: 1px dashed #9C6A5A; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #3B2A25; margin-top: 16px; }
    .btn { display: inline-block; margin-top: 18px; padding: 12px 22px; background: #9C6A5A; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; }
    .footer { text-align: center; font-size: 12px; color: #9CA3AF; padding: 18px 24px 24px; border-top: 1px solid #F1E8E4; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="bar"></div>
    <div class="body">
      <div class="header">
        <img class="logo" src="${logo}" alt="${shopName}" />
        <h1>Order Confirmed</h1>
        <p class="greeting">Hi ${option.name || "there"}, thank you for shopping with ${shopName}! Your order has been placed successfully.</p>
      </div>

      <div class="card">
        <div class="row"><span class="label">Order ID</span><span class="value">#${option.invoice}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${option.date}</span></div>
        <div class="row"><span class="label">Amount</span><span class="value">${option.currency}${option.total}</span></div>
        <div class="row"><span class="label">Payment</span><span class="value">${option.paymentStatus}</span></div>
        <div class="row"><span class="label">Status</span><span class="value">${option.status}</span></div>
      </div>

      <p class="note">We are preparing your order and will notify you when it ships. You can track progress anytime from your account.</p>

      <div class="attach">
        Your invoice <strong>#${option.invoice}</strong> is attached to this email as a PDF for your records.
      </div>

      <div style="text-align:center;">
        <a href="${option.trackingUrl}" class="btn">Track Your Order</a>
      </div>

      <p class="note">Questions? Reply to this email or write to ${option.contact_email}.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} ${shopName}. All rights reserved.</div>
  </div>
</body>
</html>`;
};

module.exports = { orderConfirmationBody };
