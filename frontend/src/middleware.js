import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const nextAuthToken = await getToken({ req: request });
  
  const userInfoCookie = request.cookies.get("userInfo");
  let cookieUserInfo = null;
  
  if (userInfoCookie?.value) {
    try {
      cookieUserInfo = JSON.parse(decodeURIComponent(userInfoCookie.value));
    } catch (e) {
      cookieUserInfo = null;
    }
  }

  const isAuthenticated = !!nextAuthToken || !!cookieUserInfo?.token;

  if (!isAuthenticated) {
    const loginUrl = new URL(`/auth/login`, request.url);
    if (request.nextUrl?.pathname) {
      loginUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/user/:path*",
  ],
};
