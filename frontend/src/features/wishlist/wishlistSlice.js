import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getWishlistAPI,addToWishlistAPI, removeFromWishlistAPI } from "./wishlistAPI"; 
import { toast } from "react-toastify";

// Async function to fetch wishlist
export const getWishlist = createAsyncThunk('wishlist/fetch', async () => {
    const response = await getWishlistAPI();
    return response.data;
});

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await addToWishlistAPI(productId);
      toast.success("Added to wishlist");
      return response.data;
    } catch (err) {
      // If product already exists
      if (err.response?.data?.message === "Product already in wishlist.") {
        toast.info("Already in wishlist");
        return rejectWithValue("Already in wishlist");
      }
      toast.error("Failed to add to wishlist");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId) => {
 await removeFromWishlistAPI(productId);
    return productId;
});

// Redux "State Handler"
const wishlistSlice = createSlice({
    name : "wishlist",
    initialState : {
        items: [], // This will hold the list of wishlist items
        loading: false,
        error: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers :{},
    extraReducers: (builder) => {
        builder
            .addCase(getWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.status = 'succeeded';
            })
            .addCase(getWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.status = 'failed';
            })
            .addCase(addToWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(addToWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(removeFromWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.loading = false;
                const productId = action.payload;
                state.items = state.items.filter(item => item.product._id !== productId)
            })
            .addCase(removeFromWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default wishlistSlice.reducer;