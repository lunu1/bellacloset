import axios from "axios";

const wishlist = axios.create({
  baseURL: "http://localhost:4000/api/wishlist",
  withCredentials: true,
});

const notify = axios.create({
  baseURL: "http://localhost:4000/api/notify",
  withCredentials: true,
});

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


export const addToWishlistAPI = async (payload) => {
  const { data } = await wishlist.post("/", payload);
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
