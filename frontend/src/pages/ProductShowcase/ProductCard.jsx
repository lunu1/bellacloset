import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isWishlisted = wishlistItems.some(
    (item) => item.product._id === product._id
  );

  const toggleWishlist = (e) => {
    e.preventDefault(); // Prevent navigation
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  // Fallback logic for price
  const displayPrice = product.defaultPrice ?? null;

  return (
    <div className="relative bg-white shadow hover:shadow-lg transition duration-300">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
      </Link>

      <Link to={`/product/${product._id}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 font-sans">
              {product.name}
            </h2>
            <button
              className="text-black hover:scale-110 transition"
              onClick={toggleWishlist}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <p className="text-sm mt-1 text-gray-600 font-semibold">
            {product.description?.slice(0, 70)}...
          </p>
          <p className="mt-2 text-green-600 font-bold">
            {displayPrice ? `AED ${displayPrice}` : 'Price not available'}
          </p>
        </div>
      </Link>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string,
    description: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    slug: PropTypes.string,
    defaultPrice: PropTypes.number,
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        price: PropTypes.number,
      })
    ),
  }).isRequired,
};

export default ProductCard;
