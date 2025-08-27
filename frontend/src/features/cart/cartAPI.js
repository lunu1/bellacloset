// src/features/cart/cartAPI.js
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const api = axios.create({
  baseURL: `${BASE}/api/cart`,
  withCredentials: true,
});

export const fetchCartAPI = async () => {
  const { data } = await api.get(`/`);
  return data;
};

export const addToCartAPI = async ({ productId, variantId, quantity }) => {
  const { data } = await api.post(`/add`, { productId, variantId, quantity });
  return data;
};

export const removeFromCartAPI = async ({ lineId, productId, variantId, quantity }) => {
  // Prefer lineId (works even if product is deleted/unavailable)
  const { data } = await api.post(`/remove`, { lineId, productId, variantId, quantity });
  return data;
};

export const clearCartAPI = async () => {
  const { data } = await api.delete(`/clear`);
  return data;
};

export const updateQuantityAPI = async ({ productId, variantId, quantity }) => {
  const { data } = await api.patch('/update', { productId, variantId, quantity });
  return data;
};
