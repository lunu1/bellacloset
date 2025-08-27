import axios from "axios";

const BASE = "http://localhost:4000/api";

export const fetchReviewsByProduct = async (productId, { page = 1, limit = 10, sort = "newest" } = {}, signal) => {
  const { data } = await axios.get(`${BASE}/reviews/product/${productId}`, {
    params: { page, limit, sort },
    signal,
    withCredentials: true,
  });
  // { items, total, page, pages, summary }
  return data;
};

export const createReview = async ({ productId, rating, comment, variantId }, signal) => {
  const { data } = await axios.post(
    `${BASE}/reviews`,
    { productId, rating, comment, variantId },
    { signal, withCredentials: true }
  );
  // returns created/updated review, possibly with {summary}
  return data;
};
