import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import React, { createContext, useEffect, useReducer } from "react";

import { setToken } from "@services/httpServices";
import LoadingForSession from "@components/preloader/LoadingForSession";

export const UserContext = createContext();

const getInitialState = () => ({
  userInfo: null,
  shippingAddress: {},
  couponInfo: {},
});

function reducer(state, action) {
  switch (action.type) {
    case "USER_LOGIN":
      return { ...state, userInfo: action.payload };

    case "USER_LOGOUT":
      return {
        ...state,
        userInfo: null,
      };

    case "SAVE_SHIPPING_ADDRESS":
      return { ...state, shippingAddress: action.payload };

    case "SAVE_COUPON":
      return { ...state, couponInfo: action.payload };

    case "HYDRATE_SESSION":
      return {
        ...state,
        shippingAddress: action.payload?.shippingAddress || state.shippingAddress,
        couponInfo: action.payload?.couponInfo || state.couponInfo,
      };

    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const { data: session, status } = useSession();

  useEffect(() => {
    const cookieUserInfo = Cookies.get("userInfo");
    const shippingAddressCookie = Cookies.get("shippingAddress");
    const couponInfoCookie = Cookies.get("couponInfo");

    if (shippingAddressCookie || couponInfoCookie) {
      dispatch({
        type: "HYDRATE_SESSION",
        payload: {
          shippingAddress: shippingAddressCookie
            ? JSON.parse(shippingAddressCookie)
            : {},
          couponInfo: couponInfoCookie ? JSON.parse(couponInfoCookie) : {},
        },
      });
    }
    
    if (cookieUserInfo) {
      const parsedUser = JSON.parse(cookieUserInfo);
      if (parsedUser?.token) {
        setToken(parsedUser.token);
        dispatch({ type: "USER_LOGIN", payload: parsedUser });
        return;
      }
    }

    if (status === "authenticated" && session?.user) {
      setToken(session.user.token);
      const user = {
        ...session.user,
        _id: session.user._id || session.user.id,
      };
      Cookies.set("userInfo", JSON.stringify(user), { expires: 1 });
      dispatch({ type: "USER_LOGIN", payload: user });
    } else if (status === "unauthenticated" && !cookieUserInfo) {
      setToken(null);
      Cookies.remove("userInfo");
      dispatch({ type: "USER_LOGOUT" });
    }
  }, [session, status]);

  useEffect(() => {
    const handleStorageChange = () => {
      const cookieUserInfo = Cookies.get("userInfo");
      if (cookieUserInfo) {
        const parsedUser = JSON.parse(cookieUserInfo);
        if (parsedUser?.token) {
          setToken(parsedUser.token);
          dispatch({ type: "USER_LOGIN", payload: parsedUser });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);



  const value = { state, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
