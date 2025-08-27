import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchReviewsByProduct, createReview } from "./reviewAPI";

export const getReviewsByProduct = createAsyncThunk(
  "reviews/fetchByProduct",
  async ({ productId, page = 1, limit = 10, sort = "newest", append = false }, thunkAPI) => {
    const res = await fetchReviewsByProduct(productId, { page, limit, sort }, thunkAPI.signal);
    return { ...res, productId, page, limit, sort, append };
  }
);

export const addReview = createAsyncThunk(
  "reviews/add",
  async (payload, thunkAPI) => {
    const res = await createReview(payload, thunkAPI.signal);
    return res; // review; may include { summary }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    productId: null,
    items: [],
    loading: false,
    error: null,
    posting: false,
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    sort: "newest",
    summary: null, // { avgRating, reviewCount, countsByStar }
  },
  reducers: {
    clearReviews: (s) => {
      s.productId = null;
      s.items = [];
      s.loading = false;
      s.error = null;
      s.posting = false;
      s.page = 1;
      s.pages = 1;
      s.total = 0;
      s.summary = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(getReviewsByProduct.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(getReviewsByProduct.fulfilled, (s, a) => {
      s.loading = false;
      const { items, total, page, pages, sort, productId, append, summary, limit } = a.payload;
      s.productId = productId;
      s.page = page;
      s.pages = pages;
      s.total = total;
      s.sort = sort;
      s.limit = limit ?? s.limit;
      s.summary = summary ?? s.summary;

      if (append && productId === s.productId && sort === s.sort) {
        // append, avoiding duplicates by _id
        const existing = new Set(s.items.map((r) => String(r._id || r.id)));
        s.items = [...s.items, ...items.filter((r) => !existing.has(String(r._id || r.id)))];
      } else {
        s.items = items || [];
      }
    });
    b.addCase(getReviewsByProduct.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error?.message || "Failed to load reviews";
    });

    b.addCase(addReview.pending, (s) => { s.posting = true; });
    b.addCase(addReview.fulfilled, (s, a) => {
      s.posting = false;
      if (a.payload) {
        const review = a.payload;
        s.items.unshift(review);
        if (review.summary) s.summary = review.summary; // sync stats if backend returned
        // best-effort counters if no summary returned:
        if (!review.summary) {
          s.total += 1;
          if (s.summary) {
            s.summary.reviewCount = (s.summary.reviewCount || 0) + 1;
            const star = Number(review.rating) || 0;
            if (star >= 1 && star <= 5) {
              s.summary.countsByStar = { ...(s.summary.countsByStar || {}), [star]: (s.summary.countsByStar?.[star] || 0) + 1 };
            }
          }
        }
      }
    });
    b.addCase(addReview.rejected, (s, a) => {
      s.posting = false;
      s.error = a.error?.message || "Failed to add review";
    });
  },
});

export const { clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
