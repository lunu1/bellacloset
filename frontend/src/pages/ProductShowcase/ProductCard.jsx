// src/pages/ProductShowcase/ProductCard.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../features/wishlist/wishlistSlice";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { brandLabel } from "../../utils/brandLabel";

const formatAED = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }).format(n)
    : null;

export default function ProductCard({ product, variants = [] }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((s) => s.wishlist.items);

  // Normalize wishlist comparison to string ids
  const isWishlisted = wishlistItems.some((w) => {
    const id =
      typeof w.product === "object" && w.product?._id
        ? w.product._id
        : w.product || w.productId;
    return String(id) === String(product._id);
  });

  const toggleWishlist = (e) => {
    e.preventDefault();
    const action = isWishlisted
      ? removeFromWishlist({ productId: product._id })
      : addToWishlist({ productId: product._id });

    dispatch(action)
      .unwrap()
      .then(() =>
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
      )
      .catch((err) => {
        if (err === "Already in wishlist") toast.info("Already in wishlist");
        else toast.error(err || "Failed to update wishlist");
      });
  };

  // Variant-first display
  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const firstVariant = hasVariants ? variants[0] : null;

  const primaryImg = hasVariants ? firstVariant?.images?.[0] : product?.images?.[0];
  const hoverImg = hasVariants
    ? firstVariant?.images?.[1] || firstVariant?.images?.[0]
    : product?.images?.[1] || product?.images?.[0];

  const price = hasVariants ? firstVariant?.price : product?.defaultPrice ?? null;
  const compareAtPrice = hasVariants
    ? firstVariant?.compareAtPrice
    : product?.compareAtPrice ?? null;
  const stock = hasVariants ? firstVariant?.stock : product?.defaultStock ?? 0;

  const hasPrice = typeof price === "number" && !Number.isNaN(price);
  const hasCompare = typeof compareAtPrice === "number" && !Number.isNaN(compareAtPrice);
  const showDiscount = hasPrice && hasCompare && compareAtPrice > price;
  const discount = showDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const label = brandLabel(product); // safely renders string for string/object brand

  return (
    <article className="group relative border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="relative overflow-hidden">
          <img
            src={primaryImg || "/placeholder.jpg"}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {hoverImg && (
            <img
              src={hoverImg}
              alt=""
              className="w-full aspect-square object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
            />
          )}
        </div>

        {/* Badges */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 text-[11px] tracking-wide px-2 py-1 rounded-full bg-black text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist */}
        <button
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={toggleWishlist}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center border border-gray-300 hover:bg-white transition"
        >
          <span className="text-black">{isWishlisted ? <FaHeart /> : <FaRegHeart />}</span>
        </button>
      </Link>

      {/* Body */}
      <Link to={`/product/${product._id}`} className="block p-3">
        <h3 className="text-sm font-semibold text-black line-clamp-1">{product.name}</h3>
        {label && <p className="text-xs text-gray-500 mt-0.5">{label}</p>}

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-2">
          {showDiscount ? (
            <>
              <span className="text-xs text-gray-500 line-through">{formatAED(compareAtPrice)}</span>
              <span className="text-sm font-semibold text-black">{formatAED(price)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-black">
              {hasPrice ? formatAED(price) : "—"}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="mt-2">
          {stock > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] border border-gray-300 rounded-full text-gray-700">
              In stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-gray-900 text-white rounded-full">
              Sold out
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    brand: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        slug: PropTypes.string,
      }),
    ]),
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
