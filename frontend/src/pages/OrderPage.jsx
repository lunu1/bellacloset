import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserOrders, cancelOrder } from '../features/order/orderSlice';
import { toast } from 'react-toastify';

const OrderPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const handleCancel = (orderId) => {
    dispatch(cancelOrder(orderId))
      .unwrap()
      .then(() => toast.success('Order cancelled'))
      .catch((err) => toast.error(err));
  };

  if (loading) return <p className="p-4">Loading orders...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-normal mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow-sm">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> {order.totalAmount}AED</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

              <ul className="mt-2 text-sm">
                {order.products.map((item, idx) => (
                  <li key={idx}>
                    - Product ID: {item.productId}, Qty: {item.quantity}, Color: {item.color}, Size: {item.size}
                  </li>
                ))}
              </ul>

              {order.status !== 'Cancelled' && (
                <button
                  onClick={() => handleCancel(order._id)}
                  className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
