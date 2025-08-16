import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { updateQuantity, removeFromCart } from "../features/cart/cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector((state) => state.products.items);
  const cartItems = useSelector((state) => state.cart.items);
  const currency = "₹";

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    setCartData(cartItems);
  }, [cartItems]);

  // --- helpers ---------------------------------------------------------------
  const norm = (v) => (v ?? "").toString().trim().toLowerCase();

  const resolveVariant = (productData, item) => {
    const variants = productData?.variants || [];
    const hasVariants = variants.length > 0;

    if (!hasVariants) {
      const stock =
        typeof productData?.product?.stock === "number"
          ? productData.product.stock
          : 0;
      const price =
        typeof productData?.product?.price === "number"
          ? productData.product.price
          : productData?.variants?.[0]?.price ?? 0; // graceful fallback if your price is on variant sometimes
      return { hasVariants, variant: null, stock, price, variantId: null };
    }

    // Try to match by attributes OR optionValues (supports both shapes)
    const found = variants.find((v) => {
      const a = v.attributes || v.optionValues || {};
      const vColor = norm(a.Color ?? a.color);
      const vSize = norm(a.Size ?? a.size);
      const okColor = item.color ? norm(item.color) === vColor : true;
      const okSize = item.size ? norm(item.size) === vSize : true;
      return okColor && okSize;
    });

    if (!found) {
      // If product has variants but none match the cart selection -> treat as 0 stock
      return { hasVariants, variant: null, stock: 0, price: 0, variantId: null };
    }

    const stock = typeof found.stock === "number" ? found.stock : 0;
    const price = typeof found.price === "number" ? found.price : 0;
    return { hasVariants, variant: found, stock, price, variantId: found._id };
  };

  // Resolve each cart line with stock/price/variantId
  const resolvedLines = useMemo(() => {
    return cartData.map((item) => {
      const productData = products.find(
        (p) => p.product?._id === item.productId
      );
      if (!productData) {
        return {
          item,
          productData: null,
          stock: 0,
          price: 0,
          variantId: null,
          status: "missing",
        };
      }
      const { stock, price, variantId } = resolveVariant(productData, item);
      return {
        item,
        productData,
        stock,
        price,
        variantId,
        status: stock === 0 ? "oos" : "ok",
      };
    });
  }, [cartData, products]);

  // Block checkout if any line exceeds available stock or cart empty
  const hasInsufficient = resolvedLines.some(
    (line) => line.item.quantity > (line.stock ?? 0)
  );
  const canCheckout = cartItems.length > 0 && !hasInsufficient;

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
          const lowStock = effectiveStock > 0 && effectiveStock <= 5;
          const qtyExceeds = item.quantity > effectiveStock;

          return (
            <div
              key={index}
              className="grid py-4 text-gray-500 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  src={productData.product.images?.[0]}
                  className="w-16 sm:w-20"
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

                  {/* Stock badge/message */}
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

              <input
                type="number"
                min={1}
                max={effectiveStock || undefined}
                defaultValue={item.quantity}
                className={`px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2 ${
                  qtyExceeds ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const qty = isNaN(raw) || raw < 1 ? 1 : raw;

                  // Optionally clamp to stock if you prefer:
                  // const nextQty = effectiveStock ? Math.min(qty, effectiveStock) : qty;
                  const nextQty = qty;

                  dispatch(
                    updateQuantity({
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                      quantity: nextQty,
                    })
                  );
                }}
              />

              <img
                src={assets.bin_icon}
                className="w-4 mr-4 cursor-pointer sm:w-5"
                alt=""
                onClick={() =>
                  dispatch(
                    removeFromCart({
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                    })
                  )
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />

          {/* Checkout disabled notice */}
          {!canCheckout && cartItems.length > 0 && (
            <p className="text-sm text-red-600 text-right">
              Some items exceed available stock. Please adjust quantities before
              checkout.
            </p>
          )}

          <div className="w-full text-end">
            <button
              className={`px-8 py-3 my-8 text-sm text-white ${
                canCheckout ? "bg-black" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!canCheckout}
              onClick={() => {
                if (!canCheckout) return; // hard guard

                // If your place-order page expects the first item (as in your original code):
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
    </div>
  );
}

export default Cart;
