// src/components/orders/OrderHeader.jsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StatusBadge from "./StatusBadge";
import CopyButton from "./CopyButton";
import { backendURL } from "../../config";

export default function OrderHeader({ order }) {
  if (!order) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="animate-pulse h-4 w-72 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const placedAt = order?.createdAt ? new Date(order.createdAt).toLocaleString() : "—";
  const method = String(order?.paymentMethod || "").toUpperCase(); // "COD" | "RAZORPAY" | "STRIPE"
  const isPrepaid = method !== "COD";

  // Visible only when:
  // - Prepaid: payment captured (Paid)
  // - COD: fulfillment has started (Shipped) or completed (Delivered)
  const canShowInvoice =
    (isPrepaid && order?.paymentStatus === "Paid") ||
    (!isPrepaid && ["Shipped", "Delivered"].includes(String(order?.status)));

  return (
    <div className="bg-white border-b">
      {/* Top bar: Back */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            to="/orders"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      {/* Header card */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Left: Title / Meta */}
              <div>
                <h1 className="text-2xl font-normal">Order #{order._id}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Order ID: {order._id}</span>
                  <CopyButton text={order._id} />
                </div>
                <p className="text-sm text-gray-600">Placed on {placedAt}</p>
              </div>

              {/* Right: Status + (conditionally) Invoice action */}
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />

                {canShowInvoice && (
                  <div className="flex gap-2 mt-1">
                    <a
                      href={`${backendURL}/api/order/${order._id}/invoice.pdf`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                      title="Download Tax Invoice"
                    >
                      Download Invoice (PDF)
                    </a>
                  </div>
                )}
                {/* When pending/not eligible, no button is rendered (invisible). */}
              </div>
            </div>
            {/* End header row */}
          </div>
        </div>
      </div>
    </div>
  );
}
