
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/admin/orders`;

// Helpers
const errPayload = (err) => err?.response?.data || { message: "Request failed" };
const pickOrder = (data) => data?.order ?? data;

// 1) List orders (with filters/pagination)
export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE_URL, { params, withCredentials: true });
      // expected: { page, limit, total, orders }
      return res.data;
    } catch (err) {
      return rejectWithValue(errPayload(err));
    }
  }
);

// 2) Update status
export const updateAdminOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ orderId, status, note }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/status`,
        { status, note },
        { withCredentials: true }
      );
      return pickOrder(res.data); // returns the updated order
    } catch (err) {
      return rejectWithValue(errPayload(err));
    }
  }
);

// 3) Update tracking
export const updateAdminOrderTracking = createAsyncThunk(
  "adminOrders/updateTracking",
  async ({ orderId, carrier, trackingNumber, eta }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/tracking`,
        { carrier, trackingNumber, eta },
        { withCredentials: true }
      );
      return pickOrder(res.data);
    } catch (err) {
      return rejectWithValue(errPayload(err));
    }
  }
);

// 4) Update payment
export const updateAdminOrderPayment = createAsyncThunk(
  "adminOrders/updatePayment",
  async ({ orderId, paymentStatus }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/${orderId}/payment`,
        { paymentStatus },
        { withCredentials: true }
      );
      return pickOrder(res.data);
    } catch (err) {
      return rejectWithValue(errPayload(err));
    }
  }
);

const initialState = {
  list: [],
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  updating: false,
};

const upsertOrderInList = (state, updated) => {
  const i = state.list.findIndex((o) => o._id === updated._id);
  if (i >= 0) state.list[i] = updated;
  else state.list.unshift(updated);
};

const adminOrdersSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.orders || [];
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 10;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load orders";
      })

      // update status
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        upsertOrderInList(state, action.payload);
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update status";
      })

      // update tracking
      .addCase(updateAdminOrderTracking.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateAdminOrderTracking.fulfilled, (state, action) => {
        state.updating = false;
        upsertOrderInList(state, action.payload);
      })
      .addCase(updateAdminOrderTracking.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update tracking";
      })

      // update payment
      .addCase(updateAdminOrderPayment.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateAdminOrderPayment.fulfilled, (state, action) => {
        state.updating = false;
        upsertOrderInList(state, action.payload);
      })
      .addCase(updateAdminOrderPayment.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update payment";
      });
  },
});

export default adminOrdersSlice.reducer;
