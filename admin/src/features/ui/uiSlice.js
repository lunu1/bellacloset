import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productsList: { page: 1, limit: 10, search: "", sortBy: "createdAt", sortOrder: "desc" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setProductsListState(state, { payload }) {
      state.productsList = { ...state.productsList, ...payload };
    },
  },
});

export const { setProductsListState } = uiSlice.actions;
export default uiSlice.reducer;