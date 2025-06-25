import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductCard = ({ product, variants }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isWishlisted = wishlistItems.some(
    (item) => item.product._id === product._id
  );

  const toggleWishlist = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the wishlist icon
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow hover:shadow-lg transition duration-300">
      {/* Wishlist Icon */}
      <button
        className="absolute top-3 right-3 z-10 text-red-500 bg-white p-2 rounded-full shadow-md hover:scale-110 transition"
        onClick={toggleWishlist}
      >
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <p className="text-sm mt-1 text-gray-600">
            {product.description?.slice(0, 70)}...
          </p>
          <p className="mt-2 text-green-600 font-bold">
            {variants?.[0]?.price ? `₹${variants[0].price}` : 'Price not available'}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string,
    description: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    slug: PropTypes.string,
  }).isRequired,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number,
    })
  ).isRequired,
};
