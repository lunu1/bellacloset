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
  updateQuantityGuest,
  removeFromCartGuest,
} from "../features/cart/cartSlice";

import {
  addToWishlist,
  addToWishlistGuest,
} from "../features/wishlist/wishlistSlice";

import { toast } from "react-toastify";
import ActionModal from "../components/ActionModal";
import { AppContext } from "../context/AppContext";
import useShopSettings from "../hooks/useShopSettings";
import { adaptSettingsForPreview } from "../utils/settingAdapter";
import { getVariantsByProduct } from "../features/variants/variantSlice";
import { getDisplayImages } from "../utils/productView";
import BackButton from "../components/BackButton";
import {
  getAllProducts,
  selectProductsWrapped,
} from "../features/product/productSlice";

// ✅ currency
import { useCurrency } from "../context/CurrencyContext";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading, isLoggedin } = useContext(AppContext);

  // ✅ currency formatter
  const { format } = useCurrency();

  const items = useSelector((s) => s.cart.items);
  const loading = useSelector((s) => s.cart.loading);

  // variants store
  const variantsAll = useSelector((s) => s.variants.items || []);

  // ✅ fast lookups
  const variantsById = useMemo(() => {
    const m = {};
    for (const v of variantsAll) {
      if (v?._id) m[String(v._id)] = v;
    }
    return m;
  }, [variantsAll]);

  const variantsByProductId = useMemo(() => {
    const map = {};
    for (const v of variantsAll) {
      const pid = typeof v.product === "string" ? v.product : v.product?._id;
      if (!pid) continue;
      (map[pid] ||= []).push(v);
    }
    return map;
  }, [variantsAll]);

  // shop settings
  const { settings: apiSettings } = useShopSettings();
  const settings = adaptSettingsForPreview(apiSettings);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  // products store (for image/name fallback)
  const productsWrapped = useSelector(selectProductsWrapped); // [{product}]
  const productsById = useMemo(() => {
    const m = {};
    for (const w of productsWrapped || []) {
      const p = w?.product;
      if (p?._id) m[String(p._id)] = p;
    }
    return m;
  }, [productsWrapped]);

  useEffect(() => {
    // after refresh, products exist to resolve images/names
    if ((productsWrapped || []).length === 0) dispatch(getAllProducts());
  }, [dispatch, productsWrapped?.length]);

  // on mount / auth ready, load server cart
  useEffect(() => {
    if (!authLoading && isLoggedin) dispatch(loadCart());
  }, [authLoading, isLoggedin, dispatch]);

  /**
   * ✅ IMPORTANT FIX:
   * Previously you fetched variants ONLY when product had no images.
   * But price fallback needs variants too. So fetch variants when:
   * - line has variantId but line.variant not populated AND we don't have that variant in store
   * OR
   * - product images missing and we need variants for image fallback
   */
  useEffect(() => {
    const toFetch = new Set();

    for (const ln of items || []) {
      const pid = ln?.product?._id || ln?.productId;
      if (!pid) continue;

      const hasProductImgs =
        Array.isArray(ln?.product?.images) && ln.product.images.length > 0;

      const alreadyHaveProductVariants =
        Array.isArray(variantsByProductId[pid]) &&
        variantsByProductId[pid].length > 0;

      const needsVariantForPrice =
        !!ln?.variantId &&
        !ln?.variant &&
        !variantsById[String(ln.variantId)];

      const needsVariantForImages = !hasProductImgs && !alreadyHaveProductVariants;

      if (needsVariantForPrice || needsVariantForImages) {
        toFetch.add(String(pid));
      }
    }

    [...toFetch].forEach((pid) => dispatch(getVariantsByProduct(pid)));
  }, [items, variantsById, variantsByProductId, dispatch]);

  // ✅ unified price resolver (used in list + summary)
  const getLineUnitPrice = (line, product) => {
    const resolvedVariant =
      line?.variant ||
      (line?.variantId ? variantsById[String(line.variantId)] : null);

    const unitPrice =
      typeof line?.unitPrice === "number" && line.unitPrice > 0
        ? line.unitPrice
        : typeof resolvedVariant?.price === "number" && resolvedVariant.price > 0
        ? resolvedVariant.price
        : typeof product?.price === "number" && product.price > 0
        ? product.price
        : 0;

    return unitPrice;
  };

  // compute summary (exclude unavailable lines)
  const summaryItems = useMemo(() => {
    return (items || [])
      .filter((ln) => !ln.unavailable)
      .map((ln) => {
        const product = ln.product || productsById[String(ln.productId)];
        return {
          name: product?.name || "Item",
          price: getLineUnitPrice(ln, product),
          quantity: ln.quantity || 1,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, productsById, variantsById]);

  const hasUnavailable = (items || []).some((ln) => ln.unavailable);
  const isEmpty = (items || []).length === 0;
  const canCheckout = !isEmpty && !hasUnavailable;

  // Empty state
  if (!loading && isEmpty) {
    return (
      <div className="border-t pt-10">
        <BackButton className="mb-4" />
        <div className="mb-3 text-3xl">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-lg text-gray-800 font-medium">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-1">
            Browse products and add your favorites.
          </p>
          <button
            className="mt-6 px-6 py-2 text-sm text-white bg-black hover:bg-gray-800"
            onClick={() => navigate("/")}
          >
            Start shopping
          </button>
        </div>
      </div>
    );
  }

  // handlers
  const removeOnly = async (line) => {
    // ✅ guest remove
    if (!isLoggedin) {
      dispatch(
        removeFromCartGuest({
          lineId: line.lineId,
          productId: line.productId,
          variantId: line.variantId ?? null,
        })
      );
      toast.success("Removed from cart");
      setModalOpen(false);
      setSelectedLine(null);
      return;
    }

    // ✅ logged-in remove
    try {
      await dispatch(
        removeFromCartServer({
          lineId: line.lineId,
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
    if (line.unavailable) {
      await removeOnly(line);
      return;
    }

    // ✅ guest move
    if (!isLoggedin) {
      dispatch(
        addToWishlistGuest({
          productId: line.productId,
          variantId: line.variantId ?? null,
        })
      );
      dispatch(
        removeFromCartGuest({
          lineId: line.lineId,
          productId: line.productId,
          variantId: line.variantId ?? null,
        })
      );
      toast.success("Moved to wishlist");
      setModalOpen(false);
      setSelectedLine(null);
      return;
    }

    // ✅ logged-in move
    try {
      await dispatch(
        addToWishlist({
          productId: line.productId,
          variantId: line.variantId ?? null,
        })
      ).unwrap();

      toast.success("Moved to wishlist");

      await dispatch(
        removeFromCartServer({
          lineId: line.lineId,
          productId: line.productId,
          variantId: line.variantId ?? null,
        })
      ).unwrap();
    } catch (e) {
      const msg = e?.error || e?.message || "Already in wishlist";
      toast.info(typeof msg === "string" ? msg : "Action failed");
      dispatch(loadCart());
    } finally {
      setModalOpen(false);
      setSelectedLine(null);
    }
  };

  const handleQtyChange = (line, value) => {
    const qty = Math.max(1, Number(value) || 1);
    if (line.unavailable) return;

    // ✅ guest qty update
    if (!isLoggedin) {
      dispatch(
        updateQuantityGuest({
          productId: line.productId,
          variantId: line.variantId ?? null,
          quantity: qty,
        })
      );
      return;
    }

    // ✅ logged-in qty update
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
    <div className="border-t pt-10">
      <BackButton className="mb-4" />
      <div className="mb-3 text-3xl">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {/* List */}
      <div>
        {(items || []).map((line, idx) => {
          const product = line.product || productsById[String(line.productId)];
          const pid = product?._id || line.productId;

          const resolvedVariant =
            line?.variant ||
            (line?.variantId ? variantsById[String(line.variantId)] : null);

          const unitPrice = getLineUnitPrice(line, product);
          const priceStr =
            typeof unitPrice === "number" ? format(unitPrice) : "N/A";

          const { quantity, unavailable, reason } = line;
          const name = product?.name || "Item";

          // images
          const productVariants = variantsByProductId[pid] || [];
          const matchedVariant = line?.variantId
            ? productVariants.find((v) => String(v._id) === String(line.variantId))
            : productVariants[0];

          const defaultList = product
            ? getDisplayImages?.(null, product) || []
            : [];

          const image =
            resolvedVariant?.images?.[0] ||
            matchedVariant?.images?.[0] ||
            defaultList[0] ||
            product?.images?.[0] ||
            product?.defaultImages?.[0] ||
            "/placeholder.jpg";

          const borderCls = unavailable ? "border-red-200" : "border-gray-200";

          return (
            <div
              key={`${line.lineId || line.productId || "x"}-${
                line.variantId || "no-variant"
              }-${idx}`}
              className={`grid py-4 text-gray-700 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 ${borderCls}`}
            >
              {/* product */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  {unavailable && (
                    <div className="absolute left-0 top-0 z-10 px-2 py-1 bg-red-50 text-red-700 text-[11px] font-medium rounded-br">
                      No longer available
                    </div>
                  )}
                  <img
                    src={image}
                    className={`w-16 sm:w-20 h-16 sm:h-20 object-cover ${
                      unavailable ? "grayscale" : ""
                    } rounded`}
                    alt={name}
                  />
                </div>

                <div>
                  <p className="text-xs font-thin sm:text-lg">{name}</p>

                  <div className="flex items-center gap-5 mt-2">
                    <p>{priceStr}</p>
                  </div>

                  {/* availability hint */}
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

        {loading && <div className="py-4 text-sm text-gray-500">Updating…</div>}
      </div>

      {/* Summary + Checkout */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          {/* CartTotal uses CurrencyContext internally */}
          <CartTotal items={summaryItems} settings={settings} />

          <div className="w-full text-end">
            <button
              className={`px-8 py-3 my-8 text-sm text-white ${
                canCheckout ? "bg-black" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!canCheckout}
              onClick={() => {
                if (!canCheckout) return;
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
