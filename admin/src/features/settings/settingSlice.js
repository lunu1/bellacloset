// src/features/settings/settingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Make sure this points to the backend origin (not the Vite dev server)
const API =
  import.meta.env.VITE_ADMIN_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://bellaluxurycloset.com";

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const fetchSettings = createAsyncThunk("settings/fetch", async () => {
  const { data } = await api.get("/api/settings/public");
  // data = { shipping: {...}, tax: {...}, updatedAt }
  return data;
});

/**
 * Expects payload shaped to your backend model:
 * {
 *   tax: { rate: 5, displayMode: "tax_exclusive" },
 *   shipping: {
 *     freeOver: 199,
 *     defaultMethodCode: "standard",
 *     methods: [{code,label,amount,etaDaysMin,etaDaysMax,active}]
 *   }
 * }
 */
export const updateSettings = createAsyncThunk(
  "settings/update",
  async (payload) => {
    const { data } = await api.put("/api/settings", payload);
    return data;
  }
);

const slice = createSlice({
  name: "settings",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchSettings.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchSettings.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; });
    b.addCase(fetchSettings.rejected, (s, a) => { s.loading = false; s.error = a.error?.message || "Failed"; });

    b.addCase(updateSettings.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(updateSettings.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; });
    b.addCase(updateSettings.rejected, (s, a) => { s.loading = false; s.error = a.error?.message || "Failed"; });
  },
});

export default slice.reducer;
