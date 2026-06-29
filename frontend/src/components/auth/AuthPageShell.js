import Link from "next/link";
import Image from "next/image";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";
import { FiShield, FiTruck, FiClock, FiCheck } from "react-icons/fi";

const TRUST_ITEMS = [
  { icon: FiShield, text: "Secure OTP login" },
  { icon: FiTruck, text: "Fast delivery on every order" },
  { icon: FiClock, text: "Takes under a minute" },
];

const AuthPageShell = ({
  title,
  subtitle,
  children,
  footer,
  alternateLink,
  badge,
}) => {
  const { globalSetting } = useGetSetting();
  const shopName = globalSetting?.shop_name || "Manchanda Fabrics";

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#FAF7F5] pb-20 lg:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 lg:py-14">
        <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-[#E6D1CB]/60">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
            <div className="bg-[#FAF7F5] text-[#3B2A25] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 border-r border-[#E6D1CB]/60">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white ring-1 ring-[#E6D1CB]/60">
                  <img
                    src={pickBrandLogo(globalSetting?.logo)}
                    alt={shopName}
                    width={48}
                    height={48}
                    className="h-12 w-auto max-w-[48px] object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold uppercase tracking-widest text-[#3B2A25]">
                    {shopName}
                  </div>
                  <div className="text-xs text-[#3B2A25]/60">
                    Premium ethnic fashion & fabrics.
                  </div>
                </div>
              </div>

              {badge && (
                <div className="mt-6 inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ring-[#E6D1CB] text-[#9C6A5A]">
                  {badge}
                </div>
              )}

              <h1 className="mt-6 text-2xl sm:text-3xl font-serif font-light leading-tight tracking-tight uppercase text-[#3B2A25]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-sm leading-relaxed text-[#3B2A25]/70">
                  {subtitle}
                </p>
              )}

              <ul className="mt-7 space-y-3">
                {TRUST_ITEMS.map(({ text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-[#3B2A25]/85">
                    <FiCheck className="h-4 w-4 text-[#9C6A5A]" aria-hidden />
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-10 bg-white">
              {children}

              {(alternateLink || footer) && (
                <div className="mt-6 border-t border-[#E6D1CB]/40 pt-5">
                  {alternateLink && (
                    <p className="text-center text-sm text-[#3B2A25]/70">
                      {alternateLink.text}{" "}
                      <Link
                        href={alternateLink.href}
                        className="font-bold text-[#9C6A5A] hover:underline"
                      >
                        {alternateLink.label}
                      </Link>
                    </p>
                  )}
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageShell;
