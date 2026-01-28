// src/components/CartTotal.jsx
import Title from "./Title";
import {
  computePricingPreview,
  defaultStoreSettings,
  adaptSettingsToPreview,
} from "../utils/pricingPreview";

import { useCurrency } from "../context/CurrencyContext";

export default function CartTotal({
  items = [],
  pricing = null,
  settings = null,
  showBreakdown = true,
  showEta = true,
}) {
  const { format } = useCurrency();

  // Normalize settings (works whether you pass backend shape or preview shape)
  const normalizedSettings =
    settings && (settings.shipping || settings.tax)
      ? adaptSettingsToPreview(settings)
      : settings || defaultStoreSettings;

  // Prefer authoritative snapshot if provided (e.g., from placed order)
  // snapshot values are assumed in AED
  const snapshot = pricing || computePricingPreview(items, normalizedSettings);

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        {showBreakdown &&
          items.map((item, idx) => {
            const priceNum = Number(item.price) || 0; // AED
            const qtyNum = Number(item.quantity) || 0;
            return (
              <div className="flex justify-between" key={idx}>
                <p>
                  {item.name} x {qtyNum}
                </p>
                <p>{format(priceNum * qtyNum)}</p>
              </div>
            );
          })}

        {showBreakdown && <hr />}

        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{format(snapshot.subtotal)}</p>
        </div>

        <div className="flex justify-between">
          <p>
            Shipping Fee{" "}
            {snapshot.shippingMethod?.label ? `(${snapshot.shippingMethod.label})` : ""}
          </p>
          <p>{format(snapshot.shippingFee)}</p>
        </div>

        <div className="flex justify-between">
          <p>
            {snapshot.taxMode === "tax_inclusive" ? "Included VAT" : "VAT"}{" "}
            {snapshot.taxRate ? `(${snapshot.taxRate}%)` : ""}
          </p>
          <p>{format(snapshot.taxAmount)}</p>
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
          <p>{format(snapshot.grandTotal)}</p>
        </div>
      </div>
    </div>
  );
}
