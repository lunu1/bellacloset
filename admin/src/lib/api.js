// src/lib/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://bellaluxurycloset.com";

// Public/general client (cookies ok if you need them)
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Admin client – always tries to attach Bearer token
export const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // optional; Bearer is what really matters
});

// tiny helpers you can import in your login/logout flows
export const setAdminToken = (t) => localStorage.setItem("adminToken", t);
export const clearAdminToken = () => localStorage.removeItem("adminToken");

// If you also set an admin cookie, we can fall back to it:
function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

adminApi.interceptors.request.use((config) => {
  // Prefer localStorage token; fall back to cookie if present
  const t =
    localStorage.getItem("adminToken") ||
    getCookie("admin_token") ||
    getCookie("token"); // last resort

  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
