// src/features/notify/notifyAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api/notify`
    : "http://localhost:4000/api/notify",
  withCredentials: true,
});

export const subscribeBackInStockAPI = async ({ productId, email }) => {
  const { data } = await api.post("/subscribe", { productId, email });
  return data; // { ok: true, subscribed: true, ... }
};
