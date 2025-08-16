import axios from 'axios';

const API = 'http://localhost:4000/api/wishlist';

// const authHeader = () => ({
//     headers: {
//     Authorization: `Bearer ${localStorage.getItem('token')}`
// }
// });

// ✅ axios will now send cookies automatically
const api = axios.create({
  baseURL: API,
  withCredentials: true, 
});

// Wishlist API calls
export const getWishlistAPI = () => api.get('/');
export const addToWishlistAPI = (productId) => api.post('/', { productId });
export const removeFromWishlistAPI = (productId) => api.delete(`/${productId}`);

