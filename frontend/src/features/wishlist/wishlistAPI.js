// src/features/wishlist/wishlistAPI.js
import axios from "axios";

// Adjust if your backend URL is different:
const api = axios.create({
  baseURL: "http://localhost:4000/api/wishlist",
  withCredentials: true, // send auth cookie
});


export const getWishlistAPI = async () => {
  const { data } = await api.get("/");
  return data; // expect array
};


// payload: { productId, variantId?, size?, color? }
export const addToWishlistAPI = async (payload) => {
  const { data } = await api.post("/", payload);
  return data; // {item} or the updated list (handle both in slice)
};






export const removeFromWishlistAPI = async (productId) => {
  const { data } = await api.delete(`/${productId}`);
  return data; // usually {success:true}
};
