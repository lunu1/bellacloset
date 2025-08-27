// src/components/CartTotal.jsx
import Title from "./Title";
import {
  computePricingPreview,
  defaultStoreSettings,
  adaptSettingsToPreview,
  formatCurrency
} from "../utils/pricingPreview";

/**
 * Props:
 * - items: [{ name, price, quantity }]
 * - pricing: optional server/authoritative snapshot (order.pricing)
 * - settings: either:
 *      (a) backend /api/settings/public shape (shipping/tax/delivery), OR
 *      (b) computePricingPreview shape
 * - currency: defaults to "AED"
 * - showBreakdown: default true
 * - showEta: default true
 */
export default function CartTotal({
  items = [],
  pricing = null,
  settings = null,
  currency = "AED",
  showBreakdown = true,
  showEta = true,
}) {
  // Normalize settings (works whether you pass backend shape or preview shape)
  const normalizedSettings =
    settings && (settings.shipping || settings.tax)
      ? adaptSettingsToPreview(settings) // backend shape
      : (settings || defaultStoreSettings); // already preview shape or null

  // Prefer authoritative snapshot if provided (e.g., from placed order)
  const snapshot = pricing || computePricingPreview(items, normalizedSettings);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        {showBreakdown &&
          items.map((item, idx) => {
            const priceNum = Number(item.price) || 0;
            const qtyNum = Number(item.quantity) || 0;
            return (
              <div className="flex justify-between" key={idx}>
                <p>{item.name} x {qtyNum}</p>
                <p>{formatCurrency(priceNum * qtyNum, currency)}</p>
              </div>
            );
          })}

        {showBreakdown && <hr />}

        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{formatCurrency(snapshot.subtotal, currency)}</p>
        </div>

        <div className="flex justify-between">
          <p>
            Shipping Fee{" "}
            {snapshot.shippingMethod?.label ? `(${snapshot.shippingMethod.label})` : ""}
          </p>
          <p>{formatCurrency(snapshot.shippingFee, currency)}</p>
        </div>

        <div className="flex justify-between">
          <p>
            {snapshot.taxMode === "tax_inclusive" ? "Included VAT" : "VAT"}{" "}
            {snapshot.taxRate ? `(${snapshot.taxRate}%)` : ""}
          </p>
          <p>{formatCurrency(snapshot.taxAmount, currency)}</p>
        </div>

        {showEta && snapshot.deliveryEta && (
          <div className="flex justify-between text-gray-600">
            <p>Delivery ETA</p>
            <p>{snapshot.deliveryEta}</p>
          </div>
        )}

        <hr />
        <div className="flex justify-between font-semibold">
          <p>Total</p>
          <p>{formatCurrency(snapshot.grandTotal, currency)}</p>
        </div>
      </div>
    </div>
  );
}
