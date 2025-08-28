// src/components/orders/OrderItems.jsx

// Currency formatter
const formatMoney = (n, cur = "AED", locale = "en-AE") =>
  new Intl.NumberFormat(locale, { style: "currency", currency: cur }).format(Number(n) || 0);

export default function OrderItems({ order }) {
  const currency = order?.pricing?.currency || "AED";
  const locale = currency === "AED" ? "en-AE" : undefined;

  // Normalize lines with snapshots/fallbacks
  const lines = (order?.products || []).map((item) => {
    const p = item.productId;      // may be populated object
    const v = item.variantId;      // may be populated object

    const name  = item.title || p?.name || "Product";
    const image = item.image || v?.images?.[0] || p?.images?.[0] || "/placeholder.jpg";

    // Prefer snapshot unitPrice; then variant price; then product defaultPrice/price
    const unit = item.unitPrice
      ?? v?.price
      ?? p?.defaultPrice
      ?? p?.price
      ?? 0;

    const qty = Math.max(0, Number(item.quantity) || 0);
    const lineTotal = unit * qty;

    const attrs = [];
    if (item.size)  attrs.push(`Size: ${item.size}`);
    if (item.color) attrs.push(`Color: ${item.color}`);

    return { name, image, unit, qty, lineTotal, attrs };
  });

  // Client-side subtotal (used as fallback if pricing.subtotal missing)
  const computedSubtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  // Server-side pricing snapshot (preferred)
  const pricing = order?.pricing || {};
  const subtotal   = pricing.subtotal      ?? computedSubtotal;
  const shipping   = pricing.shippingFee   ?? 0;
  const taxAmount  = pricing.taxAmount     ?? 0;
  const taxRate    = pricing.taxRate; // %
  const grandTotal = (pricing.grandTotal ?? order?.totalAmount ?? (subtotal + shipping + taxAmount));

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Order Items</h2>
      </div>

      <div className="p-6">
        {/* Lines */}
        <div className="space-y-4">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
              <img
                src={line.image}
                alt={line.name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{line.name}</div>
                <div className="text-sm text-gray-600">
                  {line.attrs.join(" • ")}
                  {line.attrs.length ? " • " : ""}Qty: {line.qty}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatMoney(line.unit, currency, locale)}</div>
                <div className="text-xs text-gray-500">each</div>
                <div className="text-xs text-gray-500 mt-1">
                  Line: {formatMoney(line.lineTotal, currency, locale)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div className="mt-6 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatMoney(subtotal, currency, locale)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">
              Shipping{pricing?.shippingMethod?.label ? ` • ${pricing.shippingMethod.label}` : ""}
            </span>
            <span>{formatMoney(shipping, currency, locale)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">
              Tax{typeof taxRate === "number" ? ` (${taxRate}%)` : ""}
            </span>
            <span>{formatMoney(taxAmount, currency, locale)}</span>
          </div>

          {pricing?.deliveryEta && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Estimated Delivery</span>
              <span>{pricing.deliveryEta}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{formatMoney(grandTotal, currency, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
