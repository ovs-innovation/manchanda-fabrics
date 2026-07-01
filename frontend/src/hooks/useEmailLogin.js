import { useState, useCallback } from "react";
import CustomerServices from "@services/CustomerServices";

const normalizeEmail = (email) => String(email || "").toLowerCase().trim();

const parseAuthError = (err, fallback) => {
  const data = err?.response?.data;
  const message = data?.message || err?.message || fallback;
  const code = data?.code || err?.code || null;
  const error = new Error(message);
  error.code = code;
  return error;
};

export default function useEmailLogin(authIntent = "login", options = {}) {
  const { allowCheckoutSignup = false } = options;
  const intent = authIntent === "signup" ? "signup" : "login";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);
  const [activeIntent, setActiveIntent] = useState(intent);

  const resolveSendIntent = useCallback(
    async (email) => {
      const normalized = normalizeEmail(email);
      const check = await CustomerServices.checkEmailRegistered(normalized);

      if (intent === "signup" && check?.exists) {
        const err = new Error(
          "This email is already registered. Please login instead."
        );
        err.code = "EMAIL_ALREADY_REGISTERED";
        throw err;
      }

      if (intent === "login" && !check?.exists) {
        if (allowCheckoutSignup) {
          return "signup";
        }
        const err = new Error(
          "No account found with this email. Please sign up first."
        );
        err.code = "EMAIL_NOT_REGISTERED";
        throw err;
      }

      return intent;
    },
    [intent, allowCheckoutSignup]
  );

  const sendOtp = useCallback(
    async (email, avatar = "") => {
      setLoading(true);
      setError("");
      setErrorCode(null);
      try {
        const normalized = normalizeEmail(email);
        const effectiveIntent = await resolveSendIntent(normalized);
        setActiveIntent(effectiveIntent);

        const response = await CustomerServices.sendEmailOtp({
          email: normalized,
          intent: effectiveIntent,
          avatar,
        });
        return {
          ...response,
          otpLength: 4,
          intent: response?.intent || effectiveIntent,
        };
      } catch (err) {
        const parsed =
          err?.code && err?.message
            ? err
            : parseAuthError(err, "Failed to send OTP");
        setError(parsed.message);
        setErrorCode(parsed.code);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [resolveSendIntent]
  );

  const verifyOtp = useCallback(
    async (email, otpCode, avatar = "", intentOverride = null) => {
      setLoading(true);
      setError("");
      setErrorCode(null);
      try {
        const verifyIntent = intentOverride || activeIntent || intent;
        return await CustomerServices.verifyEmailOtp({
          email: normalizeEmail(email),
          otp: String(otpCode || "").trim(),
          intent: verifyIntent,
          avatar,
        });
      } catch (err) {
        const parsed = parseAuthError(err, "OTP verification failed");
        setError(parsed.message);
        setErrorCode(parsed.code);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [intent, activeIntent]
  );

  const resetSession = useCallback(() => {
    setError("");
    setErrorCode(null);
    setActiveIntent(intent);
  }, [intent]);

  return {
    sendOtp,
    verifyOtp,
    loading,
    error,
    errorCode,
    setError,
    resetOtpSession: resetSession,
    otpLength: 4,
    intent,
    activeIntent,
  };
}
