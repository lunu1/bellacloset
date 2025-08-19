import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { updateQuantity, removeFromCart } from "../features/cart/cartSlice";
import { addToWishlist } from "../features/wishlist/wishlistSlice";
import { toast } from "react-toastify";
import ActionModal from "../components/ActionModal";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector((state) => state.products.items);
  const cartItems = useSelector((state) => state.cart.items);

  const currency = "₹";

  const [cartData, setCartData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  useEffect(() => {
    setCartData(cartItems);
  }, [cartItems]);

  const norm = (v) => (v ?? "").toString().trim().toLowerCase();

  const resolveVariant = (productData, item) => {
    const variants = productData?.variants || [];

    if (variants.length === 0) {
      const stock =
        typeof productData?.product?.stock === "number"
          ? productData.product.stock
          : 0;

      const price =
        typeof productData?.product?.price === "number"
          ? productData.product.price
          : typeof productData?.product?.defaultPrice === "number"
          ? productData.product.defaultPrice
          : typeof productData?.variants?.[0]?.price === "number"
          ? productData.variants[0].price
          : 0;

      return { stock, price, variantId: null };
    }

    const found = variants.find((v) => {
      const a = v.attributes || v.optionValues || {};
      const vColor = norm(a.Color ?? a.color);
      const vSize = norm(a.Size ?? a.size);
      const okColor = item.color ? norm(item.color) === vColor : true;
      const okSize = item.size ? norm(item.size) === vSize : true;
      return okColor && okSize;
    });

    if (!found) return { stock: 0, price: 0, variantId: null };
    return {
      stock: typeof found.stock === "number" ? found.stock : 0,
      price: typeof found.price === "number" ? found.price : 0,
      variantId: found._id,
    };
  };

  const resolvedLines = useMemo(() => {
    return cartData.map((item) => {
      const productData = products.find(
        (p) => p?.product?._id === item.productId
      );
      if (!productData) {
        return { item, productData: null, stock: 0, price: 0, variantId: null };
      }
      const { stock, price, variantId } = resolveVariant(productData, item);
      return { item, productData, stock, price, variantId };
    });
  }, [cartData, products]);

  const hasInsufficient = resolvedLines.some(
    (line) => line.item.quantity > (line.stock ?? 0)
  );
  const canCheckout = cartItems.length > 0 && !hasInsufficient;

  const moveThenRemove = async (line) => {
    const pid = line?.productData?.product?._id || line?.item?.productId;
    try {
      await dispatch(
        addToWishlist({
          productId: pid,
          variantId: line.variantId ?? null,
          size: line.item.size,
          color: line.item.color,
        })
      ).unwrap();

      toast.success("Moved to wishlist");

      dispatch(
        removeFromCart({
          productId: line.item.productId,
          size: line.item.size,
          color: line.item.color,
        })
      );
    } catch (e) {
      toast.info(
        typeof e === "string" ? e : e?.message || "Already in wishlist"
      );
      // if you *don’t* want to remove when duplicate, just return here:
      // return;
    } finally {
      setModalOpen(false);
      setSelectedLine(null);
    }
  };

  const removeOnly = (line) => {
    dispatch(
      removeFromCart({
        productId: line.item.productId,
        size: line.item.size,
        color: line.item.color,
      })
    );
    toast.success("Removed from cart");
    setModalOpen(false);
    setSelectedLine(null);
  };

  const handleQtyChange = (line, value) => {
    const qty = Math.max(1, Number(value) || 1);
    dispatch(
      updateQuantity({
        productId: line.item.productId,
        size: line.item.size,
        color: line.item.color,
        quantity: qty,
      })
    );
  };

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-3xl">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {resolvedLines.map((line, index) => {
          const { item, productData, stock, price } = line;
          if (!productData) return null;

          const effectiveStock = stock ?? 0;
          const qtyExceeds = item.quantity > effectiveStock;
          const lowStock =
            effectiveStock > 0 && effectiveStock <= 5 && !qtyExceeds;

          return (
            <div
              key={`${item.productId}-${item.size || ""}-${item.color || ""}-${index}`}
              className="grid py-4 text-gray-500 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              {/* product */}
              <div className="flex items-start gap-6">
                <img
                  src={productData.product.images?.[0]}
                  className="w-16 sm:w-20 object-cover rounded"
                  alt=""
                />
                <div>
                  <p className="text-xs font-medium sm:text-lg">
                    {productData.product.name}
                  </p>

                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {currency}
                      {typeof price === "number" ? price : "N/A"}
                    </p>

                    {(item.size || item.color) && (
                      <p className="px-2 border sm:px-3 sm:py-1 bg-slate-50">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 text-xs">
                    {effectiveStock === 0 ? (
                      <span className="text-red-600">❌ Out of stock</span>
                    ) : qtyExceeds ? (
                      <span className="text-red-600">
                        ⚠️ Only {effectiveStock} left — reduce quantity
                      </span>
                    ) : lowStock ? (
                      <span className="text-amber-600">
                        ⚠️ Low stock ({effectiveStock} left)
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
                value={item.quantity}
                className={`px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2 ${
                  qtyExceeds ? "border-red-500" : ""
                }`}
                onChange={(e) => handleQtyChange(line, e.target.value)}
              />

              {/* bin -> open modal */}
              <div className="ml-auto">
                <button
                  title="Delete / Move to wishlist"
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
      </div>

      {/* Summary + Checkout */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              className={`px-8 py-3 my-8 text-sm text-white ${
                canCheckout ? "bg-black" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!canCheckout}
              onClick={() => {
                if (!canCheckout) return;
                const first = resolvedLines[0];
                if (!first?.productData) return;
                navigate("/place-order", {
                  state: {
                    productId: first.item.productId,
                    variantId: first.variantId ?? undefined,
                    productName: first.productData.product.name,
                    thumbnail: first.productData.product.images?.[0],
                    price: first.price,
                    size: first.item.size,
                    color: first.item.color,
                    quantity: first.item.quantity,
                  },
                });
              }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {/* The popup */}
      <ActionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLine(null);
        }}
        title="Remove item"
        message="What would you like to do with this item?"
        actions={[
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
        ]}
      />
    </div>
  );
}

export default Cart;

