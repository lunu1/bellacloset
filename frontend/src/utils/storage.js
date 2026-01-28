const safeJSONParse = (val, fallback) => {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const storage = {
  get(key, fallback) {
    return safeJSONParse(localStorage.getItem(key), fallback);
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

export const GUEST_CART_KEY = "guest_cart_v1";
export const GUEST_WISHLIST_KEY = "guest_wishlist_v1";
