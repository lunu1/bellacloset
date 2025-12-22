// src/pages/ProductShowcase/ProductCard.jsx
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../features/wishlist/wishlistSlice";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { brandLabel } from "../../utils/brandLabel";

import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { nav } from "framer-motion/client";

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
  const { authLoading, isLoggedin } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const wishlistItems = useSelector((s) => s.wishlist.items);

  // --- Wishlist ---
  const isWishlisted = wishlistItems.some((w) => {
    const id =
      typeof w.product === "object" && w.product?._id
        ? w.product._id
        : w.product || w.productId;
    return String(id) === String(product._id);
  });

  const toggleWishlist = (e) => {
    e.preventDefault();

    if (authLoading) {
      toast.info("Checking your session...")
      return
    }

    if(!isLoggedin) {
      toast.info("Please login to add items to wishlist");
      return navigate("/login", {state: { from: location.pathname + location.search }})
    }
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

  // --- Images (variant-first) ---
  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const firstVariant = hasVariants ? variants[0] : null;

  const primaryImg = hasVariants ? firstVariant?.images?.[0] : product?.images?.[0];
  const hoverImg = hasVariants
    ? firstVariant?.images?.[1] || firstVariant?.images?.[0]
    : product?.images?.[1] || product?.images?.[0];

  // --- OFFER-AWARE PRICING (this is the important part) ---
  // Original (before offer) and Current (after offer)
  const original = hasVariants
    ? Number(firstVariant?.price ?? 0)
    : Number(product?.pricing?.basePrice ?? product?.defaultPrice ?? 0);

  const current = hasVariants
    ? Number(firstVariant?.salePrice ?? firstVariant?.price ?? 0)
    : Number(
        product?.pricing?.salePrice ??
          product?.salePrice ?? // legacy fallback
          product?.defaultPrice ??
          0
      );

  const showStrike = original > 0 && current < original;
  const percent = showStrike
    ? Math.round(((original - current) / original) * 100)
    : 0;

  const stock = hasVariants ? (firstVariant?.stock ?? 0) : (product?.defaultStock ?? 0);
  const label = brandLabel(product);

  return (
    <article className="group relative border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      <Link to={`/product/${product._id}`} className="block relative">
        {/* Image */}
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

        {/* Discount badge (from offer-aware prices) */}
        {percent > 0 && (
          <span className="absolute top-3 left-3 text-[11px] tracking-wide px-2 py-1 rounded-full bg-black text-white">
            -{percent}%
          </span>
        )}

        {/* Wishlist */}
        <button
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={toggleWishlist}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center  hover:bg-white transition"
        >
          <span className="text-[#D2C09E] text-xl ">{isWishlisted ? <FaHeart className="text-[#D2C09E] " /> : <FaRegHeart />}</span>
        </button>
      </Link>

      {/* Body */}
      <Link to={`/product/${product._id}`} className="block p-3">
        <h3 className="text-sm font-thin text-black line-clamp-1">{product.name}</h3>
        {label && <p className="text-xs text-gray-500 mt-0.5">{label}</p>}

        {/* Price row (offer-aware) */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-thin text-black">{formatAED(current)}</span>
          {showStrike && (
            <span className="text-xs text-gray-500 line-through">{formatAED(original)}</span>
          )}
        </div>

        {/* Optional: show which offer applied */}
        {product?.appliedOffer?.name && (
          <div className="mt-1 text-[11px] text-rose-600">
            {product.appliedOffer.name}
          </div>
        )}

        {/* Stock pill */}
        <div className="mt-2  ">
          {stock > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] border border-gray-300 rounded-md text-white bg-[#D0BC98] uppercase">
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
    images: PropTypes.arrayOf(PropTypes.string),
    defaultPrice: PropTypes.number,
    compareAtPrice: PropTypes.number,
    defaultStock: PropTypes.number,
    pricing: PropTypes.shape({
      basePrice: PropTypes.number,
      salePrice: PropTypes.number,
      discount: PropTypes.number,
    }),
    appliedOffer: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number,
      salePrice: PropTypes.number, 
      stock: PropTypes.number,
      images: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};
