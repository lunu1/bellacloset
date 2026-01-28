import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const CurrencyContext = createContext(null);

const DEFAULT = "AED";
const SUPPORTED = ["AED", "USD", "GBP", "EUR", "RUB"];

export function CurrencyProvider({ children }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem("currency");
    return saved && SUPPORTED.includes(saved) ? saved : DEFAULT;
  });

  const [rates, setRates] = useState(() => {
    try {
      const cached = localStorage.getItem("rates_cache");
      const parsed = cached ? JSON.parse(cached) : null;
      return parsed && typeof parsed === "object" ? parsed : { AED: 1 };
    } catch {
      return { AED: 1 };
    }
  });

  const [ratesMeta, setRatesMeta] = useState(() => {
    try {
      const cached = localStorage.getItem("rates_meta");
      const parsed = cached ? JSON.parse(cached) : null;
      return parsed && typeof parsed === "object"
        ? parsed
        : { date: null, base: "AED" };
    } catch {
      return { date: null, base: "AED" };
    }
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const fetchRates = useCallback(async () => {
    if (!backendUrl) {
      console.warn("VITE_BACKEND_URL is missing");
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/rates/latest`);

      if (data?.success && data?.rates && typeof data.rates === "object") {
        const nextRates = { AED: 1, ...data.rates };

        setRates(nextRates);
        setRatesMeta({ date: data.date ?? null, base: data.base ?? "AED" });

        localStorage.setItem("rates_cache", JSON.stringify(nextRates));
        localStorage.setItem(
          "rates_meta",
          JSON.stringify({ date: data.date ?? null, base: data.base ?? "AED" })
        );
      } else {
        console.warn("Rates API returned invalid data:", data);
      }
    } catch (e) {
      console.log("Rates fetch failed:", e?.response?.data || e?.message);
      // keep cached
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchRates();
    const id = setInterval(fetchRates, 6 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchRates]);

  // Convert AED → selected currency
  const convert = useCallback(
    (amountAED) => {
      const n = Number(amountAED || 0);
      const rate = Number(rates?.[currency] ?? 1);
      return n * rate;
    },
    [currency, rates]
  );

  const format = useCallback(
    (amountAED) => {
      const value = convert(amountAED);
      const locale =
  currency === "AED" ? "en-AE" :
  currency === "RUB" ? "ru-RU" :
  "en-US";


      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "AED" ? 0 : 2,
      }).format(value);
    },
    [convert, currency]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      ratesMeta,
      refreshRates: fetchRates,
      convert,
      format,
      supported: SUPPORTED,
    }),
    [currency, rates, ratesMeta, fetchRates, convert, format]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
