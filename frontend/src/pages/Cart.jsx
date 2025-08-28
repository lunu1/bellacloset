// src/pages/Cart.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import {
  updateQuantityServer,
  removeFromCartServer,
  loadCart,
} from "../features/cart/cartSlice";
import { addToWishlist } from "../features/wishlist/wishlistSlice";
import { toast } from "react-toastify";
import ActionModal from "../components/ActionModal";
import { AppContext } from "../context/AppContext";
import useShopSettings from "../hooks/useShopSettings";
import { adaptSettingsForPreview } from "../utils/settingAdapter";

const formatAED = (n) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(Number(n) || 0);

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading, isLoggedin } = useContext(AppContext);

  const items = useSelector((s) => s.cart.items); // normalized from slice (contains availability + lineId)
  const loading = useSelector((s) => s.cart.loading);

  const { settings: apiSettings } = useShopSettings();
  const settings = adaptSettingsForPreview(apiSettings);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  // on mount / auth ready, load server cart
  useEffect(() => {
    if (!authLoading && isLoggedin) dispatch(loadCart());
  }, [authLoading, isLoggedin, dispatch]);

  // compute summary (exclude unavailable lines)
  const summaryItems = useMemo(() => {
    return (items || [])
      .filter((ln) => !ln.unavailable)
      .map((ln) => ({
        name: ln.product?.name || "Item",
        price: typeof ln.unitPrice === "number" ? ln.unitPrice : 0,
        quantity: ln.quantity || 1,
      }));
  }, [items]);

  const hasUnavailable = (items || []).some((ln) => ln.unavailable);
  const isEmpty = (items || []).length === 0;
  const canCheckout = !isEmpty && !hasUnavailable;

  // handlers
  const removeOnly = async (line) => {
    try {
      await dispatch(
        removeFromCartServer({
          lineId: line.lineId, // key fix: use line id
          productId: line.productId || undefined,
          variantId: line.variantId ?? null,
        })
      ).unwrap();
      toast.success("Removed from cart");
    } catch (e) {
      const msg = e?.error || e?.message || "Failed to remove";
      toast.error(typeof msg === "string" ? msg : "Failed to remove");
      dispatch(loadCart());
    } finally {
      setModalOpen(false);
      setSelectedLine(null);
    }
  };

  const moveThenRemove = async (line) => {
    try {
      if (line.unavailable) {
        // Can't move deleted/unavailable safely (product might be gone)
        await removeOnly(line);
        return;
      }
      // add to wishlist
      await dispatch(addToWishlist({ productId: line.productId, variantId: line.variantId ?? null })).unwrap();
      toast.success("Moved to wishlist");
      // then remove
      await dispatch(
        removeFromCartServer({
          lineId: line.lineId,
          productId: line.productId,
          variantId: line.variantId ?? null,
        })
      ).unwrap();
    } catch (e) {
      const msg = e?.error || e?.message || "Action failed";
      toast.info(typeof msg === "string" ? msg : "Action failed");
      dispatch(loadCart());
    } finally {
      setModalOpen(false);
      setSelectedLine(null);
    }
  };

  const handleQtyChange = (line, value) => {
    const qty = Math.max(1, Number(value) || 1);
    if (line.unavailable) return; // guard
    if (authLoading) return toast.info("Checking your session…");
    if (!isLoggedin) return toast.info("Please login to update quantity");

    dispatch(
      updateQuantityServer({
        productId: line.productId,
        variantId: line.variantId ?? null,
        quantity: qty,
      })
    )
      .unwrap()
      .catch((e) => {
        const msg = e?.error || e?.message || "Quantity update failed";
        toast.error(typeof msg === "string" ? msg : "Quantity update failed");
        dispatch(loadCart());
      });
  };

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-3xl">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {/* List */}
      <div>
        {(items || []).map((line, idx) => {
          const { product, unitPrice, quantity, unavailable, reason } = line;
          const name = product?.name || "Item";
          const image = product?.images?.[0] || "/placeholder.jpg";

          // styles for unavailable
          const borderCls = unavailable ? "border-red-200" : "border-gray-200";
          const priceStr = typeof unitPrice === "number" ? formatAED(unitPrice) : "N/A";

          return (
            <div
              key={`${line.lineId || line.productId || "x"}-${idx}`}
              className={`grid py-4 text-gray-700 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 ${borderCls}`}
            >
              {/* product */}
              <div className="flex items-start gap-6">
                <div className={`relative`}>
                  {unavailable && (
                    <div className="absolute left-0 top-0 z-10 px-2 py-1 bg-red-50 text-red-700 text-[11px] font-medium rounded-br">
                      No longer available
                    </div>
                  )}
                  <img
                    src={image}
                    className={`w-16 sm:w-20 h-16 sm:h-20 object-cover ${unavailable ? "grayscale" : ""} rounded`}
                    alt=""
                  />
                </div>
                <div>
                  <p className="text-xs font-medium sm:text-lg">{name}</p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>{priceStr}</p>
                  </div>

                  {/* availability hint (server-driven) */}
                  <div className="mt-2 text-xs">
                    {unavailable ? (
                      <span className="text-red-600">
                        {reason === "PRODUCT_DELETED" && "❌ Removed by seller"}
                        {reason === "VARIANT_DELETED" && "❌ Variant removed"}
                        {reason === "PRODUCT_INACTIVE" && "❌ Product inactive"}
                        {reason === "VARIANT_INACTIVE" && "❌ Variant inactive"}
                        {!reason && "❌ Unavailable"}
                      </span>
                    ) : (
                      <span className="text-green-600">✅ In stock</span>
                    )}
                  </div>
                </div>
              </div>

              {/* qty */}
              <input
                type="number"
                min={1}
                value={quantity}
                disabled={unavailable}
                className={`px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2 ${
                  unavailable ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
                }`}
                onChange={(e) => handleQtyChange(line, e.target.value)}
              />

              {/* actions */}
              <div className="ml-auto">
                <button
                  title={unavailable ? "Remove item" : "Delete / Move to wishlist"}
                  className="p-2 rounded hover:bg-gray-100"
                  onClick={() => {
                    setSelectedLine(line);
                    setModalOpen(true);
                  }}
                >
                  <img
                    src={assets.bin_icon}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    alt="Remove"
                  />
                </button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="py-4 text-sm text-gray-500">Updating…</div>
        )}
      </div>

      {/* Summary + Checkout */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal items={summaryItems} settings={settings} currency="AED" />
          <div className="w-full text-end">
            <button
              className={`px-8 py-3 my-8 text-sm text-white ${
                canCheckout ? "bg-black" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!canCheckout}
                        onClick={() => {
            if (!canCheckout) return;
            // ✅ Don’t prefill a single line via state; let PlaceOrder read the cart
            navigate("/place-order");
          }}

            >
              PROCEED TO CHECKOUT
            </button>
            {hasUnavailable && (
              <div className="text-xs text-red-600 -mt-3">
                Remove unavailable items to proceed to checkout.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ActionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLine(null);
        }}
        title={selectedLine?.unavailable ? "Remove item" : "Remove item"}
        message={
          selectedLine?.unavailable
            ? "This item is no longer available. Do you want to remove it from your cart?"
            : "What would you like to do with this item?"
        }
        actions={
          selectedLine?.unavailable
            ? [
                {
                  label: "Remove from cart",
                  variant: "danger",
                  onClick: () => selectedLine && removeOnly(selectedLine),
                },
                {
                  label: "Cancel",
                  variant: "secondary",
                  onClick: () => {
                    setModalOpen(false);
                    setSelectedLine(null);
                  },
                },
              ]
            : [
                {
                  label: "Move to wishlist",
                  variant: "primary",
                  onClick: () => selectedLine && moveThenRemove(selectedLine),
                },
                {
                  label: "Delete from cart",
                  variant: "danger",
                  onClick: () => selectedLine && removeOnly(selectedLine),
                },
                {
                  label: "Cancel",
                  variant: "secondary",
                  onClick: () => {
                    setModalOpen(false);
                    setSelectedLine(null);
                  },
                },
              ]
        }
      />
    </div>
  );
}

export default Cart;
