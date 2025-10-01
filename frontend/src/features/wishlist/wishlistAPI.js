// src/features/wishlist/wishlistAPI.js (or wherever this lives)
import axios from "axios";

// Build API base from envs; falls back to production host.
const RAW =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  "https://bellaluxurycloset.com";

const BASE = RAW.replace(/\/+$/, "");                // strip trailing slash(es)
const API_BASE = /\/api$/i.test(BASE) ? BASE : `${BASE}/api`; // ensure /api

export const wishlist = axios.create({
  baseURL: `${API_BASE}/wishlist`,
  withCredentials: true,
});

export const notify = axios.create({
  baseURL: `${API_BASE}/notify`,
  withCredentials: true,
});


// import axios from "axios";

// const wishlist = axios.create({
//   baseURL: "https://bellaluxurycloset.com/api/wishlist",
//   withCredentials: true,
// });

// const notify = axios.create({
//   baseURL: "https://bellaluxurycloset.com/api/notify",
//   withCredentials: true,
// });

// export const getWishlistAPI = async () => {
//   const { data } = await wishlist.get("/");
//   return data; // [{ wishlistId, productId, status, stock, product }]
// };

// src/features/wishlist/wishlistAPI.js
export const getWishlistAPI = async () => {
  const { data } = await wishlist.get("/", {
    params: { _ts: Date.now() },         // cache-buster (optional but safe)
    headers: { "Cache-Control": "no-cache" },
  });
  return data;
};


export const addToWishlistAPI = async ({ productId, variantId = null }) => {
  const { data } = await wishlist.post("/", { productId, variantId });
  return data; // { item }
};

export const removeFromWishlistAPI = async ({ productId, wishlistId }) => {
  // prefer wishlistId; fallback to productId path
  if (wishlistId) {
    const { data } = await wishlist.delete(`/${productId || "dummy"}`, { data: { wishlistId } });
    return data;
  } else {
    const { data } = await wishlist.delete(`/${productId}`);
    return data;
  }
};

export const subscribeBackInStockAPI = async ({ productId, email }) => {
  const { data } = await notify.post("/subscribe", { productId, email });
  return data;
};
