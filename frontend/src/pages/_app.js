import "@styles/custom.css";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "react-use-cart";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

// Internal imports
import store from "@redux/store";
import { handlePageView } from "@lib/analytics";
import { UserProvider } from "@context/UserContext";
import DefaultSeo from "@components/common/DefaultSeo";
import { SidebarProvider } from "@context/SidebarContext";
import SettingServices from "@services/SettingServices";
import { AnnouncementsProvider } from "@context/AnnouncementsContext";
import Loading from "@components/preloader/Loading";
import dynamic from "next/dynamic";

const LanguagePopup = dynamic(() => import("@components/common/LanguagePopup"), {
  ssr: false,
});

persistStore(store);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [storeSetting, setStoreSetting] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Show branded loading screen when page is opening late / loading slowly (>250ms)
  useEffect(() => {
    let timer = null;
    let safetyTimer = null;

    const handleStart = () => {
      if (timer) clearTimeout(timer);
      if (safetyTimer) clearTimeout(safetyTimer);
      timer = setTimeout(() => {
        setRouteLoading(true);
        // Safety watchdog: never keep loading screen stuck for more than 3s
        safetyTimer = setTimeout(() => {
          setRouteLoading(false);
        }, 3000);
      }, 250);
    };

    const handleEnd = () => {
      if (timer) clearTimeout(timer);
      if (safetyTimer) clearTimeout(safetyTimer);
      setRouteLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleEnd);
    router.events.on("routeChangeError", handleEnd);
    router.events.on("beforeHistoryChange", handleEnd);

    return () => {
      if (timer) clearTimeout(timer);
      if (safetyTimer) clearTimeout(safetyTimer);
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleEnd);
      router.events.off("routeChangeError", handleEnd);
      router.events.off("beforeHistoryChange", handleEnd);
    };
  }, [router]);

  // Always dismiss routeLoading once the route asPath updates
  useEffect(() => {
    setRouteLoading(false);
  }, [router.asPath]);

  // Restore saved language preference (default en)
  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady) return;
    const saved = localStorage.getItem("locale");
    if (saved && router.locales?.includes(saved) && router.locale !== saved) {
      router.replace(router.asPath, router.asPath, { locale: saved, scroll: false });
    }
  }, [router.isReady, router.locale, router.asPath, router.locales]);

  // Dev safety: unregister any previously installed PWA service workers.
  // Old SWs can cache API/HTML and cause "backend content" to appear after refresh.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      } catch (e) { console.warn(e); }

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch (e) { console.warn(e); }
    })();
  }, []);

  useEffect(() => {
    let unlisten = null;
    const fetchStoreSettings = async () => {
      try {
        const settings = await queryClient.fetchQuery({
          queryKey: ["storeSetting"],
          queryFn: async () => await SettingServices.getStoreSetting(),
          staleTime: 15 * 60 * 1000, // Cache data for 15 minutes
        });

        setStoreSetting(settings);

        // Initialize Google Analytics
        if (settings?.google_analytic_status) {
          ReactGA.initialize(settings?.google_analytic_key || "");
          handlePageView();

          const handleRouteChange = (url) => {
            handlePageView(url || `/${router.pathname}`, "Manchanda Fabrics");
          };

          router.events.on("routeChangeComplete", handleRouteChange);
          unlisten = () => {
            router.events.off("routeChangeComplete", handleRouteChange);
          };
        }
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };

    fetchStoreSettings();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <UserProvider>
            <Provider store={store}>
              <SidebarProvider>
                <AnnouncementsProvider announcements={[]}>
                  <CartProvider>
                    <DefaultSeo />
                    <Component {...pageProps} />
                    <LanguagePopup />
                  </CartProvider>
                </AnnouncementsProvider>
              </SidebarProvider>
            </Provider>
          </UserProvider>
        </SessionProvider>
      </QueryClientProvider>
      {/* Global slow/late route transition loading screen */}
      <Loading loading={routeLoading} fullScreen={true} />
      {/* Render TawkMessengerReact only if tawk_chat_status is enabled */}
      {storeSetting?.tawk_chat_status && (
        <TawkMessengerReact
          propertyId={storeSetting?.tawk_chat_property_id || ""}
          widgetId={storeSetting?.tawk_chat_widget_id || ""}
        />
      )}
    </>
  );
}

import appWithI18n from "next-translate/appWithI18n";

export default appWithI18n(MyApp);
