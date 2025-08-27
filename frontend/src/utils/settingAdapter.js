// src/utils/settingsAdapter.js
export function adaptSettingsForPreview(api) {
  if (!api) return null;

  const methods = api?.shipping?.methods || [];
  const defCode = api?.shipping?.defaultMethodCode;
  const chosen =
    methods.find(m => m.code === defCode && m.active) ||
    methods.find(m => m.active) ||
    methods[0] ||
    null;

  const eta =
    chosen && Number.isFinite(chosen.etaDaysMin) && Number.isFinite(chosen.etaDaysMax)
      ? `${chosen.etaDaysMin}–${chosen.etaDaysMax} days`
      : "";

  return {
    // what CartTotal/computePricingPreview expect
    taxRate: Number(api?.tax?.rate ?? 0), // percent, e.g. 5
    taxMode: api?.tax?.displayMode === "tax_inclusive" ? "tax_inclusive" : "tax_exclusive",

    freeShippingMin: Number(api?.shipping?.freeOver ?? 0),
    shippingFlatFee: Number(chosen?.amount ?? 0),
    shippingMethod: chosen ? { code: chosen.code, label: chosen.label } : null,
    deliveryEta: eta,
  };
}
