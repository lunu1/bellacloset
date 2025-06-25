import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Each item: { productId, size, color, quantity }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      const existingItem = state.items.find(
        item =>
          item.productId === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ productId, size, color, quantity });
      }
    },

    removeFromCart: (state, action) => {
      const { productId, size, color } = action.payload;
      state.items = state.items.filter(
        item =>
          !(
            item.productId === productId &&
            item.size === size &&
            item.color === color
          )
      );
    },

    updateQuantity: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      const item = state.items.find(
        item =>
          item.productId === productId &&
          item.size === size &&
          item.color === color
      );
      if (item) {
        item.quantity = quantity;
      }
    },

    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
