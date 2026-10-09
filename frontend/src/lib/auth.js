import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

let cachedCookieStr = null;
let cachedUserObj = null;

const getUserSession = () => {
  const { data } = useSession();

  if (data?.user) {
    return data.user;
  }

  if (typeof window !== "undefined") {
    const cookieUserInfo = Cookies.get("userInfo");
    if (cookieUserInfo) {
      if (cookieUserInfo === cachedCookieStr && cachedUserObj) {
        return cachedUserObj;
      }
      try {
        cachedUserObj = JSON.parse(cookieUserInfo);
        cachedCookieStr = cookieUserInfo;
        return cachedUserObj;
      } catch (e) {
        cachedCookieStr = null;
        cachedUserObj = null;
        return null;
      }
    } else {
      cachedCookieStr = null;
      cachedUserObj = null;
    }
  }

  return null;
};

export { getUserSession };

