// src/features/search/searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendUrl = 'http://localhost:4000'; // Update if different

// 👉 Fetch full search results
export const fetchSearchResults = createAsyncThunk(
  'search/fetchSearchResults',
  async (query, thunkAPI) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/products/search?q=${query}`);
      return data.results;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 👉 Fetch live suggestions
export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSearchSuggestions',
  async (query, thunkAPI) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/products/suggestions?q=${query}`);
      return data.suggestions;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    suggestions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.query = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔍 Search Results
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 💡 Live Suggestions
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      .addCase(fetchSearchSuggestions.rejected, (state) => {
        state.suggestions = [];
      });
  },
});

export const { setQuery, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
