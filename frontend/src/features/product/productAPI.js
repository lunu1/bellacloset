// src/features/products/productAPI.js
import axios from 'axios';

export const fetchAllProducts = async () => {
  const res = await axios.get('http://localhost:4000/api/products/all');
  return res.data;
};
