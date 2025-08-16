// ADMIN/src/pages/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  updateAdminOrderPayment,
} from "../redux/adminOrderSlice";

const STATUS = ["Pending", "Shipped", "Delivered", "Cancelled"];
const METHODS = ["COD", "RAZORPAY", "STRIPE"];
const PAY_STATUS = ["Pending", "Paid", "Failed", "Refunded"];

function Orders() {
  const dispatch = useDispatch();
  const { list: orders, loading, page, limit, total, updating, error } =
    useSelector((s) => s.adminOrders);

  // local filter UI state
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [curPage, setCurPage] = useState(1);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit || 10)), [total, limit]);

  useEffect(() => {
    dispatch(fetchAdminOrders({ page: curPage, limit: 10, q, status, paymentMethod, paymentStatus }));
  }, [dispatch, curPage, q, status, paymentMethod, paymentStatus]);

  const onUpdateStatus = (id, newStatus) =>
    dispatch(updateAdminOrderStatus({ orderId: id, status: newStatus }));

  const onUpdateTracking = (id) => {
    const carrier = prompt("Carrier (e.g., Delhivery):", "");
    if (carrier === null) return;
    const trackingNumber = prompt("Tracking Number:", "");
    if (trackingNumber === null) return;
    const eta = prompt("ETA (YYYY-MM-DD) optional:", "");
    dispatch(updateAdminOrderTracking({ orderId: id, carrier, trackingNumber, eta: eta || undefined }));
  };

  const onUpdatePayment = (id, newPayStatus) =>
    dispatch(updateAdminOrderPayment({ orderId: id, paymentStatus: newPayStatus }));

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setCurPage(1)}
          placeholder="Search by order id or email"
          className="w-64 rounded border p-2 text-sm"
        />
        <select className="rounded border p-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="rounded border p-2 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">All Methods</option>
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select className="rounded border p-2 text-sm" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All Payment</option>
          {PAY_STATUS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button className="rounded border px-3 py-2 text-sm" onClick={() => setCurPage(1)}>
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Tracking</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-6 text-center" colSpan={8}>Loading…</td></tr>
            ) : error ? (
              <tr><td className="px-3 py-6 text-center text-red-500" colSpan={8}>{error}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="px-3 py-6 text-center" colSpan={8}>No orders</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{o._id}</div>
                    <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2">{o.user?.email || "-"}</td>
                  <td className="px-3 py-2">{o.products?.length || 0}</td>
                  <td className="px-3 py-2">₹{Number(o.totalAmount).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs">{o.paymentMethod} · {o.paymentStatus}</div>
                    {o.paymentMethod === "COD" && o.cod?.confirmed && (
                      <span className="mt-1 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-[11px] text-yellow-800">COD Confirmed</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded border p-1 text-sm"
                      value={o.status}
                      disabled={updating}
                      onChange={(e) => onUpdateStatus(o._id, e.target.value)}
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {o.tracking?.trackingNumber ? (
                      <div className="text-xs">
                        <div>{o.tracking.carrier || "-"}</div>
                        <div className="font-mono">{o.tracking.trackingNumber}</div>
                        {o.tracking.eta && <div>ETA: {new Date(o.tracking.eta).toLocaleDateString()}</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded border px-2 py-1 text-xs"
                        disabled={updating}
                        onClick={() => onUpdateTracking(o._id)}
                      >
                        Set Tracking
                      </button>
                      <select
                        className="rounded border px-2 py-1 text-xs"
                        value={o.paymentStatus}
                        disabled={updating}
                        onChange={(e) => onUpdatePayment(o._id, e.target.value)}
                      >
                        {PAY_STATUS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {curPage} / {pages} — {total} total</div>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={curPage <= 1} onClick={() => setCurPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={curPage >= pages} onClick={() => setCurPage((p) => Math.min(pages, p + 1))}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Orders;
