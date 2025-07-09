import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placeOrderAPI, getUserOrdersAPI, cancelOrderAPI } from './orderAPI';

export const placeOrder = createAsyncThunk('order/placeOrder', async (orderData, thunkAPI) => {
  try {
    return await placeOrderAPI(orderData);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Order placement failed');
  }
});

export const getUserOrders = createAsyncThunk('order/getUserOrders', async (_, thunkAPI) => {
  try {
    return await getUserOrdersAPI();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const cancelOrder = createAsyncThunk('order/cancelOrder', async (orderId, thunkAPI) => {
  try {
    return await cancelOrderAPI(orderId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to cancel order');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      });
  },
});

export default orderSlice.reducer;
