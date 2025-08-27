// src/utils/pricing.util.js

/**
 * Expected settings shape (examples):
 * {
 *   currency: "AED",
 *   taxMode: "tax_exclusive" | "tax_inclusive",
 *   taxRate: 5,                       // percent
 *   taxOnShipping: true,              // optional; default true
 *   shipping: {
 *     baseFee: 15,                    // AED
 *     freeThreshold: 199              // AED; 0 or undefined => disabled
 *   },
 *   delivery: {
 *     label: "2–4 days"
 *   }
 * }
 */

/* ------------------------------- Helpers ------------------------------- */

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function formatMoney(value, currency = "AED") {
  const v = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v);
  } catch {
    // Fallback
    return `${currency} ${v.toFixed(2)}`;
  }
}

/**
 * Safely compute a single line total (unit * qty).
 */
export function computeLineSubtotal(unitPrice, qty) {
  const p = Number(unitPrice) || 0;
  const q = Math.max(0, Number(qty) || 0);
  return round2(p * q);
}

/* ------------------------------ Core logic ----------------------------- */

/**
 * applyPricing(items, settings)
 * items: [{ price, quantity, name?, productId?, variantId? }, ...]
 * returns: {
 *   currency, subtotal, shippingFee, taxAmount, taxRate, taxMode,
 *   shippingMethod: { code, label, baseFee },
 *   deliveryEta,
 *   grandTotal,
 *   lines: [{ name, unitPrice, quantity, lineSubtotal, lineTax, lineTotal }]
 * }
 */
export function applyPricing(items = [], settings = {}) {
  const currency = settings?.currency || "AED";
  const taxMode = (settings?.taxMode || "tax_exclusive").toLowerCase(); // 'tax_exclusive' | 'tax_inclusive'
  const taxRatePct = Number(settings?.taxRate) || 0; // %
  const taxOnShipping = settings?.taxOnShipping !== false; // default true

  const baseFee = Number(settings?.shipping?.baseFee) || 0;
  const freeThreshold = Number(settings?.shipping?.freeThreshold) || 0;
  const deliveryEta = settings?.delivery?.label || null;

  // Lines: compute per-line subtotal first (unit * qty)
  const lines = (items || []).map((it) => {
    const unit = Number(it.price) || 0;
    const qty = Math.max(0, Number(it.quantity) || 0);
    const lineSubtotal = computeLineSubtotal(unit, qty);

    // We'll fill lineTax / lineTotal after we know the tax mode
    return {
      name: it.name || "Item",
      unitPrice: round2(unit),
      quantity: qty,
      lineSubtotal, // pre-tax if tax_exclusive; tax-inclusive value if tax_inclusive
      lineTax: 0,
      lineTotal: lineSubtotal,
      productId: it.productId,
      variantId: it.variantId ?? null,
    };
  });

  const subtotal = round2(lines.reduce((acc, l) => acc + l.lineSubtotal, 0));

  // Shipping fee (free if threshold met and threshold > 0)
  const qualifiesFree = freeThreshold > 0 && subtotal >= freeThreshold;
  const shippingFee = qualifiesFree ? 0 : baseFee;

  let taxAmount = 0;

  if (taxRatePct > 0) {
    if (taxMode === "tax_exclusive") {
      // VAT is added on top of subtotal (+ optionally shipping)
      const taxableBase = subtotal + (taxOnShipping ? shippingFee : 0);
      taxAmount = round2(taxableBase * (taxRatePct / 100));

      // Per-line tax apportionment for reporting
      lines.forEach((l) => {
        const share = subtotal > 0 ? l.lineSubtotal / subtotal : 0;
        const lTax = round2(taxAmount * share);
        l.lineTax = lTax;
        l.lineTotal = round2(l.lineSubtotal + lTax);
      });
    } else {
      // tax_inclusive: unit prices already include VAT.
      // Derive the tax portion included in lineSubtotal.
      // taxPortion = price_incl * (rate / (100 + rate))
      const rateFrac = taxRatePct / (100 + taxRatePct);

      // Sum the included tax from items
      let itemsTaxPortion = 0;
      lines.forEach((l) => {
        const lTax = round2(l.lineSubtotal * rateFrac);
        l.lineTax = lTax;
        l.lineTotal = l.lineSubtotal; // already includes tax
        itemsTaxPortion += lTax;
      });

      // Shipping may also be tax-inclusive
      let shippingTaxPortion = 0;
      if (taxOnShipping && shippingFee > 0) {
        shippingTaxPortion = round2(shippingFee * rateFrac);
      }

      taxAmount = round2(itemsTaxPortion + shippingTaxPortion);
    }
  } else {
    // No tax
    lines.forEach((l) => {
      l.lineTax = 0;
      l.lineTotal = l.lineSubtotal;
    });
  }

  // Grand total
  let grandTotal;
  if (taxMode === "tax_exclusive") {
    grandTotal = round2(subtotal + shippingFee + taxAmount);
  } else {
    // tax_inclusive: prices already include tax; shipping considered tax-inclusive if enabled
    grandTotal = round2(subtotal + shippingFee);
  }

  return {
    currency,
    subtotal,
    shippingFee: round2(shippingFee),
    taxAmount,
    taxRate: taxRatePct,
    taxMode,
    shippingMethod: {
      code: "standard",
      label: "Standard Shipping",
      baseFee: round2(baseFee),
      freeThreshold: freeThreshold || null,
    },
    deliveryEta,
    grandTotal,
    lines,
  };
}

/* -------------------------------- Convenience ------------------------------- */

/**
 * formatPricing(pricing) → ready-to-render strings
 * Useful if you want formatted strings in one go.
 */
export function formatPricing(pricing) {
  const cur = pricing?.currency || "AED";
  return {
    subtotal: formatMoney(pricing?.subtotal || 0, cur),
    shippingFee: formatMoney(pricing?.shippingFee || 0, cur),
    taxAmount: formatMoney(pricing?.taxAmount || 0, cur),
    grandTotal: formatMoney(pricing?.grandTotal || 0, cur),
  };
}
