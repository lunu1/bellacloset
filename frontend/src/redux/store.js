import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from '../features/category/categorySlice';
import productReducer from "../features/product/productSlice";
import wishlistReducer from '../features/wishlist/wishlistSlice';
import cartReducer from '../features/cart/cartSlice';
import searchReducer from '../features/search/searchSlice';
import variantReducer from '../features/variants/variantSlice';
import orderReducer from '../features/order/orderSlice';
import settingReducer from '../features/settings/settingSlice';
import notifyReducer from "../features/notify/notifySlice";
import reviewsReducer from '../features/reviews/reviewsSlice';



export const store = configureStore({
  reducer: {
    category: categoryReducer,
     products: productReducer,
     wishlist: wishlistReducer, 
     cart : cartReducer, 
     search : searchReducer,
     variants : variantReducer,
     order: orderReducer,
     settings: settingReducer,
     notify: notifyReducer,
     reviews: reviewsReducer,
  },
});
