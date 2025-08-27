// src/features/variants/variantSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchVariantByProduct } from "./variantAPI";

export const getVariantsByProduct = createAsyncThunk(
  "variants/fetchByProduct",
  async (productId, thunkAPI) => {
    // forward abort signal if your API supports it
    const res = await fetchVariantByProduct(productId, thunkAPI.signal);
    return res;
  }
);

const normalizeArray = (payload) =>
  Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : [];

const variantSlice = createSlice({
  name: "variants",
  initialState: {
    items: [],
    selectedVariant: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedVariant: (state, action) => {
      state.selectedVariant = action.payload;
    },
    // 👇 use this before fetching new product's variants
    clearVariants: (state) => {
      state.items = [];
      state.selectedVariant = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVariantsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVariantsByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeArray(action.payload);
      })
      .addCase(getVariantsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load variants";
      });
  },
});

export const { setSelectedVariant, clearVariants } = variantSlice.actions;
export default variantSlice.reducer;
