// src/features/products/productSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { fetchAllProducts } from './productAPI';

// Normalize to [{ product: {...} }, ...]
const normalizeToWrapped = (arr = []) =>
  arr
    .filter(Boolean)
    .map((item) => (item.product ? item : { product: item }));

export const getAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, thunkAPI) => {
    // pass abort signal if your API supports it
    const res = await fetchAllProducts(thunkAPI.signal);
    return res;
  },
  {
    // Optional: avoid duplicate fetches if already loaded
    condition: (_, { getState }) => {
      const { products } = getState();
      if (products.loading) return false;
      // e.g., skip if already have items
      // return products.items.length === 0;
      return true;
    },
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],        // always [{ product }]
    loading: false,
    error: null,
    lastFetchedAt: null,
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

        // Accept either { items: [...] } or [...]
        const raw = Array.isArray(action.payload?.items)
          ? action.payload.items
          : Array.isArray(action.payload)
          ? action.payload
          : [];

        state.items = normalizeToWrapped(raw);
        state.lastFetchedAt = Date.now();
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load products';
      });
  },
});

export default productSlice.reducer;

/* ---------- Selectors ---------- */
export const selectProductsWrapped = (state) => state.products.items; // [{ product }]
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError   = (state) => state.products.error;

export const selectProductById = createSelector(
  [selectProductsWrapped, (_, id) => id],
  (items, id) => items.find((p) => (p.product?._id ?? p._id) === id) || null
);
