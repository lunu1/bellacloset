// src/features/order/orderAPI.js
import { api } from "../../api/http";

// ✅ Guest token helper (stored after placeOrder success)
const guestOrderHeader = (orderId) => {
  const t = localStorage.getItem(`guest_order_token_${orderId}`);
  return t ? { headers: { "x-guest-token": t } } : {};
};

// 1) Place Order -> POST /api/order/place
export const placeOrderAPI = async (orderData) => {
  // ✅ cookie auth handled by api instance (withCredentials: true)
  const { data } = await api.post("/order/place", orderData);

  // ✅ backend should return: { order, guestToken }
  // If guest checkout, store token for later /order/:id access
  const order = data?.order || data;
  const guestToken = data?.guestToken;

  if (guestToken && order?._id) {
    localStorage.setItem(`guest_order_token_${order._id}`, guestToken);
  }

  return order;
};

// 2) Get User Orders -> GET /api/order  (logged-in only)
export const getUserOrdersAPI = async () => {
  const { data } = await api.get("/order");
  return data;
};

// 3) Get Order By Id -> GET /api/order/:orderId
export const getOrderByIdAPI = async (orderId) => {
  // ✅ if logged-in cookie exists, it works
  // ✅ if guest, we attach x-guest-token so backend can allow it
  const { data } = await api.get(`/order/${orderId}`, guestOrderHeader(orderId));
  return data;
};

// 4) Cancel Order -> PUT /api/order/cancel/:orderId (logged-in only)
export const cancelOrderAPI = async (orderId) => {
  const { data } = await api.put(`/order/cancel/${orderId}`, null);
  return data.order || data;
};
