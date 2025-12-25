import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminFeatures,
  createAdminFeature,
  updateAdminFeature,
  deleteAdminFeature,
} from "../../api/featureApi";

export const fetchFeaturesAdminAsync = createAsyncThunk(
  "features/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAdminFeatures();
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

export const createFeatureAdminAsync = createAsyncThunk(
  "features/createAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      return await createAdminFeature(payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

export const updateFeatureAdminAsync = createAsyncThunk(
  "features/updateAdmin",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateAdminFeature({ id, payload });
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

export const deleteFeatureAdminAsync = createAsyncThunk(
  "features/deleteAdmin",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminFeature(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

const featureSlice = createSlice({
  name: "features",
  initialState: {
    adminItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchFeaturesAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturesAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminItems = action.payload || [];
      })
      .addCase(fetchFeaturesAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch features";
      })

      // create
      .addCase(createFeatureAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeatureAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminItems.unshift(action.payload);
      })
      .addCase(createFeatureAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create feature";
      })

      // update
      .addCase(updateFeatureAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeatureAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.adminItems = state.adminItems.map((it) =>
          it._id === updated._id ? updated : it
        );
      })
      .addCase(updateFeatureAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update feature";
      })

      // delete
      .addCase(deleteFeatureAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFeatureAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.adminItems = state.adminItems.filter((it) => it._id !== action.payload);
      })
      .addCase(deleteFeatureAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete feature";
      });
  },
});

export default featureSlice.reducer;
