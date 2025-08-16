// src/features/order/orderAPI.js
import { api } from "../../api/http";

// If you use header-based auth:
const auth = () => {
  const t = localStorage.getItem("token");
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
};

// 1) Place Order -> POST /api/order/place
export const placeOrderAPI = async (orderData) => {
  const { data } = await api.post("/order/place", orderData, auth());
  return data;
};

// 2) Get User Orders -> GET /api/order
export const getUserOrdersAPI = async () => {
  const { data } = await api.get("/order", auth());
  return data;
};

// 3) Get Order By Id -> GET /api/order/:orderId
export const getOrderByIdAPI = async (orderId) => {
  const { data } = await api.get(`/order/${orderId}`, auth());
  return data;
};

// 4) Cancel Order -> PUT /api/order/cancel/:orderId
export const cancelOrderAPI = async (orderId) => {
  const { data } = await api.put(`/order/cancel/${orderId}`, null, auth());
  // backend returns { message, order: <updated> }
  return data.order || data;
};
