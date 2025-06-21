import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './categorySlice';
import productReducer from "../features/product/productSlice";


export const store = configureStore({
  reducer: {
    category: categoryReducer,
     product: productReducer,
  },
});
