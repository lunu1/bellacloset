import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrders, cancelOrder } from "../features/order/orderSlice";
import { toast } from "react-toastify";
import { useCurrency } from "../context/CurrencyContext";

const OrderPage = () => {
  const dispatch = useDispatch();
  const { orders = [], loading, error } = useSelector((state) => state.order);

  const { format } = useCurrency(); // ✅ currency formatting (AED → selected)

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const handleCancel = (orderId) => {
    dispatch(cancelOrder(orderId))
      .unwrap()
      .then(() => toast.success("Order cancelled"))
      .catch((err) => toast.error(err?.message || String(err)));
  };

  if (loading) return <p className="p-4">Loading orders...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {String(error)}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-normal mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const canCancel =
              order.status !== "Cancelled" &&
              order.status !== "Shipped" &&
              order.status !== "Delivered";

            return (
              <div key={order._id} className="border p-4 rounded shadow-sm">
                <p>
                  <strong>Order ID:</strong> {order._id}
                </p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>

                {/* ✅ Currency switch */}
                <p>
                  <strong>Total:</strong> {format(order.totalAmount || 0)}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "—"}
                </p>

                <ul className="mt-2 text-sm space-y-1">
                  {(order.products || []).map((item, idx) => {
                    const p = item.productId;
                    const name =
                      typeof p === "object" && p?.name ? p.name : String(p || "Product");

                    return (
                      <li key={idx}>
                        - {name}, Qty: {item.quantity}
                        {item.color ? `, Color: ${item.color}` : ""}
                        {item.size ? `, Size: ${item.size}` : ""}
                      </li>
                    );
                  })}
                </ul>

                {canCancel && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="mt-3 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
