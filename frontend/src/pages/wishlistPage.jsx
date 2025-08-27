import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../features/wishlist/wishlistSlice";
import { toast } from "react-toastify";
import { Trash2, ShoppingBag } from "lucide-react";
import { brandLabel } from "../utils/brandLabel";
import NotifyMeButton from "../components/NotifyMeButton";

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

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  const handleRemove = async (wishlistId, productId) => {
    try {
      await dispatch(removeFromWishlist({ wishlistId, productId })).unwrap();
      toast.success("Removed from wishlist");
    } catch (error) {
      const msg = error?.message || error?.error || "Failed to remove item";
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
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

            const imageUrl = product?.images?.[0] || "/placeholder.jpg";
            const price =
              typeof product?.defaultPrice === "number" ? product.defaultPrice : null;

            const isUnavailable = status === "product_unavailable";
            const cardBorder =
              isUnavailable ? "border-red-200" : "border-gray-200";
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
                        <p className="text-sm text-gray-600 mb-2">{brandLabel(product)}</p>
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
