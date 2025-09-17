// src/lib/api.js
import axios from "axios";

 const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: true, // your admin uses cookie-based JWT
});

export default api;