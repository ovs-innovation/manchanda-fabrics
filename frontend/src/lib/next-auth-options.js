// dynamicSettings.js
import { QueryClient } from "@tanstack/react-query";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

import SettingServices from "@services/SettingServices";
import CustomerServices from "@services/CustomerServices";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const getDynamicAuthOptions = async () => {
  // Fetch store settings from the cache or trigger a fetch if not cached
  const storeSetting = await queryClient.fetchQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => {
      try {
        return await SettingServices.getStoreSetting();
      } catch (error) {
        console.error("Error fetching store settings:", error);
        return {}; // Return an empty object as a fallback
      }
    },
    staleTime: 4 * 60 * 1000, // Api request after 4 minutes
  });

  // console.log("storeSetting", storeSetting);

  const providers = [];

  const googleClientId =
    process.env.GOOGLE_CLIENT_ID || storeSetting?.google_id;
  const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET || storeSetting?.google_secret;

  if (googleClientId && googleClientSecret) {
    console.log(
      `[NextAuth] Initializing Google provider (Client ID: ...${String(googleClientId).slice(-15)}, Secret ending in: ...${String(googleClientSecret).slice(-6)})`
    );
    providers.push(
      Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      })
    );
  }

  if (storeSetting?.github_id && storeSetting?.github_secret) {
    providers.push(
      GitHub({
        clientId: storeSetting.github_id,
        clientSecret: storeSetting.github_secret,
      })
    );
  }

  if (storeSetting?.facebook_id && storeSetting?.facebook_secret) {
    providers.push(
      Facebook({
        clientId: storeSetting.facebook_id,
        clientSecret: storeSetting.facebook_secret,
      })
    );
  }

  providers.push(
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const userInfo = await CustomerServices.loginCustomer(credentials);
          return userInfo;
        } catch (error) {
          // Handle custom error from backend
          const message =
            error.response?.data?.message || "Login failed! Please try again.";
          throw new Error(message); // Propagate error to client
        }
      },
    })
  );

  const authOptions = {
    providers,
    callbacks: {
      async signIn({ user, account, profile }) {
        console.log("[NextAuth] signIn callback triggered. Provider:", account?.provider, "User:", user?.email);
        if (account?.provider !== "credentials") {
          try {
            const googleAvatar = user?.image || profile?.picture || "";
            const oauthPayload = {
              ...user,
              image: googleAvatar,
            };
            console.log("[NextAuth] Calling CustomerServices.signUpWithOauthProvider with avatar:", googleAvatar);
            const res = await CustomerServices.signUpWithOauthProvider(oauthPayload);
            console.log("[NextAuth] signUpWithOauthProvider response:", res ? "Received" : "None", res?.token ? "Token present" : "No token");

            if (res?.token) {
              user.token = res.token;
              user._id = res._id;
              user.address = res.address;
              user.phone = res.phone;
              // If backend returned a broken/old Cloudinary URL or empty image, use the Google avatar:
              const isBrokenCloudinary =
                typeof res.image === "string" &&
                ["tu23xpla", "detqbiabu", "dhqcwkpzp", "ahossain", "dse9adftu"].some((c) =>
                  res.image.toLowerCase().includes(c)
                );
              user.image = (isBrokenCloudinary || !res.image) ? (googleAvatar || res.image || "") : res.image;
            } else {
              console.error("[NextAuth] OAuth sign-in: No token received", res);
              return false;
            }
          } catch (error) {
            console.error(
              "[NextAuth] OAuth sign-in exception:",
              error?.response?.data || error?.message || error
            );
            return false;
          }
        }
        return true;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user._id;
          token.name = user.name;
          token.email = user.email;
          token.address = user.address;
          token.phone = user.phone;
          token.image = user.image;
          token.token = user.token;
        }

        if (trigger === "update" && session) {
          return {
            ...token,
            ...session.user,
          };
        }

        return token;
      },
      async session({ session, token }) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.token = token.token;

        return session;
      },
      async redirect({ url, baseUrl }) {
        // console.log("url", url, "baseUrl", baseUrl);
        return url.startsWith(baseUrl) ? url : `${baseUrl}/user/dashboard`;
      },
    },
    secret: process.env.NEXTAUTH_SECRET || "manchanda-fabrics-secret-prod-token",
    debug: process.env.NODE_ENV === "development",
  };

  return authOptions;
};
