import { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiMail, FiArrowLeft, FiAlertCircle, FiLock } from "react-icons/fi";
import useEmailLogin from "@hooks/useEmailLogin";
import useResendTimer from "@hooks/useResendTimer";
import { UserContext } from "@context/UserContext";
import { notifySuccess } from "@utils/toast";
import saveAuthSession from "@utils/saveAuthSession";
import { getPostAuthPath } from "@utils/profileAuth";

const STREETWEAR_AVATARS = {
  boys: [
    { name: "Felix", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" },
    { name: "Jack", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack" },
    { name: "Oliver", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver" },
    { name: "Leo", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo" },
    { name: "Charlie", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie" },
    { name: "Max", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Max" }
  ],
  girls: [
    { name: "Lily", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lily" },
    { name: "Ruby", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ruby" },
    { name: "Chloe", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe" },
    { name: "Sophie", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie" },
    { name: "Mia", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia" },
    { name: "Zoe", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe" }
  ]
};

const Spinner = () => (
  <svg
    className="h-5 w-5 animate-spin text-black"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const AuthAlert = ({ children, action }) => (
  <div
    className="flex gap-3 rounded-xl border border-red-950/40 bg-red-950/20 px-4 py-3 text-sm text-red-400"
    role="alert"
  >
    <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
    <div className="min-w-0 flex-1 space-y-2">
      <p className="leading-relaxed">{children}</p>
      {action}
    </div>
  </div>
);

const StepIndicator = ({ step }) => (
  <div className="mb-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-[#E6D1CB]/60">
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
          step === "email" ? "bg-[#9C6A5A] text-white" : "bg-[#FAF7F5] text-[#3B2A25]/60 ring-1 ring-[#E6D1CB]/60"
        }`}
      >
        1
      </span>
      <span className={`text-xs uppercase tracking-wider font-bold ${step === "email" ? "text-[#3B2A25]" : "text-[#3B2A25]/60"}`}>
        Email
      </span>
    </div>
    <div className="h-px flex-1 mx-4 bg-[#E6D1CB]/60" />
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
          step === "otp" ? "bg-[#9C6A5A] text-white" : "bg-[#FAF7F5] text-[#3B2A25]/60 ring-1 ring-[#E6D1CB]/60"
        }`}
      >
        2
      </span>
      <span className={`text-xs uppercase tracking-wider font-bold ${step === "otp" ? "text-[#3B2A25]" : "text-[#3B2A25]/60"}`}>
        OTP
      </span>
    </div>
  </div>
);

const EmailLoginForm = ({ variant = "login", allowCheckoutSignup = false }) => {
  const isSignup = variant === "signup";
  const router = useRouter();
  const { dispatch } = useContext(UserContext);
  const emailLogin = useEmailLogin(isSignup ? "signup" : "login", {
    allowCheckoutSignup,
  });
  const { startTimer, resetTimer, canResend, formatted } = useResendTimer(60);

  const [step, setStep] = useState("email");
  const [activeIntent, setActiveIntent] = useState(
    isSignup ? "signup" : "login"
  );
  const [otpLength, setOtpLength] = useState(emailLogin.otpLength);
  const [otp, setOtp] = useState(Array(emailLogin.otpLength).fill(""));
  const otpInputRefs = useRef([]);
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(isSignup ? STREETWEAR_AVATARS.boys[0].url : "");

  const resetOtpInputs = (len) => {
    setOtpLength(len);
    setOtp(Array(len).fill(""));
  };

  const sendOtpRequest = async () => {
    const trimmed = emailAddress.trim();
    if (!trimmed || !trimmed.includes("@")) {
      emailLogin.setError("Enter a valid email address");
      throw new Error("Enter a valid email address");
    }
    emailLogin.setError("");
    const response = await emailLogin.sendOtp(trimmed, selectedAvatar);
    const len = response?.otpLength || emailLogin.otpLength;
    const nextIntent = response?.intent || emailLogin.intent;
    setActiveIntent(nextIntent);
    resetOtpInputs(len);
    setStep("otp");
    startTimer();
    notifySuccess(response?.message || "OTP sent to your email");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await sendOtpRequest();
    } catch {
      /* inline */
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || emailLogin.loading) return;
    try {
      await sendOtpRequest();
    } catch {
      /* inline */
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== otpLength) {
      emailLogin.setError(`Enter the ${otpLength}-digit OTP`);
      return;
    }
    emailLogin.setError("");
    try {
      const response = await emailLogin.verifyOtp(
        emailAddress.trim(),
        otpCode,
        selectedAvatar,
        activeIntent
      );
      if (response?.token) {
        saveAuthSession(response, dispatch);
        notifySuccess(
          response.isNewUser || isSignup
            ? "Welcome! Your account is ready."
            : "Welcome back!"
        );
        router.push(getPostAuthPath(response, router.query));
      }
    } catch {
      /* inline */
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const digit = value.slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < otpLength - 1) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, otpLength);
    if (!pasted) return;
    const digits = pasted.split("");
    setOtp((prev) => {
      const next = [...prev];
      digits.forEach((d, i) => {
        next[i] = d;
      });
      return next;
    });
    const focusIdx = Math.min(digits.length, otpLength - 1);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const goBackToEmail = () => {
    setStep("email");
    resetOtpInputs(emailLogin.otpLength);
    setActiveIntent(isSignup ? "signup" : "login");
    emailLogin.setError("");
    resetTimer();
  };

  const otpError = emailLogin.error;
  const showLoginLink =
    isSignup && emailLogin.errorCode === "EMAIL_ALREADY_REGISTERED";
  const showSignupLink =
    !isSignup && emailLogin.errorCode === "EMAIL_NOT_REGISTERED";

  const loginHref = { pathname: "/auth/login", query: { ...router.query } };
  const signupHref = { pathname: "/auth/signup", query: { ...router.query } };

  const errorAction =
    showLoginLink ? (
      <Link
        href={loginHref}
        className="inline-flex font-bold text-[#9C6A5A] hover:underline"
      >
        Go to Login →
      </Link>
    ) : showSignupLink ? (
      <Link
        href={signupHref}
        className="inline-flex font-bold text-[#9C6A5A] hover:underline"
      >
        Create an account →
      </Link>
    ) : null;

  const primaryBtnClass =
    "flex w-full items-center justify-center gap-2 rounded-xl bg-[#9C6A5A] py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_8px_30px_rgba(212,175,55,0.2)] transition hover:bg-[#c29e2e] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-55 duration-200";

  return (
    <div className="w-full">
      <StepIndicator step={step} />

      {step === "email" ? (
        <form onSubmit={handleSendOTP} className="space-y-5">
          {/* Avatar Selector Grid for Signups */}
          {isSignup && (
            <div className="space-y-4 rounded-xl border border-[#E6D1CB]/60 bg-[#FAF7F5] p-4 shadow-sm">
              <label className="block text-xs font-black uppercase tracking-widest text-[#3B2A25]/70">
                Choose Your Emoticon Profile
              </label>
              
              {/* Boys group */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#9C6A5A]/80">Boys</div>
                <div className="grid grid-cols-6 gap-2">
                  {STREETWEAR_AVATARS.boys.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.name}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.url)}
                        className={`relative aspect-square rounded-full overflow-hidden bg-white border transition-all p-1 hover:scale-105 active:scale-95 ${
                          isSelected ? "border-[#9C6A5A] ring-2 ring-[#9C6A5A]/25" : "border-[#E6D1CB]/50"
                        }`}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#9C6A5A]/10 flex items-center justify-center" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Girls group */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#9C6A5A]/80">Girls</div>
                <div className="grid grid-cols-6 gap-2">
                  {STREETWEAR_AVATARS.girls.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.name}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.url)}
                        className={`relative aspect-square rounded-full overflow-hidden bg-white border transition-all p-1 hover:scale-105 active:scale-95 ${
                          isSelected ? "border-[#9C6A5A] ring-2 ring-[#9C6A5A]/25" : "border-[#E6D1CB]/50"
                        }`}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#9C6A5A]/10 flex items-center justify-center" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3B2A25]/70"
            >
              Email Address
            </label>
            <div className="flex overflow-hidden rounded-xl border border-[#E6D1CB]/60 bg-[#FAF7F5] shadow-md transition focus-within:border-[#9C6A5A] focus-within:ring-2 focus-within:ring-[#9C6A5A]/20">
              <span className="flex items-center gap-1.5 bg-white/60 px-4 border-r border-[#E6D1CB]/60 text-[#3B2A25]/70">
                <FiMail className="h-4 w-4" />
              </span>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="min-w-0 flex-1 px-4 py-3.5 text-sm font-semibold text-[#3B2A25] outline-none placeholder:text-[#3B2A25]/50 bg-transparent"
                placeholder="name@example.com"
                required
              />
            </div>
            <p className="mt-2 text-[10px] text-[#3B2A25]/60 font-medium">
              We’ll send a verification code to your email.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-[#FAF7F5] px-4 py-3 ring-1 ring-[#E6D1CB]/60">
            <FiLock className="mt-0.5 h-4 w-4 text-[#9C6A5A] shrink-0" />
            <p className="text-[11px] leading-relaxed text-[#3B2A25]/70">
              By continuing, you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>

          {otpError && <AuthAlert action={errorAction}>{otpError}</AuthAlert>}

          <button
            disabled={emailLogin.loading || !emailAddress.trim().includes("@")}
            type="submit"
            className={primaryBtnClass}
          >
            {emailLogin.loading ? (
              <>
                <Spinner />
                Sending OTP…
              </>
            ) : isSignup ? (
              "Continue"
            ) : (
              "Get OTP"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <button
            type="button"
            onClick={goBackToEmail}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3B2A25]/70 transition hover:text-[#3B2A25]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Change email
          </button>

          <div className="rounded-xl bg-[#FAF7F5] px-4 py-4 text-center border border-[#E6D1CB]/60 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3B2A25]/60">
              OTP sent to
            </p>
            <p className="mt-1 text-sm font-extrabold tracking-wide text-[#9C6A5A] break-all">
              {emailAddress}
            </p>
          </div>

          <div
            className="flex justify-center gap-2 sm:gap-2.5"
            onPaste={handleOtpPaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpInputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="h-12 w-10 rounded-lg border border-[#E6D1CB]/60 bg-white text-center text-xl font-extrabold text-[#3B2A25] shadow-sm outline-none transition focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/20 sm:h-14 sm:w-12"
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {otpError && (
            <AuthAlert action={errorAction}>{otpError}</AuthAlert>
          )}

          <button
            disabled={emailLogin.loading}
            type="submit"
            className={primaryBtnClass}
          >
            {emailLogin.loading ? (
              <>
                <Spinner />
                Verifying…
              </>
            ) : isSignup ? (
              "Verify & create account"
            ) : (
              "Verify & login"
            )}
          </button>

          <div className="text-center text-xs">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={emailLogin.loading}
                className="font-bold text-[#9C6A5A] hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-[#3B2A25]/60">
                Resend in{" "}
                <span className="font-bold tabular-nums text-[#9C6A5A]">
                  {formatted}
                </span>
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailLoginForm;
