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

  // ✅ sets cart state from guest localStorage (already normalized or close)
  setGuestCartState(state, action) {
  const raw = Array.isArray(action.payload) ? action.payload : [];
  state.items = raw.map((i) => ({
    lineId: i.lineId || `guest_${i.productId}_${i.variantId ?? "null"}`,
    productId: String(i.productId || ""),
    variantId: i.variantId ? String(i.variantId) : null,
    quantity: Number(i.quantity || 1),
    unitPrice: Number(i.unitPrice || 0),
    unavailable: false,
    reason: null,
    product: i.product ?? null,
    variant: i.variant ?? null,
  }));
  state.loading = false;
  state.error = null;
},


  // ✅ guest add (no API)
 // ✅ guest add (no API)
addToCartGuest(state, action) {
  const {
    productId = "",
    variantId = null,
    quantity = 1,
    unitPrice = 0,
    product = null,
    variant = null,
  } = action.payload || {};

  const pid = String(productId || "");
  const vid = variantId ? String(variantId) : null;

  const idx = state.items.findIndex(
    (i) =>
      String(i.productId) === pid &&
      String(i.variantId ?? null) === String(vid ?? null)
  );

  if (idx >= 0) {
    state.items[idx].quantity =
      (state.items[idx].quantity || 1) + Number(quantity || 1);

    // ✅ ensure price stays (don’t overwrite with 0)
    if (Number(unitPrice) > 0) state.items[idx].unitPrice = Number(unitPrice);

    // optional: keep snapshots
    if (product) state.items[idx].product = product;
    if (variant) state.items[idx].variant = variant;
  } else {
    state.items.unshift({
      lineId: `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      productId: pid,
      variantId: vid,
      quantity: Number(quantity || 1),

      // ✅ THIS is the important part
      unitPrice: Number(unitPrice || 0),

      unavailable: false,
      reason: null,

      // ✅ optional snapshots for UI (name/images without extra fetch)
      product: product || null,
      variant: variant || null,
    });
  }
},



  // ✅ guest remove
  removeFromCartGuest(state, action) {
    const { lineId, productId, variantId = null } = action.payload || {};
    if (lineId) {
      state.items = state.items.filter((i) => String(i.lineId) !== String(lineId));
      return;
    }

    const pid = String(productId || "");
    const vid = variantId ? String(variantId) : null;

    state.items = state.items.filter(
      (i) => !(String(i.productId) === pid && String(i.variantId ?? null) === String(vid ?? null))
    );
  },

  // ✅ guest qty update
  updateQuantityGuest(state, action) {
    const { productId, variantId = null, quantity = 1 } = action.payload || {};
    const pid = String(productId || "");
    const vid = variantId ? String(variantId) : null;

    const idx = state.items.findIndex(
      (i) => String(i.productId) === pid && String(i.variantId ?? null) === String(vid ?? null)
    );

    if (idx >= 0) {
      state.items[idx].quantity = Math.max(1, Number(quantity || 1));
    }
  },

  clearCartGuest(state) {
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

export const {
  clearCart,
  setGuestCartState,
  addToCartGuest,
  removeFromCartGuest,
  updateQuantityGuest,
  clearCartGuest,
} = cartSlice.actions;

export default cartSlice.reducer;
