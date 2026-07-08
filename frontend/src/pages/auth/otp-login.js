import { useEffect } from "react";
import { useRouter } from "next/router";

/** Legacy route — redirecting to login */
const OTPLoginRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const q = new URLSearchParams();
    Object.entries(router.query).forEach(([k, v]) => {
      if (k !== "slug" && v) q.set(k, String(v));
    });
    const suffix = q.toString() ? `?${q.toString()}` : "";
    router.replace(`/auth/login${suffix}`);
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center font-sans">
      <span className="text-xs tracking-widest text-[#111111] uppercase">Redirecting...</span>
    </div>
  );
};

export default OTPLoginRedirect;
