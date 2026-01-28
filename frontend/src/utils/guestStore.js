const CART_KEY = "guest_cart";
const WISH_KEY = "guest_wishlist";

export const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
};

export const setGuestCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
};

export const getGuestWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); }
  catch { return []; }
};

export const setGuestWishlist = (list) => {
  const normalized = (Array.isArray(list) ? list : []).map((x) => {
    if (typeof x === "string") return { productId: x, variantId: null };
    return { productId: x.productId, variantId: x.variantId ?? null };
  });
  localStorage.setItem(WISH_KEY, JSON.stringify(normalized));
};

export const clearGuestCart = () => localStorage.removeItem(CART_KEY);
export const clearGuestWishlist = () => localStorage.removeItem(WISH_KEY);

// optional helper
export const clearGuest = () => {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(WISH_KEY);
};
