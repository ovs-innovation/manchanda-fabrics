import React, { useState, useEffect, useRef } from "react";
import { FiMail, FiX, FiCheckCircle, FiAlertCircle, FiLoader, FiArrowRight } from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import CustomerServices from "@services/CustomerServices";
import saveAuthSession from "@utils/saveAuthSession";
import { notifySuccess, notifyError } from "@utils/toast";

const CheckoutEmailOtpModal = ({
  isOpen,
  onClose,
  email,
  onSuccess,
  onChangeEmail,
  dispatch,
}) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer countdown for resend
  useEffect(() => {
    let timer = null;
    if (isOpen && resendCooldown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, resendCooldown]);

  // Send OTP when modal opens
  useEffect(() => {
    if (isOpen && email) {
      setOtp(["", "", "", ""]);
      setError("");
      setResendCooldown(60);
      setCanResend(false);

      const triggerSend = async () => {
        try {
          setSendingOtp(true);
          const res = await CustomerServices.sendEmailOtp({
            email: email.trim().toLowerCase(),
            intent: "checkout",
          });
          notifySuccess(res?.message || `4-digit OTP sent to ${email}`);
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 150);
        } catch (err) {
          const msg =
            err?.response?.data?.message || err?.message || "Failed to send OTP to email.";
          setError(msg);
          notifyError(msg);
        } finally {
          setSendingOtp(false);
        }
      };

      triggerSend();
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const digit = value.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    // Auto-advance
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (!pasted) return;

    const digits = pasted.split("");
    const nextOtp = ["", "", "", ""];
    digits.forEach((d, i) => {
      nextOtp[i] = d;
    });
    setOtp(nextOtp);
    const focusIdx = Math.min(digits.length, 3);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleResend = async () => {
    if (!canResend || sendingOtp) return;
    try {
      setSendingOtp(true);
      setError("");
      const res = await CustomerServices.sendEmailOtp({
        email: email.trim().toLowerCase(),
        intent: "checkout",
      });
      setResendCooldown(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      notifySuccess(res?.message || "New OTP sent to your email!");
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to resend OTP.";
      setError(msg);
      notifyError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join("").trim();
    if (code.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await CustomerServices.verifyEmailOtp({
        email: email.trim().toLowerCase(),
        otp: code,
        intent: "checkout",
      });

      if (response?.token) {
        saveAuthSession(response, dispatch);
        notifySuccess("Email verified successfully!");
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        setError(response?.message || "Verification failed. Please check your code.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Invalid or expired OTP code.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E6D1CB]/70 animate-in zoom-in-95 duration-200 text-[#3B2A25]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 text-center border-b border-[#FAF7F5] bg-gradient-to-b from-[#FAF7F5] to-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors shadow-xs"
            title="Close"
          >
            <FiX size={18} />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#9C6A5A]/10 text-[#6D3D2E] flex items-center justify-center mb-3">
            <IoShieldCheckmarkOutline size={30} />
          </div>

          <h3 className="text-xl font-serif font-bold text-[#3B2A25]">
            Verify Your Email
          </h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto leading-relaxed">
            We sent a 4-digit verification code to
          </p>
          <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-[#FAF7F5] rounded-full border border-[#E6D1CB]/60">
            <FiMail size={12} className="text-[#6D3D2E]" />
            <span className="font-semibold text-xs text-[#6D3D2E] truncate max-w-[220px]">
              {email}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-5 space-y-5">
          <div className="text-center">
            <p className="text-xs text-neutral-500 mb-4">
              Enter the 4-digit code to complete order and enable live delivery tracking updates.
            </p>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3 sm:gap-4 my-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e.target)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-2xl border-2 border-neutral-200 focus:border-[#6D3D2E] focus:ring-2 focus:ring-[#6D3D2E]/20 bg-white text-neutral-900 shadow-xs transition-all outline-none"
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium">
                <FiAlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 4}
            className={`w-full h-12 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
              loading || otp.join("").length !== 4
                ? "bg-neutral-300 cursor-not-allowed shadow-none"
                : "bg-[#6D3D2E] hover:bg-[#4A291E] active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Place Order</span>
                <FiArrowRight size={16} />
              </>
            )}
          </button>

          {/* Footer options: Resend and Change email */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || sendingOtp}
              className={`font-semibold transition-colors ${
                canResend
                  ? "text-[#6D3D2E] hover:underline cursor-pointer"
                  : "text-neutral-400 cursor-not-allowed"
              }`}
            >
              {sendingOtp
                ? "Sending..."
                : canResend
                ? "Resend Code"
                : `Resend code in ${resendCooldown}s`}
            </button>

            {onChangeEmail && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChangeEmail();
                }}
                className="text-neutral-500 hover:text-neutral-800 hover:underline"
              >
                Change Email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutEmailOtpModal;
