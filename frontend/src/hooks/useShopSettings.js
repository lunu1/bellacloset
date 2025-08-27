// src/hooks/useShopSettings.js
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

export default function useShopSettings() {
  const { backendUrl } = useContext(AppContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/settings/public`);
        if (mounted) setSettings(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [backendUrl]);

  return { settings, loading };
}
