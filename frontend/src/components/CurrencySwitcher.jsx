import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

const CURRENCIES = [
  {
    code: "AED",
    label: "UAE Dirham",
    flag: "https://flagcdn.com/w40/ae.png",
    flagAlt: "UAE flag",
  },
  {
    code: "USD",
    label: "US Dollar",
    flag: "https://flagcdn.com/w40/us.png",
    flagAlt: "USA flag",
  },
  {
    code: "GBP",
    label: "British Pound",
    flag: "https://flagcdn.com/w40/gb.png",
    flagAlt: "UK flag",
  },
  {
    code: "EUR",
    label: "Euro",
    flag: "https://flagcdn.com/w40/eu.png",
    flagAlt: "EU flag",
  },
  {
    code: "RUB",
    label: "Russiab Ruble",
    flag: "https://flagcdn.com/w40/ru.png",
    flagAlt: "Russia flag",
  },
];

export default function CurrencySwitcher({ className = "" }) {
  const { currency, setCurrency } = useCurrency(); // ✅ from context
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm hover:shadow transition"
      >
        <img
          src={current.flag}
          alt={current.flagAlt}
          className="w-5 h-4 rounded-sm object-cover"
        />
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl z-50">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCurrency(c.code); // ✅ updates whole app
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition ${
                c.code === currency ? "bg-black/5" : ""
              }`}
            >
              <img
                src={c.flag}
                alt={c.flagAlt}
                className="w-6 h-4 rounded-sm object-cover"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">{c.code}</span>
                <span className="text-xs text-black/60">{c.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
