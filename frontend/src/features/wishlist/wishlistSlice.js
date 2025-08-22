// src/features/wishlist/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWishlistAPI,
  addToWishlistAPI,
  removeFromWishlistAPI,
} from "./wishlistAPI";


// Fetch
export const getWishlist = createAsyncThunk("wishlist/fetch", async () => {
  return await getWishlistAPI();
});

// Add (payload can include variant/size/color)
// wishlistSlice.js
export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (payload, { rejectWithValue }) => {
    try {
      const body =
        typeof payload === "string" ? { productId: payload } : payload;
      const data = await addToWishlistAPI(body);
      return data.item || data;
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "Product already in wishlist.") {
        return rejectWithValue("Already in wishlist");
      }
      return rejectWithValue(msg || err.message);
    }
  }
);


// Remove (by productId)
export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId) => {
    await removeFromWishlistAPI(productId);
    return productId;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
    status: "idle",
  },
  reducers: {
    clearWishlist(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(getWishlist.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(getWishlist.fulfilled, (s, a) => {
        s.loading = false;
        s.items = Array.isArray(a.payload) ? a.payload : [];
        s.status = "succeeded";
      })
      .addCase(getWishlist.rejected, (s, a) => {
        s.loading = false; s.error = a.error.message; s.status = "failed";
      })

      // add
      .addCase(addToWishlist.pending, (s) => { s.loading = true; })
      .addCase(addToWishlist.fulfilled, (s, a) => {
        s.loading = false;
        const item = a.payload;

        // If backend returned the full list, replace
        if (Array.isArray(item)) {
          s.items = item;
          return;
        }

        // Otherwise, push single item if not duplicate
        const exists = s.items.some((x) =>
          String(x.product?._id || x.productId) === String(item.product?._id || item.productId) &&
          String(x.variantId || "") === String(item.variantId || "") &&
          String(x.size || "") === String(item.size || "") &&
          String(x.color || "") === String(item.color || "")
        );
        if (!exists) s.items.push(item);
      })
      .addCase(addToWishlist.rejected, (s, a) => {
        s.loading = false; s.error = a.payload || a.error.message;
      })

      // remove
      .addCase(removeFromWishlist.pending, (s) => { s.loading = true; })
      .addCase(removeFromWishlist.fulfilled, (s, a) => {
        s.loading = false;
        const productId = a.payload;
        s.items = s.items.filter(
          (it) => String(it.product?._id || it.product || it.productId) !== String(productId)
        );
      })
      .addCase(removeFromWishlist.rejected, (s, a) => {
        s.loading = false; s.error = a.error.message;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
