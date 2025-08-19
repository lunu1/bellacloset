import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductCard = ({ product, variants = [] }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isWishlisted = wishlistItems.some((item) => item.product._id === product._id);

  const toggleWishlist = (e) => {
  e.preventDefault();
  const action = isWishlisted
    ? removeFromWishlist(product._id)
    : addToWishlist({ productId: product._id });

  dispatch(action)
    .unwrap()
    .then(() => {
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    })
    .catch((err) => {
      if (err === "Already in wishlist") toast.info("Already in wishlist");
      else toast.error(err || "Failed to update wishlist");
    });
};


  // ---- Variant-first display logic ----
  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const firstVariant = hasVariants ? variants[0] : null;

  const image = hasVariants
    ? firstVariant?.images?.[0]
    : product?.images?.[0];

  const price = hasVariants
    ? firstVariant?.price
    : product?.defaultPrice ?? null;

  const compareAtPrice = hasVariants
    ? firstVariant?.compareAtPrice
    : product?.compareAtPrice ?? null;

  const stock = hasVariants
    ? firstVariant?.stock
    : product?.defaultStock ?? 0;

  return (
    <div className="relative bg-white shadow hover:shadow-lg transition duration-300 rounded">
      <Link to={`/product/${product._id}`}>
        <img
          src={image || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-64 object-cover rounded-t"
          loading="lazy"
        />
      </Link>

      <Link to={`/product/${product._id}`}>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-800 font-sans line-clamp-1">
              {product.name}
            </h2>
            <button
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="text-black hover:scale-110 transition"
              onClick={toggleWishlist}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {product.brand && (
            <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>
          )}

          {product.description && (
            <p className="text-sm mt-1 text-gray-600 font-semibold line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="mt-2 flex items-baseline gap-2">
            {compareAtPrice && price && compareAtPrice > price ? (
              <>
                <span className="line-through text-gray-400">AED {compareAtPrice}</span>
                <span className="text-green-600 font-bold">AED {price}</span>
              </>
            ) : (
              <span className="text-green-600 font-bold">
                {price ? `AED ${price}` : 'Price not available'}
              </span>
            )}
          </div>

          <p className={`mt-1 text-xs ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {stock > 0 ? 'In Stock' : 'Out of Stock'}
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
    compareAtPrice: PropTypes.number,
    defaultStock: PropTypes.number,
  }).isRequired,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number,
      compareAtPrice: PropTypes.number,
      stock: PropTypes.number,
      images: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};

export default ProductCard;
