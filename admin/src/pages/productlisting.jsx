// FRONTEND - src/pages/ProductList.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/products/all');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(({ product, variants }) => (
          <div key={product._id} className="border rounded-lg shadow p-4">
            <img
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h2 className="font-semibold text-lg">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.brand}</p>
            <p className="text-sm">{product.description.slice(0, 100)}...</p>
            <p className="mt-2 text-green-600 font-medium">
              {variants[0]?.price ? `From ₹${variants[0].price}` : 'No price set'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
