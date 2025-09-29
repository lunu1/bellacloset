import axios from "axios";

// Build a base URL that ALWAYS ends with /api
const RAW =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:4000");

const BASE = RAW.trim().replace(/\/+$/, "");          // strip trailing slashes
const BASE_URL = /\/api$/i.test(BASE) ? BASE : `${BASE}/api`; // append /api if missing

// Public/general client
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Admin client – attaches Bearer token if present
export const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Helpers to manage admin token (optional)
export const setAdminToken = (t) => localStorage.setItem("adminToken", t);
export const clearAdminToken = () => localStorage.removeItem("adminToken");

// Fallback to cookies if no localStorage token
function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

adminApi.interceptors.request.use((config) => {
  const t =
    localStorage.getItem("adminToken") ||
    getCookie("admin_token") ||
    getCookie("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
