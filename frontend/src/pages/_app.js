import "@styles/custom.css";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "react-use-cart";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import ReactGA from "react-ga4";
import { useEffect, useState, useRef } from "react";
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
  const [isNavigating, setIsNavigating] = useState(false);
  const hasRestoredLocale = useRef(false);

  // Instant top progress bar + branded full-screen preloader (debounced to 350ms so fast transitions don't flash)
  useEffect(() => {
    let watchdogTimer = null;
    let fullScreenTimer = null;

    const handleStart = (url, { shallow } = {}) => {
      // Do not trigger loading indicators for shallow query changes on the same page
      if (shallow || url === router.asPath) return;
      if (watchdogTimer) clearTimeout(watchdogTimer);
      if (fullScreenTimer) clearTimeout(fullScreenTimer);

      setIsNavigating(true);

      // Only show full-screen branded preloader if route takes longer than 2000ms (slow network)
      fullScreenTimer = setTimeout(() => {
        setRouteLoading(true);
      }, 2000);

      // Safety watchdog: ensure loading indicators clear if route fails or hangs
      watchdogTimer = setTimeout(() => {
        setIsNavigating(false);
        setRouteLoading(false);
      }, 4500);
    };

    const handleComplete = () => {
      if (fullScreenTimer) clearTimeout(fullScreenTimer);
      if (watchdogTimer) clearTimeout(watchdogTimer);
      setIsNavigating(false);
      setRouteLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      if (fullScreenTimer) clearTimeout(fullScreenTimer);
      if (watchdogTimer) clearTimeout(watchdogTimer);
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // Restore saved language preference ONCE on initial app mount only.
  // Never re-execute during in-flight page navigations to avoid route aborts or double-load flashes.
  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady || hasRestoredLocale.current) return;
    hasRestoredLocale.current = true;
    const saved = localStorage.getItem("locale");
    if (saved && router.locales?.includes(saved) && router.locale !== saved) {
      router.replace(router.asPath, router.asPath, { locale: saved, scroll: false });
    }
  }, [router.isReady]);

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
                    <div
                      className={`transition-all duration-200 ease-out ${
                        isNavigating
                          ? "opacity-60 filter blur-[0.4px] pointer-events-none"
                          : "opacity-100 filter-none"
                      }`}
                    >
                      <Component {...pageProps} />
                    </div>
                    <LanguagePopup />
                  </CartProvider>
                </AnnouncementsProvider>
              </SidebarProvider>
            </Provider>
          </UserProvider>
        </SessionProvider>
      </QueryClientProvider>
      {/* Sleek top navigation progress bar for instant feedback without layout flash */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[999999] h-[3.5px] overflow-hidden bg-transparent pointer-events-none">
          <div className="h-full bg-gradient-to-r from-[#9C6A5A] via-[#E8C582] to-[#9C6A5A] shadow-[0_0_12px_rgba(232,197,130,0.9)] animate-[topNavProgress_0.8s_ease-in-out_infinite]" />
          <style jsx>{`
            @keyframes topNavProgress {
              0% {
                transform: translateX(-100%);
                width: 40%;
              }
              50% {
                width: 80%;
              }
              100% {
                transform: translateX(250%);
                width: 40%;
              }
            }
          `}</style>
        </div>
      )}
      {/* Original branded loading screen with logo (only shown if a transition is truly slow) */}
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

export default MyApp;
