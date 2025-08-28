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

  return (
    <div className="pt-16 border-t">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {loading && <p className="text-center p-4">Loading orders...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && orders.length === 0 && (
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

            const canTrack =
              order.status === "Shipped" || order.status === "Delivered";
            const canCancel = order.status === "Pending";

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
                      Order #{order._id} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    {(order.paymentMethod || order.paymentStatus) && (
                      <p className="mt-1 text-xs text-gray-600">
                        Payment: {order.paymentMethod || "-"} ·{" "}
                        {order.paymentStatus || "-"}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                      <p className="text-lg">{order.totalAmount}AED</p>
                      <p>Quantity: {first?.quantity}</p>
                      {first?.size && <p>Size: {first.size}</p>}
                    </div>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex justify-between md:w-1/2">
                  <div className="flex items-center gap-2">
                    <p
                      className={`h-2 rounded-full min-w-2 ${
                        order.status === "Cancelled"
                          ? "bg-red-500"
                          : order.status === "Shipped"
                          ? "bg-blue-500"
                          : order.status === "Delivered"
                          ? "bg-green-600"
                          : "bg-yellow-500"
                      }`}
                    />
                    <p className="text-sm md:text-base">{order.status}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-50"
                    >
                      View Details
                    </Link>

                    {/* HIDE Track Order unless trackable */}
                    {canTrack && (
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-50"
                      >
                        Track Order
                      </Link>
                    )}

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
          <p className="text-gray-500 p-4">No orders found.</p>
        )}
      </div>
    </div>
  );
}

export default Orders;
