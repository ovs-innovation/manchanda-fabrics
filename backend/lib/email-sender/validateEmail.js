const MailChecker = require("mailchecker");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const validateEmail = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return { ok: false, message: "Valid email address is required." };
  }

  const [local, domain] = normalized.split("@");
  if (!local || !domain || !domain.includes(".")) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (!MailChecker.isValid(normalized)) {
    return {
      ok: false,
      message:
        "This email address looks invalid or disposable. Please double-check spelling (e.g. gmail.com) and try again.",
    };
  }

  return { ok: true, email: normalized };
};

module.exports = { normalizeEmail, validateEmail };
