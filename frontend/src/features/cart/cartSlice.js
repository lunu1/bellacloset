import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Each item: { productId, size, color, quantity }
  subtotal: 0,
  total: 0,
  discount: 0, 
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, variantId, size, color, quantity, price, name, thumbnail }  = action.payload;
      const existingItem = state.items.find(
        item =>
          item.productId === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ productId, variantId, size, color, quantity, price, name, thumbnail } );
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
      state.subtotal = 0;
      state.total = 0;
      state.discount = 0;
    },

    computeTotals: (state) => {
  let subtotal = 0;
  state.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  state.subtotal = subtotal;
  state.discount = 0; 
  state.total = subtotal; 
}


      }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, computeTotals } = cartSlice.actions;
export default cartSlice.reducer;
