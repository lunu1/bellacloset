import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addToCartAPI, removeFromCartAPI, fetchCartAPI, clearCartAPI, updateQuantityAPI } from "./cartAPI";

// ========== Thunks ==========
export const loadCart = createAsyncThunk("cart/load", async (_arg, { rejectWithValue }) => {
  try {
    const data = await fetchCartAPI();
    return data;
  } catch (e) {
    return rejectWithValue(e?.response?.data || e.message);
  }
});

export const addToCartServer = createAsyncThunk(
  "cart/addServer",
  async ({ productId, variantId, quantity }, { rejectWithValue }) => {
    try {
      const data = await addToCartAPI({  productId, variantId, quantity });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const removeFromCartServer = createAsyncThunk(
  "cart/removeServer",
  async ({  productId, variantId,quantity }, { rejectWithValue }) => {
    try {
      const data = await removeFromCartAPI({ productId, variantId ,quantity});
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);


export const updateQuantityServer = createAsyncThunk(
  "cart/updateQty",
  async ({ productId, variantId, quantity }, { rejectWithValue }) => {
    try {
      const data = await updateQuantityAPI({  productId, variantId, quantity });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const clearCartServer = createAsyncThunk(
  "cart/clearServer",
  async (_arg, { rejectWithValue }) => {
    try {
      await clearCartAPI();
      return true;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);

// ========== Helpers ==========
const normalize = (cart) => {
  // expects: { items: [{ product, variant, quantity }, ...] }
  const items = (cart?.items || []).map((i) => ({
    productId: String(i.product?._id || i.product),
    variantId: i.variant ? String(i.variant?._id || i.variant) : null,
    quantity: i.quantity || 1,
  }));
  return items;
};

// ========== Slice ==========
const initialState = {
  items: [],         // Each item: { productId, variantId, quantity }
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // If you need guest cart, you can re-add local reducers here.
    // For server-only cart, we keep just a client-side clear:
    clearCart(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load
    builder
      .addCase(loadCart.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loadCart.fulfilled, (s, a) => { s.loading = false; s.items = normalize(a.payload); })
      .addCase(loadCart.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; });

    // Add
    builder
      .addCase(addToCartServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addToCartServer.fulfilled, (s, a) => { s.loading = false; s.items = normalize(a.payload); })
      .addCase(addToCartServer.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; });

// Update Quantity
   builder
  .addCase(updateQuantityServer.pending,  (s) => { s.loading = true; s.error = null; })
  .addCase(updateQuantityServer.fulfilled,(s,a)=> { s.loading = false; s.items = normalize(a.payload); })
  .addCase(updateQuantityServer.rejected, (s,a)=> { s.loading = false; s.error = a.payload || a.error.message; });

    // Remove
    builder
      .addCase(removeFromCartServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(removeFromCartServer.fulfilled, (s, a) => { s.loading = false; s.items = normalize(a.payload); })
      .addCase(removeFromCartServer.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; });

    // Clear
    builder
      .addCase(clearCartServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(clearCartServer.fulfilled, (s) => { s.loading = false; s.items = []; })
      .addCase(clearCartServer.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; });
  },
});

export const { clearCart } = cartSlice.actions; // client-only clear (e.g., on logout visual reset)
export default cartSlice.reducer;
