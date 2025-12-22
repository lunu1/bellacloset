import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../features/order/orderSlice";
import {
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Clock,
  XCircle,
} from "lucide-react";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { current: order, currentLoading, error } = useSelector((s) => s.order);
  const [copied, setCopied] = useState(false);
  const currency = "AED";

  useEffect(() => {
    if (orderId) dispatch(getOrderById(orderId));
  }, [dispatch, orderId]);

  const itemsCount = useMemo(() => {
    return (order?.products || []).reduce(
      (sum, l) => sum + (Number(l.quantity) || 0),
      0
    );
  }, [order]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const etaText = useMemo(() => {
    if (!order?.createdAt) return "—";
    const start = new Date(order.createdAt);
    const end = new Date(order.createdAt);
    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 7);
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  }, [order]);

  // ✅ State from backend
  const isStripe = String(order?.paymentMethod || "").toUpperCase() === "STRIPE";
  const paymentStatus = String(order?.paymentStatus || "");
  const status = String(order?.status || "");

  // ✅ Stripe request: authorized but not captured
  const isStripeRequested =
    isStripe &&
    (status === "Pending_Confirmation" || paymentStatus === "Authorized");

  // ✅ Confirmed rules:
  // - COD: confirmed right away
  // - STRIPE: confirmed only when payment is captured
  const isConfirmed = isStripe ? paymentStatus === "Paid" : true;

  // ✅ Cancelled
  const isCancelled = status === "Cancelled" || paymentStatus === "Cancelled";

  const headerTitle = useMemo(() => {
    if (isCancelled) return "Order Cancelled";
    if (isStripeRequested) return "Order Request Received";
    if (isConfirmed) return "Order Confirmed";
    return "Order Details";
  }, [isStripeRequested, isConfirmed, isCancelled]);

  const headerSubtitle = useMemo(() => {
    if (isCancelled) return "This order has been cancelled.";
    if (isStripeRequested) {
      return "Payment is authorized (not charged yet). We’ll confirm availability and then capture the payment.";
    }
    if (isConfirmed) {
      return "Thank you for your order. You’ll receive updates as your order progresses.";
    }
    return "Here are your order details.";
  }, [isStripeRequested, isConfirmed, isCancelled]);

  // ✅ ICON FIX
  const StatusIcon = useMemo(() => {
    if (isCancelled) return XCircle;
    if (isStripeRequested) return Clock;
    return CheckCircle2;
  }, [isStripeRequested, isCancelled]);

  const statusIconClass = useMemo(() => {
    if (isCancelled) return "w-8 h-8 text-red-600";
    if (isStripeRequested) return "w-8 h-8 text-amber-600";
    return "w-8 h-8 text-green-600";
  }, [isStripeRequested, isCancelled]);

  const deliveryNote = useMemo(() => {
    if (isCancelled) return "Cancelled";
    if (isStripeRequested) return "We’ll notify you after confirmation";
    if (status === "Shipped") return "Your order is on the way";
    if (status === "Delivered") return "Delivered";
    return "We'll notify you when shipped";
  }, [isStripeRequested, status, isCancelled]);

  const canTrack = status === "Shipped" || status === "Delivered";

  if (currentLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <StatusIcon className={statusIconClass} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{headerTitle}</h1>
            <p className="text-gray-600">{headerSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderId}</span>
            <button
              onClick={copyId}
              className="flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
            >
              {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {order?.createdAt && (
            <span className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Stripe extra info */}
        {isStripe && order?.paymentIntentId && (
          <div className="mt-3 text-xs text-gray-600">
            <span className="font-medium">Payment Intent:</span>{" "}
            <span className="font-mono">{order.paymentIntentId}</span>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Items</div>
            <div className="text-xl font-semibold">{itemsCount}</div>
            <div className="text-sm text-gray-500">{order?.products?.length || 0} products</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-xl font-semibold">
              {Number(order?.totalAmount || 0).toFixed(2)} {currency}
            </div>
            <div className="text-sm text-gray-500">
              {order?.paymentMethod} • {order?.paymentStatus}
            </div>

            {isStripeRequested && (
              <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">
                Awaiting confirmation (authorized only)
              </span>
            )}

            {order?.paymentMethod === "COD" && order?.cod?.confirmed && (
              <span className="mt-1 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-[11px] text-yellow-800">
                COD Confirmed
              </span>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600">Estimated Delivery</div>
            <div className="text-xl font-semibold">{etaText}</div>
            <div className="text-sm text-gray-500">{deliveryNote}</div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>

        <div className="space-y-4">
          {(order?.products || []).map((line, i) => {
            const p = line.productId;
            const img = line.variantId?.images?.[0] || p?.images?.[0];
            return (
              <div
                key={i}
                className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <img
                  src={img || "/placeholder.jpg"}
                  className="w-16 h-16 object-cover rounded border"
                  alt=""
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{p?.name || "Product"}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {line.size && <span>Size: {line.size}</span>}
                    {line.size && line.color && <span> • </span>}
                    {line.color && <span>Color: {line.color}</span>}
                    {(line.size || line.color) && <span> • </span>}
                    <span>Quantity: {line.quantity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <div className="text-gray-700">
          <div>{order?.address?.street}</div>
          <div>{order?.address?.city}</div>
          <div>{order?.address?.state}</div>
          <div>{order?.address?.zip}</div>
          <div>{order?.address?.country}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to={`/orders/${orderId}`}
          className="px-6 py-2 bg-black text-white rounded hover:bg-blue-700"
        >
          View Details
        </Link>

        {canTrack && (
          <Link
            to={`/orders/${orderId}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Track Order
          </Link>
        )}

        <Link
          to="/orders"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          My Orders
        </Link>

        <Link
          to="/"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
