// src/features/wishlist/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWishlistAPI,
  addToWishlistAPI,
  removeFromWishlistAPI,
  subscribeBackInStockAPI,
} from "./wishlistAPI";

/**
 * Utils
 */
const idEq = (a, b) => String(a ?? "") === String(b ?? "");

/**
 * Thunks
 */
export const getWishlist = createAsyncThunk("wishlist/fetch", async () => {
  // Expecting an array of items; each item may include:
  // { wishlistId, productId, variantId?, product, variant?, status, stock, ... }
  return await getWishlistAPI();
});

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (payload, { rejectWithValue }) => {
    try {
      // Accepts: "productId" OR { productId, variantId }
      const body =
        typeof payload === "string"
          ? { productId: payload, variantId: null }
          : {
              productId: payload.productId,
              variantId: payload?.variantId ?? null,
            };

      const data = await addToWishlistAPI(body);
      // Server should return: { item: {...} }
      return data.item;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "Product already in wishlist.") {
        return rejectWithValue("Already in wishlist");
      }
      return rejectWithValue(msg || err.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  // Accepts either { wishlistId } OR { productId, variantId }
  async ({ wishlistId, productId, variantId = null }) => {
    await removeFromWishlistAPI({ wishlistId, productId, variantId });
    return { wishlistId, productId, variantId };
  }
);

export const subscribeBackInStock = createAsyncThunk(
  "wishlist/notify",
  async ({ productId, email }) => {
    return await subscribeBackInStockAPI({ productId, email });
  }
);

/**
 * Slice
 */
const initialState = {
  items: [],        // array of wishlist rows
  loading: false,
  error: null,
  status: "idle",
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
 reducers: {
  clearWishlist(state) {
    state.items = [];
    state.loading = false;
    state.error = null;
    state.status = "idle";
  },

  // ✅ load guest wishlist into redux
  setGuestWishlistState(state, action) {
    // we store guest wishlist as array of { productId, variantId } OR array of ids
    const raw = Array.isArray(action.payload) ? action.payload : [];

    // normalize to wishlist items
    state.items = raw.map((x) => {
      // allow both formats:
      // 1) { productId, variantId }
      // 2) string -> treat as productId
      if (typeof x === "string") {
        return { wishlistId: `guest_${x}`, productId: x, variantId: null };
      }
      return {
        wishlistId: x.wishlistId || `guest_${x.productId}_${x.variantId ?? "null"}`,
        productId: x.productId,
        variantId: x.variantId ?? null,
        product: x.product ?? null,
        variant: x.variant ?? null,
      };
    });

    state.loading = false;
    state.error = null;
    state.status = "succeeded";
  },

  // ✅ guest add
 addToWishlistGuest(state, action) {
  const { productId, variantId = null } = action.payload || {};
  const pid = String(productId || "");
  const vid = variantId ? String(variantId) : null;

  const exists = state.items.some(
    (it) => String(it.productId) === pid && String(it.variantId ?? null) === String(vid ?? null)
  );
  if (exists) return;

  state.items.unshift({
    wishlistId: `guest_${pid}_${vid ?? "null"}`, // ✅ stable
    productId: pid,
    variantId: vid,
    product: null,
    variant: null,
  });
},


  // ✅ guest remove
  removeFromWishlistGuest(state, action) {
    const { productId, variantId = null, wishlistId } = action.payload || {};

    if (wishlistId) {
      state.items = state.items.filter((it) => String(it.wishlistId) !== String(wishlistId));
      return;
    }

    const pid = String(productId || "");
    const vid = variantId ? String(variantId) : null;

    state.items = state.items.filter(
      (it) => !(String(it.productId) === pid && String(it.variantId ?? null) === String(vid ?? null))
    );
  },
},

  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const arr = Array.isArray(action.payload) ? action.payload : [];
        // Normalize: make sure every item has a variantId key (can be null)
        state.items = arr.map((it) => ({
          ...it,
          variantId: it?.variantId ?? null,
        }));
        state.status = "succeeded";
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load wishlist";
        state.status = "failed";
      })

      // ADD
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload || {};
        const pid = item.productId;
        const vid = item.variantId ?? null;

        // de-dupe by (productId, variantId)
        const exists = state.items.some(
          (x) => idEq(x.productId, pid) && idEq(x.variantId ?? null, vid)
        );

        if (!exists) {
          state.items.unshift({
            ...item,
            variantId: vid, // ensure key exists
          });
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to add to wishlist";
      })

      // REMOVE
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { wishlistId, productId, variantId = null } = action.payload || {};

        state.items = state.items.filter((it) => {
          // If we have a wishlistId, prefer that (exact row removal)
          if (wishlistId) return !idEq(it.wishlistId, wishlistId);

          // Otherwise remove by (productId, variantId)
          const sameProduct = idEq(it.productId, productId);
          const sameVariant = idEq(it.variantId ?? null, variantId ?? null);
          return !(sameProduct && sameVariant);
        });
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to remove from wishlist";
      })

      // NOTIFY (no state change needed)
      .addCase(subscribeBackInStock.fulfilled, () => {});
  },
});

export const {
  clearWishlist,
  setGuestWishlistState,
  addToWishlistGuest,
  removeFromWishlistGuest,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
