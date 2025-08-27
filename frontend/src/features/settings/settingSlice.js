// src/features/settings/settingSlice.js (frontend)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fallbacks
const API =
  import.meta.env.VITE_STORE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

const api = axios.create({ baseURL: API });

export const fetchShopSettings = createAsyncThunk("settings/fetchShop", async () => {
  const { data } = await api.get("/api/settings/public");
  return data;
});

const slice = createSlice({
  name: "settings",
  initialState: { data: null, loading: false, error: null, lastLoadedAt: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchShopSettings.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchShopSettings.fulfilled, (s, a) => {
      s.loading = false; s.data = a.payload; s.lastLoadedAt = Date.now();
    });
    b.addCase(fetchShopSettings.rejected, (s, a) => { s.loading = false; s.error = a.error?.message || "Failed"; });
  },
});

export default slice.reducer;
