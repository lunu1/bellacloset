import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useLocation } from "react-router-dom";
import { getOrderById } from "../features/order/orderSlice";
import { CheckCircle2, Clipboard, ClipboardCheck } from "lucide-react";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { current: order, currentLoading, error } = useSelector(s => s.order);
  const [copied, setCopied] = useState(false);
  const currency = "₹";

  useEffect(() => {
    if (orderId) dispatch(getOrderById(orderId));
  }, [dispatch, orderId]);

  const itemsCount = useMemo(
    () => (order?.products || []).reduce((sum, l) => sum + (Number(l.quantity) || 0), 0),
    [order]
  );

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
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {location.state?.justPlaced ? "Order Confirmed" : "Order Details"}
            </h1>
            <p className="text-gray-600">Thank you for your order. A confirmation email has been sent.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
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
              {currency}{Number(order?.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {order?.paymentMethod} • {order?.paymentStatus}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Estimated Delivery</div>
            <div className="text-xl font-semibold">{etaText}</div>
            <div className="text-sm text-gray-500">We'll notify you when shipped</div>
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
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
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
          Track Order
        </Link>
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