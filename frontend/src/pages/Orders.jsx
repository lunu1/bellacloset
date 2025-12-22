import { useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { getUserOrders } from "../features/order/orderSlice.js";

function Orders() {
  const dispatch = useDispatch();
  const { backendUrl } = useContext(AppContext);
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.put(
        `${backendUrl}/api/order/cancel/${orderId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Order cancelled");
      dispatch(getUserOrders());
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to cancel order");
    }
  };

  // ---- helpers for Stripe manual-capture UX ----
  const getDisplayStatus = (order) => {
    const method = String(order?.paymentMethod || "").toUpperCase();
    const pay = String(order?.paymentStatus || "");
    const st = String(order?.status || "");

    const isStripe = method === "STRIPE";
    const isRequested = isStripe && (st === "Pending_Confirmation" || pay === "Authorized");
    const isConfirmed = isStripe ? pay === "Paid" : true;

    if (st === "Cancelled" || pay === "Cancelled") return "Cancelled";
    if (st === "Delivered") return "Delivered";
    if (st === "Shipped") return "Shipped";

    if (isRequested) return "Requested"; // ✅ Stripe request state
    if (isConfirmed) return "Confirmed"; // COD always confirmed; Stripe after capture
    return st || "Pending";
  };

  const getDotClass = (displayStatus) => {
    if (displayStatus === "Cancelled") return "bg-red-500";
    if (displayStatus === "Delivered") return "bg-green-600";
    if (displayStatus === "Shipped") return "bg-blue-500";
    if (displayStatus === "Requested") return "bg-amber-500";
    if (displayStatus === "Confirmed") return "bg-green-500";
    return "bg-yellow-500";
  };

  const canTrackOrder = (order) => {
    return order.status === "Shipped" || order.status === "Delivered";
  };

  const canCancelOrder = (order) => {
    const method = String(order?.paymentMethod || "").toUpperCase();
    const pay = String(order?.paymentStatus || "");
    const st = String(order?.status || "");

    // COD: allow cancel while Pending
    if (method === "COD") return st === "Pending";

    // STRIPE: allow cancel while Pending_Confirmation AND still Authorized
    if (method === "STRIPE") {
      return (st === "Pending_Confirmation" || st === "Pending") && pay === "Authorized";
    }

    return false;
  };

  return (
    <div className="pt-16 border-t">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {loading && <p className="text-center p-4">Loading orders...</p>}
      {error && <p className="text-center text-red-500">{String(error)}</p>}
      {!loading && Array.isArray(orders) && orders.length === 0 && (
        <p className="text-center p-4 text-gray-500">No orders found.</p>
      )}

      <div>
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => {
            const first = order.products?.[0];
            const img =
              first?.variantId?.images?.[0] ||
              first?.productId?.images?.[0] ||
              "/placeholder.jpg";

            const moreCount = Math.max(0, (order.products?.length || 0) - 1);

            const displayStatus = getDisplayStatus(order);
            const dotClass = getDotClass(displayStatus);

            const canTrack = canTrackOrder(order);
            const canCancel = canCancelOrder(order);

            return (
              <div
                key={order._id}
                className="flex flex-col gap-4 py-4 text-gray-700 border-t border-b md:flex-row md:items-center md:justify-between"
              >
                {/* Left: product summary */}
                <div className="flex items-start gap-6 text-sm">
                  <img
                    src={img}
                    className="w-16 sm:w-20 rounded object-cover"
                    alt="Product"
                  />
                  <div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="font-medium sm:text-base hover:underline"
                    >
                      {first?.productId?.name || "Product Name"}
                    </Link>

                    {moreCount > 0 && (
                      <span className="ml-2 text-gray-500">+{moreCount} more</span>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      Order #{order._id} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    {(order.paymentMethod || order.paymentStatus) && (
                      <p className="mt-1 text-xs text-gray-600">
                        Payment: {order.paymentMethod || "-"} · {order.paymentStatus || "-"}
                      </p>
                    )}

                    {displayStatus === "Requested" && (
                      <p className="mt-1 text-xs text-amber-700">
                        Payment authorized — awaiting confirmation before capture.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-base text-gray-700">
                      <p className="text-lg">{Number(order.totalAmount || 0).toFixed(2)} AED</p>
                      <p>Qty: {first?.quantity}</p>
                      {first?.size && <p>Size: {first.size}</p>}
                    </div>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex justify-between md:w-1/2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                    <p className="text-sm md:text-base">{displayStatus}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-50"
                    >
                      View Details
                    </Link>

                    {/* Track only when shipped/delivered */}
                    {canTrack && (
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-50"
                      >
                        Track Order
                      </Link>
                    )}

                    {/* Cancel rules updated for Stripe manual capture */}
                    {canCancel && (
                      <button
                        className="px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-50"
                        onClick={() => handleCancel(order._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          !loading && <p className="text-gray-500 p-4">No orders found.</p>
        )}
      </div>
    </div>
  );
}

export default Orders;
