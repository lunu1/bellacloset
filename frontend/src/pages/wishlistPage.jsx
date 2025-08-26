// src/pages/WishlistPage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { toast } from 'react-toastify';
import { Trash2, ShoppingBag } from 'lucide-react';
import { brandLabel } from '../utils/brandLabel';

const formatAED = (n) =>
  typeof n === 'number' && !Number.isNaN(n)
    ? new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(n)
    : null;

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.wishlist.loading);
  const items = useSelector((state) => state.wishlist.items || []);

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      const msg = error?.message || error?.error || 'Failed to remove item';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Start adding items you love!</p>
          <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(({ product }) => {
            if (!product) return null;

            const imageUrl =
              Array.isArray(product.images) && product.images.length > 0
                ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
                : '/placeholder.jpg';

            const price = typeof product.defaultPrice === 'number' ? product.defaultPrice : null;

            return (
              <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 text-red-500"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                    {product.brand && <p className="text-sm text-gray-600 mb-2">{brandLabel(product)}</p>}
                    {price != null && <p className="text-lg font-bold text-gray-900">{formatAED(price)}</p>}
                  </Link>

                  <Link
                    to={`/product/${product._id}`}
                    className="w-full mt-3 bg-gray-900 text-white py-2 rounded hover:bg-gray-800 inline-block text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded border hover:bg-gray-200 inline-block"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
