import { useEffect } from "react";
import { useRouter } from "next/router";

const TrackOrderRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/my-orders");
  }, [router]);

  return null;
};

export default TrackOrderRedirect;
