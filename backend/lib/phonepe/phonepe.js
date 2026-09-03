const axios = require("axios");

// PhonePe OAuth Token Memory Cache
let cachedToken = null;
let tokenExpiresAt = 0;

// Read PhonePe credentials from environment variables
const getPhonePeConfig = () => {
  const clientId = (process.env.PHONEPE_CLIENT_ID || "SU2609021225328435571255").trim();
  const clientSecret = (process.env.PHONEPE_CLIENT_SECRET || "a7a57e67-1a9e-4605-8cd9-94b3f1503c37").trim();
  const clientVersion = (process.env.PHONEPE_CLIENT_VERSION || "1").trim();
  const merchantId = (process.env.PHONEPE_MERCHANT_ID || "M225LN87X8FIJ").trim();
  const env = (process.env.PHONEPE_ENV || "PRODUCTION").trim().toUpperCase();

  const isSandbox = env === "SANDBOX";

  const authHost = isSandbox
    ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
    : "https://api.phonepe.com/apis/identity-manager";

  const apiHost = isSandbox
    ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
    : "https://api.phonepe.com/apis/pg";

  return {
    clientId,
    clientSecret,
    clientVersion,
    merchantId,
    env,
    isSandbox,
    tokenUrl: `${authHost}/v1/oauth/token`,
    payUrl: `${apiHost}/checkout/v2/pay`,
    statusUrl: (merchantOrderId) => `${apiHost}/checkout/v2/order/${merchantOrderId}/status`,
  };
};

/**
 * Obtain PhonePe OAuth Access Token (Cached in Memory)
 */
const getAccessToken = async () => {
  const config = getPhonePeConfig();

  // Return cached token if valid (5 minute buffer before expiry)
  if (cachedToken && Date.now() < tokenExpiresAt - 300000) {
    return cachedToken;
  }

  const tokenUrls = [
    config.tokenUrl,
    "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
  ];

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    client_version: config.clientVersion,
    grant_type: "client_credentials",
  });

  for (const url of tokenUrls) {
    console.log(`[PhonePe OAuth] Fetching token from: ${url}`);
    try {
      const response = await axios.post(url, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 15000,
      });

      const data = response.data;
      if (response.status === 200 && data.access_token) {
        cachedToken = data.access_token;
        const expiresInMs = (data.expires_in || 3600) * 1000;
        tokenExpiresAt = Date.now() + expiresInMs;
        console.log(`[PhonePe OAuth] Access token obtained successfully. Valid for ${data.expires_in || 3600}s`);
        return cachedToken;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[PhonePe OAuth Warning] URL ${url} returned ${err.response?.status || err.message}`);
    }
  }

  const errorData = lastError?.response?.data;
  console.error(`[PhonePe OAuth Error] Status: ${lastError?.response?.status || "N/A"}`);
  console.error("Response Body:", JSON.stringify(errorData || lastError?.message, null, 2));
  throw new Error(errorData?.message || lastError?.message || "Failed to authenticate with PhonePe OAuth.");
};

/**
 * Initiate PhonePe Standard Checkout v2 Payment
 */
const initiatePhonePePayment = async (paymentData) => {
  const config = getPhonePeConfig();
  const token = await getAccessToken();

  const {
    merchantTransactionId,
    amount,
    redirectUrl,
    callbackUrl,
  } = paymentData;

  const merchantHostUrl = (process.env.PHONEPE_MERCHANT_HOST_URL || process.env.NEXT_PUBLIC_STORE_DOMAIN || process.env.STORE_URL || process.env.FRONTEND_URL || "https://manchandafabric.in")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

  const cleanMobile = paymentData.mobileNumber
    ? String(paymentData.mobileNumber).replace(/\D/g, "").slice(-10)
    : undefined;

  const payload = {
    merchantId: config.merchantId,
    merchantOrderId: merchantTransactionId,
    amount: Math.round(amount * 100), // Convert INR to paise
    expireAfter: 1200,
    redirectUrl,
    callbackUrl,
    mobileNumber: cleanMobile || undefined,
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Payment for Manchanda Fabrics",
      merchantHostUrl,
      merchantUrls: {
        redirectUrl,
      },
    },
  };

  console.log(`[PhonePe v2 Pay] Requesting payment URL from: ${config.payUrl}`);

  try {
    const response = await axios.post(config.payUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const data = response.data;
    console.log(`[PhonePe v2 Pay Response] Status: ${response.status} | OrderId: ${data.orderId || "N/A"}`);

    if (data.redirectUrl || data.data?.redirectUrl) {
      return {
        success: true,
        code: "PAYMENT_INITIATED",
        redirectUrl: data.redirectUrl || data.data?.redirectUrl,
        orderId: data.orderId || data.data?.orderId,
        raw: data,
      };
    }

    return {
      success: true,
      code: "PAYMENT_INITIATED",
      redirectUrl: data.redirectUrl || "",
      orderId: data.orderId || "",
      raw: data,
    };
  } catch (err) {
    const errorData = err.response?.data;
    console.error(`[PhonePe v2 Pay Error] Request URL: ${config.payUrl} | Status: ${err.response?.status || "N/A"}`);
    console.error("Request Payload:", JSON.stringify(payload, null, 2));
    console.error("Response Body:", JSON.stringify(errorData || err.message, null, 2));

    const detailedMessage =
      errorData?.message || errorData?.code || err?.message || "PhonePe payment creation failed.";
    throw new Error(detailedMessage);
  }
};

/**
 * Check PhonePe Payment Status (v2 Checkout)
 */
const checkPhonePeStatus = async (merchantOrderId) => {
  const config = getPhonePeConfig();
  const token = await getAccessToken();

  const targetUrl = config.statusUrl(merchantOrderId);
  console.log(`[PhonePe v2 Status] Checking status from: ${targetUrl}`);

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const data = response.data;
    console.log(`[PhonePe v2 Status Response] Status: ${response.status} | State: ${data.state || data.data?.state || "N/A"}`);
    return data;
  } catch (err) {
    const errorData = err.response?.data;
    console.error(`[PhonePe v2 Status Error] Request URL: ${targetUrl} | Status: ${err.response?.status || "N/A"}`);
    console.error("Response Body:", JSON.stringify(errorData || err.message, null, 2));

    const detailedMessage =
      errorData?.message || errorData?.code || err?.message || "PhonePe status check failed.";
    throw new Error(detailedMessage);
  }
};

module.exports = {
  getPhonePeConfig,
  getAccessToken,
  initiatePhonePePayment,
  checkPhonePeStatus,
};
