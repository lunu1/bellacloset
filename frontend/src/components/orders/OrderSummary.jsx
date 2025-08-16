function Card({ title, value, sub }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-0.5">{sub}</div> : null}
    </div>
  );
}

export default function OrderSummary({ order, currency = "₹" }) {
  const itemsCount = (order.products || []).reduce((s, l) => s + (Number(l.quantity) || 0), 0);
  return (
    <div className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card title="Items" value={itemsCount} sub={`${order.products?.length || 0} line(s)`} />
      <Card title="Total" value={`${currency}${Number(order.totalAmount || 0).toFixed(2)}`} />
      <Card title="Payment" value={`${order.paymentMethod || "—"} · ${order.paymentStatus || "—"}`} />
    </div>
  );
}
