import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from '../features/category/categorySlice';
import productReducer from "../features/product/productSlice";
import wishlistReducer from '../features/wishlist/wishlistSlice';
import cartReducer from '../features/cart/cartSlice';
import searchReducer from '../features/search/searchSlice';


export const store = configureStore({
  reducer: {
    category: categoryReducer,
     products: productReducer,
     wishlist: wishlistReducer, 
     cart : cartReducer, 
     search : searchReducer,
  },
});
