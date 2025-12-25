import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

// PUBLIC
export const fetchPublicFeatures = async () => {
  const res = await api.get("/api/features/public");
  return res.data?.data || [];
};

// ADMIN
export const fetchAdminFeatures = async () => {
  const res = await api.get("/api/features/admin");
  return res.data?.data || [];
};

export const createAdminFeature = async (payload) => {
  const res = await api.post("/api/features/admin", payload);
  return res.data?.data;
};

export const updateAdminFeature = async ({ id, payload }) => {
  const res = await api.patch(`/api/features/admin/${id}`, payload);
  return res.data?.data;
};

export const deleteAdminFeature = async (id) => {
  const res = await api.delete(`/api/features/admin/${id}`);
  return res.data;
};
