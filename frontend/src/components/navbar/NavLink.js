import Link from "next/link";
import { useRouter } from "next/router";

const NavLink = ({ href, children, className = "" }) => {
  const router = useRouter();
  const isActive = router.pathname === href || router.asPath === href;

  return (
    <Link
      href={href}
      className={`relative group inline-flex items-center py-2 text-[17px] md:text-[18px] font-semibold tracking-[1px] uppercase transition-colors duration-200 ${
        isActive ? "text-[#C8A45D]" : "text-[#111111] hover:text-[#C8A45D]"
      } ${className}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
      aria-current={isActive ? "page" : undefined}
    >
      {children}

      {/* Gold underline grows from center on hover */}
      <span
        className={`absolute bottom-0 left-1/2 h-[1.5px] bg-[#C8A45D] -translate-x-1/2 transition-all duration-300 ease-out ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
};

export default NavLink;
