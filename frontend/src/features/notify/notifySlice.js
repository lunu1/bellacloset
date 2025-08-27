// src/features/notify/notifySlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { subscribeBackInStockAPI } from "./notifyAPI";

export const subscribeBackInStock = createAsyncThunk(
  "notify/subscribe",
  async ({ productId, email }, { rejectWithValue }) => {
    try {
      const data = await subscribeBackInStockAPI({ productId, email });
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const notifySlice = createSlice({
  name: "notify",
  initialState: { loading: false, error: null, lastSubscribed: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(subscribeBackInStock.pending, (s) => {
      s.loading = true; s.error = null;
    });
    b.addCase(subscribeBackInStock.fulfilled, (s, a) => {
      s.loading = false; s.lastSubscribed = a.meta.arg?.productId || null;
    });
    b.addCase(subscribeBackInStock.rejected, (s, a) => {
      s.loading = false; s.error = a.payload || a.error.message;
    });
  },
});

export default notifySlice.reducer;
