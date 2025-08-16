export default function Timeline({ order }) {
  const steps = (() => {
    if (!order) return [];
    const base = [{ key: "placed", label: "Order Placed", date: order.createdAt, done: true }];
    if (order.status === "Cancelled") {
      base.push({ key: "cancelled", label: "Order Cancelled", date: order.cancelledAt, done: true });
      return base;
    }
    base.push(
      { key: "shipped", label: "Order Shipped",   date: order.shippedAt || order.statusHistory?.find(s => s.status === "Shipped")?.at,
        done: ["Shipped","Delivered"].includes(order.status) },
      { key: "delivered", label: "Delivered",     date: order.deliveredAt || order.statusHistory?.find(s => s.status === "Delivered")?.at,
        done: order.status === "Delivered" }
    );
    return base;
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h3 className="font-semibold mb-4">Order Timeline</h3>
        <div className="space-y-3">
          {steps.map(s => (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.done ? "bg-green-500" : "bg-gray-300"}`} />
              <div className="text-sm">
                <div className={`font-medium ${s.done ? "text-gray-900" : "text-gray-500"}`}>{s.label}</div>
                <div className={`${s.done ? "text-gray-600" : "text-gray-500"}`}>
                  {s.date ? new Date(s.date).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
