// src/pages/WishlistPage.jsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import { toast } from "react-toastify";
import { Trash2, ShoppingBag, RotateCw } from "lucide-react";
import { brandLabel } from "../utils/brandLabel";
import NotifyMeButton from "../components/NotifyMeButton";
import { getVariantsByProduct } from "../features/variants/variantSlice";
import { getDisplayImages } from "../utils/productView";

const formatAED = (n) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
      }).format(n)
    : null;

const StatusBadge = ({ status, stock }) => {
  if (status === "product_unavailable") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        No longer available
      </span>
    );
  }
  if (status === "out_of_stock") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        Out of stock
      </span>
    );
  }
  if ((stock ?? 0) <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      In stock
    </span>
  );
};

export default function WishlistPage() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.wishlist.loading);
  const items = useSelector((s) => s.wishlist.items || []);
  const variantsAll = useSelector((s) => s.variants.items || []);

  const variantsByProductId = useMemo(() => {
    const map = {};
    for (const v of variantsAll) {
      const pid = typeof v.product === "string" ? v.product : v.product?._id;
      if (!pid) continue;
      (map[pid] ||= []).push(v);
    }
    return map;
  }, [variantsAll]);

  // initial load
  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  // refetch when tab/window becomes active
  useEffect(() => {
    const onFocus = () => dispatch(getWishlist());
    const onVisible = () => {
      if (document.visibilityState === "visible") dispatch(getWishlist());
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dispatch]);

  // while any item is out of stock, poll every 45s
  const hasOOS = useMemo(
    () => items.some((it) => it.status === "out_of_stock"),
    [items]
  );
  useEffect(() => {
    if (!hasOOS) return;
    const id = setInterval(() => dispatch(getWishlist()), 45000);
    return () => clearInterval(id);
  }, [hasOOS, dispatch]);

  // fetch variants for products that have no product-level images,
  // so we can show the first variant image as a fallback
  useEffect(() => {
    // de-dupe product ids and avoid re-fetching if we already have variants
    const toFetch = [];
    for (const it of items) {
      const pid = it?.product?._id || it?.productId;
      if (!pid) continue;
      const productHasImages =
        Array.isArray(it?.product?.images) && it.product.images.length > 0;
      const alreadyHaveVariants =
        Array.isArray(variantsByProductId[pid]) &&
        variantsByProductId[pid].length > 0;
      if (!productHasImages && !alreadyHaveVariants) {
        toFetch.push(pid);
      }
    }
    // fire one by one (these are lightweight thunks)
    toFetch.forEach((pid) => dispatch(getVariantsByProduct(pid)));
  }, [items, variantsByProductId, dispatch]);

  const handleRemove = async (wishlistId, productId) => {
    try {
      await dispatch(removeFromWishlist({ wishlistId, productId })).unwrap();
      toast.success("Removed from wishlist");
      // optional: refresh after removal to update stock labels if same product appears multiple times
      dispatch(getWishlist());
    } catch (error) {
      const msg = error?.message || error?.error || "Failed to remove item";
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <button
          onClick={() => dispatch(getWishlist())}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          title="Refresh"
        >
          <RotateCw size={16} />
          Refresh
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="text-center text-gray-600">Loading wishlist...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-6">Start adding items you love!</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => {
            const { wishlistId, productId, product, status, stock } = it;

            // preferred: variant image if we have variants for this product
            const pid = product?._id || productId;
            const productVariants = variantsByProductId[pid] || [];
            const firstVariantImg = productVariants?.[0]?.images?.[0] || null;

            // PDP-like default chain (no variant selected yet)
            const defaultList = getDisplayImages?.(null, product) || [];
            const defaultImg =
              defaultList[0] ||
              product?.images?.[0] ||
              product?.defaultImages?.[0];

            // final url
            const imageUrl =
              firstVariantImg || defaultImg || "/placeholder.png";

            const price =
              typeof product?.defaultPrice === "number"
                ? product.defaultPrice
                : null;

            const isUnavailable = status === "product_unavailable";
            const cardBorder = isUnavailable
              ? "border-red-200"
              : "border-gray-200";
            const imgFilter = isUnavailable ? "grayscale" : "";

            return (
              <div
                key={wishlistId || productId}
                className={`relative bg-white border ${cardBorder} rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow`}
              >
                {/* Corner label for unavailable (no blur) */}
                {isUnavailable && (
                  <div className="absolute left-0 top-0">
                    <div className="px-2 py-1 bg-red-50 text-red-700 text-[11px] font-medium rounded-br">
                      No longer available
                    </div>
                  </div>
                )}

                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={product?.name || "Item"}
                    className={`w-full h-48 object-cover ${imgFilter}`}
                  />
                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(wishlistId, productId)}
                    className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-red-50 text-red-500"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-4">
                  {/* Title / Meta */}
                  {product ? (
                    <Link
                      to={isUnavailable ? "#" : `/product/${product._id}`}
                      onClick={(e) => isUnavailable && e.preventDefault()}
                      className="block"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-gray-600 mb-2">
                          {brandLabel(product)}
                        </p>
                      )}
                      {price != null && (
                        <p className="text-lg font-bold text-gray-900">
                          {formatAED(price)}
                        </p>
                      )}
                    </Link>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-1">Item</h3>
                      <p className="text-sm text-gray-600 mb-2">—</p>
                    </>
                  )}

                  {/* Status */}
                  <div className="mt-2">
                    <StatusBadge status={status} stock={stock} />
                  </div>

                  {/* Actions */}
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {status === "out_of_stock" && (
                      <NotifyMeButton productId={productId} compact />
                    )}

                    {status === "ok" && product && (
                      <Link
                        to={`/product/${product._id}`}
                        className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 text-center text-sm"
                      >
                        View Details
                      </Link>
                    )}

                    {status === "product_unavailable" && (
                      <button
                        onClick={() => handleRemove(wishlistId, productId)}
                        className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
