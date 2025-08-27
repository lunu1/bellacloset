import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getWishlistAPI, addToWishlistAPI, removeFromWishlistAPI, subscribeBackInStockAPI } from "./wishlistAPI";

export const getWishlist = createAsyncThunk("wishlist/fetch", async () => {
  return await getWishlistAPI();
});

export const addToWishlist = createAsyncThunk("wishlist/add", async (payload, { rejectWithValue }) => {
  try {
    const body = typeof payload === "string" ? { productId: payload } : payload;
    const data = await addToWishlistAPI(body);
    return data.item;
  } catch (err) {
    const msg = err?.response?.data?.message;
    if (msg === "Product already in wishlist.") return rejectWithValue("Already in wishlist");
    return rejectWithValue(msg || err.message);
  }
});

export const removeFromWishlist = createAsyncThunk("wishlist/remove", async ({ productId, wishlistId }) => {
  await removeFromWishlistAPI({ productId, wishlistId });
  return { productId, wishlistId };
});

export const subscribeBackInStock = createAsyncThunk("wishlist/notify", async ({ productId, email }) => {
  return await subscribeBackInStockAPI({ productId, email });
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], loading: false, error: null, status: "idle" },
  reducers: { clearWishlist(s) { s.items = []; s.loading = false; s.error = null; s.status = "idle"; } },
  extraReducers: (b) => {
    b.addCase(getWishlist.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(getWishlist.fulfilled, (s, a) => { s.loading = false; s.items = Array.isArray(a.payload) ? a.payload : []; s.status = "succeeded"; })
     .addCase(getWishlist.rejected, (s, a) => { s.loading = false; s.error = a.error.message; s.status = "failed"; })

     .addCase(addToWishlist.pending, (s) => { s.loading = true; })
     .addCase(addToWishlist.fulfilled, (s, a) => {
       s.loading = false;
       const item = a.payload;
       const exists = s.items.some(x => String(x.productId) === String(item.productId));
       if (!exists) s.items.unshift(item);
     })
     .addCase(addToWishlist.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error.message; })

     .addCase(removeFromWishlist.pending, (s) => { s.loading = true; })
     .addCase(removeFromWishlist.fulfilled, (s, a) => {
       s.loading = false;
       const { productId, wishlistId } = a.payload;
       s.items = s.items.filter(it => (wishlistId ? String(it.wishlistId) !== String(wishlistId) : String(it.productId) !== String(productId)));
     })
     .addCase(removeFromWishlist.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

     .addCase(subscribeBackInStock.fulfilled, () => {}) // no state change needed
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
