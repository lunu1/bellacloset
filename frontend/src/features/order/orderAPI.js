import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/orders';

// Helper to get token from local storage
const getToken = () => localStorage.getItem('token');

// 1. Place Order
export const placeOrderAPI = async (orderData) => {
  const res = await axios.post(BASE_URL, orderData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
};

// 2. Get User Orders
export const getUserOrdersAPI = async () => {
  const res = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data;
};

// 3. Cancel Order
export const cancelOrderAPI = async (orderId) => {
  const res = await axios.patch(`${BASE_URL}/${orderId}/cancel`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.data.order;
};
