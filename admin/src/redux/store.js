import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import categoryReducer from "./categorySlice";
import adminOrderReducer from "./adminOrderSlice";

const store = configureStore({
  reducer: {
    products: productReducer,
    category: categoryReducer,
    adminOrders: adminOrderReducer,
  },
});

export default store;
