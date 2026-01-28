// src/pages/OrderSuccess.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams,useNavigate} from "react-router-dom";
import { getOrderById } from "../features/order/orderSlice";
import {
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Clock,
  XCircle,
} from "lucide-react";
import BackButton from "../components/BackButton";
import { useCurrency } from "../context/CurrencyContext"; // ✅ currency switch support
import { toast } from "react-toastify";


export default function OrderSuccess() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { current: order, currentLoading, error } = useSelector((s) => s.order);
const navigate = useNavigate();
  const isGuestOrder = !order?.user; // ✅ guest order -> user is null


  const [copied, setCopied] = useState(false);

  // ✅ Use currency context (assumes DB values are AED and format() converts)
  const { currency, format } = useCurrency();

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
    <div className="container mx-auto max-w-4xl px-4 py-5">
      {/* Header */}
      <BackButton className="mb-3" />

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <StatusIcon className={statusIconClass} />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {headerTitle}
            </h1>
            <p className="text-gray-600">{headerSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {orderId}
            </span>
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

        {/* Currency indicator (optional) */}
        <div className="mt-3 text-xs text-gray-500">
          Display currency: <span className="font-medium">{currency}</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Items</div>
            <div className="text-xl font-semibold">{itemsCount}</div>
            <div className="text-sm text-gray-500">
              {order?.products?.length || 0} products
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-xl font-semibold">
              {/* ✅ Use CurrencyContext formatter (assumes totalAmount is AED) */}
              {format(order?.totalAmount || 0)}
            </div>

            <div className="text-sm text-gray-500">
              {order?.paymentMethod} • {order?.paymentStatus}
            </div>

            {isStripeRequested && (
              <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">
                Awaiting confirmation (authorized only)
              </span>
            )}

            {String(order?.paymentMethod || "").toUpperCase() === "COD" &&
              order?.cod?.confirmed && (
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

            // ✅ FIX: variantId is usually an ID (string). Prefer line.variant if populated.
            const img =
              line?.variant?.images?.[0] ||
              p?.images?.[0] ||
              "/placeholder.jpg";

            // If backend sends unitPrice / lineTotal in AED, use them.
            // Otherwise we fall back to 0 (you can adjust if your schema differs).
            const unitPriceAED =
              typeof line?.price === "number"
                ? line.price
                : typeof line?.unitPrice === "number"
                ? line.unitPrice
                : null;

            const qty = Number(line.quantity) || 0;
            const lineTotalAED =
              unitPriceAED != null ? Number(unitPriceAED) * qty : null;

            return (
              <div
                key={i}
                className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <img
                  src={img}
                  className="w-16 h-16 object-cover rounded border"
                  alt={p?.name || "Product"}
                />

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {p?.name || "Product"}
                  </h3>

                  <div className="text-sm text-gray-600 mt-1">
                    {line.size && <span>Size: {line.size}</span>}
                    {line.size && line.color && <span> • </span>}
                    {line.color && <span>Color: {line.color}</span>}
                    {(line.size || line.color) && <span> • </span>}
                    <span>Quantity: {qty}</span>
                  </div>

                  {/* ✅ Optional price display (converted) */}
                  <div className="mt-2 text-sm text-gray-700">
                    {unitPriceAED != null && (
                      <span className="mr-3">
                        Unit: <span className="font-medium">{format(unitPriceAED)}</span>
                      </span>
                    )}
                    {lineTotalAED != null && (
                      <span>
                        Total: <span className="font-medium">{format(lineTotalAED)}</span>
                      </span>
                    )}
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

        <div className="text-gray-700 space-y-1">
          {/* Name + phone */}
          {order?.address?.fullName && (
            <div className="font-medium text-gray-900">
              {order.address.fullName}
            </div>
          )}
          {order?.address?.phone && (
            <div className="text-sm text-gray-600">
              Phone: {order.address.phone}
            </div>
          )}

          {/* Address type */}
          {order?.address?.addressType && (
            <div className="text-sm text-gray-600 capitalize">
              {order.address.addressType}
            </div>
          )}

          {/* Unit + building */}
          <div>
            {order?.address?.unitNumber ? `${order.address.unitNumber}, ` : ""}
            {order?.address?.buildingName || ""}
          </div>

          {/* Street + area + city */}
          <div>
            {[order?.address?.street, order?.address?.area, order?.address?.city]
              .filter(Boolean)
              .join(", ")}
          </div>

          {/* Emirate + postal code */}
          <div>
            {[order?.address?.emirate, order?.address?.postalCode]
              .filter(Boolean)
              .join(" · ")}
          </div>

          {/* Landmark / PO Box */}
          {order?.address?.landmark && <div>Landmark: {order.address.landmark}</div>}
          {order?.address?.poBox && <div>PO Box: {order.address.poBox}</div>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to={`/orders/${orderId}`}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
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

        {/* <Link
          to="/orders"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          My Orders
        </Link> */}

        {!isGuestOrder ? (
  <Link
    to="/orders"
    className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
  >
    My Orders
  </Link>
) : (
  <button
    type="button"
    onClick={() => {
      toast.info("Please login first to view your orders");
      navigate("/login");
    }}
    className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
  >
    My Orders
  </button>
)}



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
