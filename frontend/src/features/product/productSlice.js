// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllProducts } from './productAPI';

export const getAllProducts = createAsyncThunk(
  'products/fetchAll',
  async () => await fetchAllProducts()
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
