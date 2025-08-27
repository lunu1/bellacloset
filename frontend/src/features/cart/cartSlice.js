// src/features/cart/cartSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addToCartAPI,
  removeFromCartAPI,
  fetchCartAPI,
  clearCartAPI,
  updateQuantityAPI,
} from "./cartAPI";

// Thunks (unchanged signatures)
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
      const data = await addToCartAPI({ productId, variantId, quantity });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const removeFromCartServer = createAsyncThunk(
  "cart/removeServer",
  async ({ lineId, productId, variantId, quantity }, { rejectWithValue }) => {
    try {
      const data = await removeFromCartAPI({ lineId, productId, variantId, quantity });
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
      const data = await updateQuantityAPI({ productId, variantId, quantity });
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

// Normalize server payload that looks like { items: [ { lineId, productId, variantId, quantity, product, variant, unitPrice, unavailable, reason, ... } ], totals }
const normalize = (payload) => {
  const list = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
  return list.map((i) => {
    const productId = i.productId ?? (i.product?._id ?? i.product) ?? "";
    const variantId = i.variantId ?? (i.variant?._id ?? i.variant ?? null);
    const product = i.product
      ? { _id: i.product._id, name: i.product.name, images: i.product.images ?? [] }
      : null;

    return {
      lineId: i.lineId ? String(i.lineId) : undefined,
      productId: productId ? String(productId) : "",
      variantId: variantId ? String(variantId) : null,
      quantity: i.quantity ?? 1,
      unitPrice: Number(i.unitPrice ?? 0),
      unavailable: !!i.unavailable,
      reason: i.reason ?? null,
      product,
      // keep raw for UI if you want
      variant: i.variant || null,
    };
  });
};

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const fulfill = (s, a) => { s.loading = false; s.items = normalize(a.payload); };
    const reject  = (s, a) => { s.loading = false; s.error = a.payload || a.error?.message; };

    builder
      .addCase(loadCart.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loadCart.fulfilled, fulfill)
      .addCase(loadCart.rejected, reject)

      .addCase(addToCartServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addToCartServer.fulfilled, fulfill)
      .addCase(addToCartServer.rejected, reject)

      .addCase(updateQuantityServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateQuantityServer.fulfilled, fulfill)
      .addCase(updateQuantityServer.rejected, reject)

      .addCase(removeFromCartServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(removeFromCartServer.fulfilled, fulfill)
      .addCase(removeFromCartServer.rejected, reject)

      .addCase(clearCartServer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(clearCartServer.fulfilled, (s) => { s.loading = false; s.items = []; })
      .addCase(clearCartServer.rejected, reject);
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
