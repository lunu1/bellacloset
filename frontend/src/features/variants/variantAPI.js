// import axios from 'axios'


// export const fetchVariantByProduct = async (productId) => {
//     const res = await axios.get(`https://bellaluxurycloset.com/api/variants/by-product/${productId}`)
//     return res.data
// }


// src/features/variants/variantAPI.js  (or wherever your thunk calls)
import axios from "axios";

export const fetchVariantByProduct = async (productId) => {
  const res = await axios.get(
    `https://bellaluxurycloset.com/api/variants/by-product/${productId}`,
    {
      validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
    }
  );

  // ✅ backend 404 means "no variants" -> return []
  if (res.status === 404) return [];

  return Array.isArray(res.data) ? res.data : [];
};
