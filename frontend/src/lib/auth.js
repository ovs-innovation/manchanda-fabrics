import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

const getUserSession = () => {
  const { data } = useSession();

  if (data?.user) {
    return data.user;
  }

  if (typeof window !== "undefined") {
    const cookieUserInfo = Cookies.get("userInfo");
    if (cookieUserInfo) {
      try {
        return JSON.parse(cookieUserInfo);
      } catch (e) {
        return null;
      }
    }
  }

  return null;
};

export { getUserSession };
