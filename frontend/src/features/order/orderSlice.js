import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { placeOrderAPI, getUserOrdersAPI, cancelOrderAPI, getOrderByIdAPI } from './orderAPI';

export const placeOrder = createAsyncThunk('order/placeOrder', async (orderData, thunkAPI) => {
  try { return await placeOrderAPI(orderData); }
  catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message || 'Order placement failed'); }
});

export const getUserOrders = createAsyncThunk('order/getUserOrders', async (_, thunkAPI) => {
  try { return await getUserOrdersAPI(); }
  catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch orders'); }
});

export const getOrderById = createAsyncThunk('order/getOne', async (orderId, thunkAPI) => {
  try { return await getOrderByIdAPI(orderId); }
  catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch order'); }
});

export const cancelOrder = createAsyncThunk('order/cancelOrder', async (orderId, thunkAPI) => {
  try { return await cancelOrderAPI(orderId); }
  catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to cancel order'); }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    loading: false,
    error: null,
    current: null,
    currentLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // place
      .addCase(placeOrder.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(placeOrder.fulfilled, (s) => { s.loading = false; })
      .addCase(placeOrder.rejected, (s,a) => { s.loading = false; s.error = a.payload; })

      // list
      .addCase(getUserOrders.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(getUserOrders.fulfilled, (s,a) => { s.loading = false; s.orders = a.payload || []; })
      .addCase(getUserOrders.rejected, (s,a) => { s.loading = false; s.error = a.payload; })

      // get one
      .addCase(getOrderById.pending, (s) => { s.currentLoading = true; s.error = null; s.current = null; })
      .addCase(getOrderById.fulfilled, (s,a) => { s.currentLoading = false; s.current = a.payload; })
      .addCase(getOrderById.rejected, (s,a) => { s.currentLoading = false; s.error = a.payload; })

      // cancel (update both list and current if open)
      .addCase(cancelOrder.fulfilled, (s, a) => {
        const updated = a.payload;
        s.orders = s.orders.map(o => (o._id === updated._id ? updated : o));
        if (s.current && s.current._id === updated._id) s.current = updated;
      })
      .addCase(cancelOrder.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export default orderSlice.reducer;
