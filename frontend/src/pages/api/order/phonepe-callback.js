export default async function handler(req, res) {
  try {
    const queryParams = new URLSearchParams(req.query).toString();
    const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.manchandafabric.in/api";
    const backendHost = rawApiBase.replace(/\/api\/?$/, "").replace("https://manchandafabric.in", "https://api.manchandafabric.in");

    const targetUrl = queryParams
      ? `${backendHost}/api/order/phonepe-callback?${queryParams}`
      : `${backendHost}/api/order/phonepe-callback`;

    return res.redirect(302, targetUrl);
  } catch (error) {
    console.error("Error in frontend phonepe-callback proxy:", error);
    const frontendDomain = (process.env.NEXT_PUBLIC_STORE_DOMAIN || "https://manchandafabric.in")
      .split(",")[0]
      .trim()
      .replace(/\/+$/, "");
    return res.redirect(302, `${frontendDomain}/checkout`);
  }
}
