import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrders } from "../features/order/orderSlice.js";
import Title from "../components/Title";


function Orders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

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
  orders.map((order) => (
    <div
      key={order._id}
      className="flex flex-col gap-4 py-4 text-gray-700 border-t border-b md:flex-row md:items-center md:justify-between"
    >
      {Array.isArray(order.products) && order.products.length > 0 ? (
        <div className="flex items-start gap-6 text-sm">
          <img
            src={order.products[0]?.productId?.images?.[0] || "/placeholder.jpg"}
            className="w-16 sm:w-20"
            alt="Product"
          />
          <div>
            <p className="font-medium sm:text-base">
              {order.products[0]?.productId?.name || "Product Name"}
            </p>
            <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
              <p className="text-lg">₹{order.totalAmount}</p>
              <p>Quantity: {order.products[0]?.quantity}</p>
              <p>Size: {order.products[0]?.size}</p>
            </div>
            <p className="mt-2">
              Date:{" "}
              <span className="text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <p className="text-red-500 text-sm">Product info not available</p>
      )}

      <div className="flex justify-between md:w-1/2">
        <div className="flex items-center gap-2">
          <p
            className={`h-2 rounded-full min-w-2 ${
              order.status === "Cancelled" ? "bg-red-500" : "bg-green-500"
            }`}
          ></p>
          <p className="text-sm md:text-base">{order.status}</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium border rounded-sm">
          Track Order
        </button>
      </div>
    </div>
  ))
) : (
  <p className="text-gray-500 p-4">No orders found.</p>
)}


      </div>
    </div>
  );
}

export default Orders;
