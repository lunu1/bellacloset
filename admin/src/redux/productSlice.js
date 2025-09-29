import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createProduct = createAsyncThunk(
  'products/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post('https://bellaluxurycloset.com/api/products/create', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  extraReducers: builder => {
    builder
      .addCase(createProduct.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  }
});

export default productSlice.reducer;
