// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import { adminProductsApi } from "./features/adminProducts/adminProductsApi";
import productReducer from "./redux/productSlice";
import categoryReducer from "./redux/categorySlice";
import adminOrderReducer from "./redux/adminOrderSlice";
// import other reducers (UI/auth/etc) if you have them
// import uiReducer from "./features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    //  this key MUST be [adminProductsApi.reducerPath]
    [adminProductsApi.reducerPath]: adminProductsApi.reducer,
     products: productReducer,
    category: categoryReducer,
    adminOrders: adminOrderReducer,


    // other slices here
    // ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // leave serializableCheck on unless you know you need it off
      // serializableCheck: false,
    }).concat(adminProductsApi.middleware),
  // devTools: true, // optional
});
