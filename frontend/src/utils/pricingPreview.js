// src/utils/pricingPreview.js

// Default preview settings (used when backend missing)
export const defaultStoreSettings = {
  taxRate: 5,                    // percent
  taxMode: "tax_exclusive",      // "tax_exclusive" | "tax_inclusive" (you use exclusive only)
  shippingFlatFee: 15,           // fallback
  freeShippingMin: 199,          // fallback
  shippingMethod: { code: "standard", label: "Standard" },
  deliveryEta: "2–4 days",
};

/**
 * Adapter: map backend /api/settings/public payload
 *   {
 *     shipping: { freeOver, methods[], defaultMethodCode },
 *     tax: { rate, displayMode },
 *     delivery?: { eta }
 *   }
 * into what computePricingPreview expects.
 *
 * If your backend stores tax.rate as decimal (0.05), change the line that computes taxRatePercent.
 */
export function adaptSettingsToPreview(publicSettings) {
  if (!publicSettings || typeof publicSettings !== "object") {
    return defaultStoreSettings;
  }
  const shipping = publicSettings.shipping || {};
  const tax      = publicSettings.tax || {};
  const delivery = publicSettings.delivery || {};

  // Pick default method by code; fallback to first active
  const methods = Array.isArray(shipping.methods) ? shipping.methods : [];
  const byCode  = methods.find(m => m?.code === shipping.defaultMethodCode && m?.active !== false);
  const firstActive = methods.find(m => m?.active !== false) || methods[0];

  // If backend uses decimal (0.05), convert to percent. If it already is 5, leave as is.
  const rawRate = Number(tax.rate || 0);
  const taxRatePercent = rawRate > 0 && rawRate <= 1 ? rawRate * 100 : rawRate;

  return {
    taxRate: taxRatePercent,
    taxMode: (tax.displayMode === "tax_inclusive") ? "tax_inclusive" : "tax_exclusive",

    freeShippingMin: Number(shipping.freeOver || 0),

    // Preview needs a flat fee; take it from chosen method amount.
    shippingFlatFee: Number((byCode || firstActive)?.amount || 0),
    shippingMethod: byCode || firstActive || { code: "standard", label: "Standard" },

    deliveryEta: delivery.eta || defaultStoreSettings.deliveryEta,
  };
}

/**
 * Core preview compute (unchanged logic)
 * items: [{ name, price, quantity }]
 * settings: { taxRate, taxMode, shippingFlatFee, freeShippingMin, shippingMethod, deliveryEta }
 */
export function computePricingPreview(items = [], settings = {}) {
  const s = { ...defaultStoreSettings, ...settings };
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  const subtotal = round2(
    (items || []).reduce((sum, it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return sum + price * qty;
    }, 0)
  );

  const shippingFee = subtotal >= Number(s.freeShippingMin || 0)
    ? 0
    : Number(s.shippingFlatFee || 0);

  const rate = Number(s.taxRate || 0) / 100;

  let taxAmount = 0;
  let grandTotal = 0;

  if (s.taxMode === "tax_inclusive") {
    const taxBase = subtotal + shippingFee; // includes tax
    taxAmount = taxBase - taxBase / (1 + rate);
    grandTotal = taxBase;
  } else {
    const taxBase = subtotal + shippingFee;
    taxAmount = taxBase * rate;
    grandTotal = taxBase + taxAmount;
  }

  return {
    subtotal: round2(subtotal),
    shippingFee: round2(shippingFee),
    shippingMethod: s.shippingMethod,
    deliveryEta: s.deliveryEta,
    taxAmount: round2(taxAmount),
    taxRate: Number(s.taxRate || 0),
    taxMode: s.taxMode === "tax_inclusive" ? "tax_inclusive" : "tax_exclusive",
    grandTotal: round2(grandTotal),
  };
}

// Currency helper you can reuse everywhere
export const formatCurrency = (value, currency = "AED", locale = "en-AE") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(value) || 0);
