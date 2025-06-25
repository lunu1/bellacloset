import axios from 'axios';

const API = 'http://localhost:4000/api/wishlist';

const authHeader = () => ({
    headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
}
});

export const getWishlistAPI = () => axios.get(API, authHeader())

export const addToWishlistAPI = (productId) =>
axios.post(API,{productId}, authHeader());

export const removeFromWishlistAPI = (productId) =>
axios.delete(`${API}/${productId}`, authHeader());


