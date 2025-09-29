// src/features/products/productAPI.js
import axios from 'axios';

export const fetchAllProducts = async () => {
  const res = await axios.get('https://bellaluxurycloset.com/api/products/all');
  return res.data;
};
