// src/features/adminProducts/adminProductsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchAll",
  async (params = {}, { signal }) => {
    const res = await api.get("/products/all", { params, signal });
    return res.data; // expect array like [{ product, variants }, ...]
  },
  {
    // avoid spamming the API
    condition: (_, { getState }) => {
      const { status, lastFetched } = getState().adminProducts || {};
      if (status === "loading") return false;
      if (lastFetched && Date.now() - lastFetched < 60_000) return false; // 1 min cache
      return true;
    },
  }
);

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState: { items: [], status: "idle", error: null, lastFetched: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
        state.lastFetched = Date.now();
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Failed to load products";
      });
  },
});

export default adminProductsSlice.reducer;
