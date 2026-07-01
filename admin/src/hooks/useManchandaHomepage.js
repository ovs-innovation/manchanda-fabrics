import { useCallback, useEffect, useState } from "react";
import SettingServices from "@/services/SettingServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  DEFAULT_MANCHANDA_HOMEPAGE,
  resolveHomepageFromSetting,
  withManchandaHomepage,
} from "@/lib/homepage-settings";

const useManchandaHomepage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homepage, setHomepage] = useState(DEFAULT_MANCHANDA_HOMEPAGE);
  const [rawSetting, setRawSetting] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const setting = (await SettingServices.getStoreCustomizationSetting()) || {};
      setRawSetting(setting);
      setHomepage(resolveHomepageFromSetting(setting));
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to load homepage settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const currentSetting =
        (await SettingServices.getStoreCustomizationSetting()) || rawSetting || {};
      await SettingServices.updateStoreCustomizationSetting({
        setting: withManchandaHomepage(currentSetting, homepage),
      });
      notifySuccess("Homepage settings saved");
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    homepage,
    setHomepage,
    save,
    reload: load,
  };
};

export default useManchandaHomepage;
