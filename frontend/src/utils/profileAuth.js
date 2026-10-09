const PLACEHOLDER_DOMAIN = "phone.Manchanda Fabrics.com";

export const isPlaceholderEmail = (email) =>
  !!email && String(email).toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`);

/** Real user email for UI only — never show phone-login placeholder addresses */
export const getDisplayEmail = (user) => {
  const email = user?.email;
  if (!email || isPlaceholderEmail(email)) return "";
  return String(email).trim();
};

export const isProfileComplete = (user) => {
  if (!user) return false;
  if (user.profileComplete === true) return true;
  const hasName =
    user.name &&
    user.name.trim().length > 1 &&
    !/^user\s+\d+$/i.test(user.name.trim());
  const hasPhone = user.phone && String(user.phone).replace(/\D/g, "").length >= 10;
  const hasAddress = !!(user.address && String(user.address).trim());
  return !!(hasName && hasPhone && hasAddress);
};

export const buildUserInfoFromAuth = (response) => ({
  _id: response._id,
  id: response._id,
  name: response.name,
  email: getDisplayEmail(response),
  phone: response.phone,
  address: response.address || "",
  image: response.image || "",
  token: response.token,
  role: response.role || "customer",
  phoneVerified: response.phoneVerified,
  emailVerified: response.emailVerified,
  profileComplete: response.profileComplete,
});

export const getPostAuthPath = (response, query = {}) => {
  const next = query.next || query.redirectUrl;
  const wantsCheckout = next === "checkout" || next === "/checkout";

  if (wantsCheckout) return "/checkout";
  if (next && String(next).startsWith("/")) return String(next);
  if (!isProfileComplete(response)) return "/";
  return "/";
};

export const cleanIndianMobile = (phone) => {
  if (!phone) return "";
  let digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits.slice(0, 10);
};
