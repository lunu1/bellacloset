export default function OrderItems({ order, currency = "₹" }) {
  const subtotal = (order.products || []).reduce(
    (sum, it) => sum + ((it.variantId?.price || it.productId?.price || 0) * (it.quantity || 0)),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Order Items</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {(order.products || []).map((item, i) => {
            const p = item.productId;
            const img = item.variantId?.images?.[0] || p?.images?.[0] || "/placeholder.jpg";
            const price = item.variantId?.price || p?.price || 0;

            return (
              <div key={i} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                <img src={img} alt={p?.name || "Product"} className="w-20 h-20 object-cover rounded-lg border" />
                <div className="flex-1">
                  <div className="font-medium">{p?.name || "Product"}</div>
                  <div className="text-sm text-gray-600">
                    {item.size ? `Size: ${item.size}` : ""}
                    {item.size && item.color ? " • " : ""}
                    {item.color ? `Color: ${item.color}` : ""}
                    {item.size || item.color ? " • " : ""}Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{currency}{Number(price).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">each</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{currency}{Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
