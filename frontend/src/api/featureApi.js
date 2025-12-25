import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://www.bellaluxurycloset.com",
  withCredentials: true,
});

export const fetchPublicFeatures = async () => {
  const res = await api.get("/api/features/public");
  return res.data?.data || [];
};
