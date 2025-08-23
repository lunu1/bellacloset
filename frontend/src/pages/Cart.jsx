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
import { getAllProducts } from "../features/product/productSlice";

function Cart() {
const dispatch = useDispatch();
const navigate = useNavigate();
const { authLoading, isLoggedin } = useContext(AppContext);

const products = useSelector((state) => state.products.items);
const cartItems = useSelector((state) => state.cart.items);

const currency = "₹";

const [cartData, setCartData] = useState([]);
const [modalOpen, setModalOpen] = useState(false);
const [selectedLine, setSelectedLine] = useState(null);

// keep local copy (optional)
useEffect(() => {
setCartData(cartItems || []);
}, [cartItems]);

// load server cart once user session exists
useEffect(() => {
if (!authLoading && isLoggedin) {
dispatch(loadCart());
}
}, [authLoading, isLoggedin, dispatch]);

// make sure we have products to resolve names/prices
useEffect(() => {
if (!products || products.length === 0) {
dispatch(getAllProducts());
}
}, [products.length, dispatch]);

// --- Resolver: prefer variant by id, else simple product (default fields) ---
const resolveByVariantId = (productData, item) => {
const variants = productData?.variants || [];


if (item.variantId) {
  const v = variants.find((vv) => String(vv._id) === String(item.variantId));
  const stock = typeof v?.stock === "number" ? v.stock : 0;
  const price = typeof v?.price === "number" ? v.price : 0;
  return { stock, price, variantId: item.variantId };
}

// Simple product: use defaultStock/defaultPrice
const stock =
  typeof productData?.product?.defaultStock === "number"
    ? productData.product.defaultStock
    : 0;

const price =
  typeof productData?.product?.defaultPrice === "number"
    ? productData.product.defaultPrice
    : 0;

return { stock, price, variantId: null };

};

const resolvedLines = useMemo(() => {
return (cartData || []).map((item) => {
const productData = products.find(
(p) => p?.product?._id === item.productId
);
if (!productData) {
return {
item,
productData: null,
stock: 0,
price: 0,
variantId: item.variantId ?? null,
};
}
const { stock, price, variantId } = resolveByVariantId(productData, item);
return { item, productData, stock, price, variantId };
});
}, [cartData, products]);

const hasInsufficient = resolvedLines.some(
(line) => line.item.quantity > (line.stock ?? 0)
);
const canCheckout = (cartItems?.length || 0) > 0 && !hasInsufficient;

// Summary rows for CartTotal
const summaryItems = useMemo(
() =>
resolvedLines.map(({ item, productData, price }) => ({
name: productData?.product?.name || "Item",
price: typeof price === "number" ? price : 0,
quantity: item.quantity || 1,
})),[resolvedLines]
);

const moveThenRemove = async (line) => {
const pid = line?.productData?.product?._id || line?.item?.productId;
try {
await dispatch(
addToWishlist({
productId: pid,
variantId: line.variantId ?? null,
})
).unwrap();


  toast.success("Moved to wishlist");

  await dispatch(
    removeFromCartServer({
      productId: line.item.productId,
      variantId: line.variantId ?? null,
    })
  ).unwrap();
} catch (e) {
  const msg = e?.error || e?.message || "Action failed";
  toast.info(typeof msg === "string" ? msg : "Action failed");
} finally {
  setModalOpen(false);
  setSelectedLine(null);
}


};

const removeOnly = async (line) => {
try {
await dispatch(
removeFromCartServer({
productId: line.item.productId,
variantId: line.variantId ?? null,
})
).unwrap();
toast.success("Removed from cart");
} catch (e) {
const msg = e?.error || e?.message || "Failed to remove";
toast.error(typeof msg === "string" ? msg : "Failed to remove");
} finally {
setModalOpen(false);
setSelectedLine(null);
}
};

const handleQtyChange = (line, value) => {
const qty = Math.max(1, Number(value) || 1);


if (authLoading) {
  toast.info("Checking your session…");
  return;
}
if (!isLoggedin) {
  toast.info("Please login to update quantity");
  return;
}

dispatch(
  updateQuantityServer({
    productId: line.item.productId,
    variantId: line.variantId ?? null,
    quantity: qty,
  })
)
  .unwrap()
  .catch((e) => {
    const msg = e?.error || e?.message || "Quantity update failed";
    toast.error(typeof msg === "string" ? msg : "Quantity update failed");
    dispatch(loadCart()); // re-sync on error
  });


};

return ( <div className="border-t pt-14"> <div className="mb-3 text-3xl">
<Title text1={"YOUR"} text2={"CART"} /> </div>


  <div>
    {resolvedLines.map((line, index) => {
      const { item, productData, stock, price, variantId } = line;
      if (!productData) return null;

      const effectiveStock = stock ?? 0;
      const qtyExceeds = (item.quantity || 0) > effectiveStock;
      const lowStock =
        effectiveStock > 0 && effectiveStock <= 5 && !qtyExceeds;

      return (
        <div
          key={`${item.productId}-${variantId || "novar"}-${index}`}
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
      <CartTotal items={summaryItems} />
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


