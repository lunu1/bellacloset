// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import { adminProductsApi } from "./features/adminProducts/adminProductsApi";
import productReducer from "./redux/productSlice";
import categoryReducer from "./redux/categorySlice";
import adminOrderReducer from "./redux/adminOrderSlice";
import settingsReducer from "./features/settings/settingSlice";

export const store = configureStore({
  reducer: {
    [adminProductsApi.reducerPath]: adminProductsApi.reducer,
    products: productReducer,
    category: categoryReducer,
    adminOrders: adminOrderReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminProductsApi.middleware),
});
