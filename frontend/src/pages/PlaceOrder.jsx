// src/pages/PlaceOrder.jsx
import { useContext, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import CartTotal from "../components/CartTotal";
import { AppContext } from "../context/AppContext";
import { useDispatch, useSelector } from "react-redux";
import { clearCartGuest, clearCartServer } from "../features/cart/cartSlice";


import AddressPicker from "../components/checkout/AddressPicker";
import OrderItemsSummary from "../components/checkout/OrderItemsSummary";
import PaymentSelector from "../components/checkout/PaymentSelector";




import {
  computePricingPreview,
  adaptSettingsToPreview,
} from "../utils/pricingPreview";
import useShopSettings from "../hooks/useShopSettings";
import { adaptSettingsForPreview } from "../utils/settingAdapter";
import { getDisplayImages } from "../utils/productView";

import StripeCheckout from "../components/checkout/StripeCheckout";
import BackButton from "../components/BackButton";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, authLoading, userData } = useContext(AppContext);



  const { state } = useLocation();
  const dispatch = useDispatch()

  const cartItems = useSelector((s) => s.cart.items);

  const productsWrapped = useSelector((s) => s.products.items || []);
const variantsAll = useSelector((s) => s.variants.items || []);

const productsById = useMemo(() => {
  const m = {};
  for (const w of productsWrapped) {
    const p = w?.product;
    if (p?._id) m[String(p._id)] = p;
  }
  return m;
}, [productsWrapped]);


  // selected address from AddressPicker
  const [selectedAddress, setSelectedAddress] = useState(null);
  const profileEmail = userData?.email || "";
const finalEmail = selectedAddress?.email || profileEmail;



  // payment method from PaymentSelector: "cod" | "stripe"
  const [method, setMethod] = useState("cod");

  // settings for pricing preview
  const { settings: apiSettings } = useShopSettings();
  const settings = adaptSettingsForPreview(apiSettings);

  

  // ✅ Build clean, available lines from the cart for checkout UI/pricing
  // const sourceLines = useMemo(() => {
  //   return (cartItems || [])
  //     .filter((ln) => !ln.unavailable)
  //     .map((ln) => ({
  //       productId: ln.productId,
  //       variantId: ln.variantId ?? undefined,
  //       name: ln.product?.name || "Item",
  //       price: typeof ln.unitPrice === "number" ? ln.unitPrice : 0, // AED base
  //       quantity: ln.quantity || 1,
  //       thumbnail: ln.product?.images?.[0] || "/placeholder.jpg",
  //       size: ln.variant?.optionValues?.Size || ln.size,
  //       color: ln.variant?.optionValues?.Color || ln.color,
  //     }));
  // }, [cartItems]);

  const sourceLines = useMemo(() => {
  return (cartItems || [])
    .filter((ln) => !ln.unavailable)
    .map((ln) => {
      const pid = String(ln.productId || ln.product?._id || "");
      const vid = ln.variantId ? String(ln.variantId) : null;

      // Resolve product from cart OR products store
      const product = ln.product || productsById[pid] || null;

      // Resolve variant from cart OR variants store
      const variant =
        ln.variant ||
        (vid ? variantsAll.find((v) => String(v._id) === vid) : null) ||
        null;

      // ✅ Best thumbnail selection (variant first, then product)
      const thumbnail =
        variant?.images?.[0] ||
        (product ? (getDisplayImages?.(variant, product) || [])[0] : null) ||
        product?.images?.[0] ||
        product?.defaultImages?.[0] ||
        "/placeholder.jpg";

      return {
        productId: pid,
        variantId: vid || undefined,
        name: product?.name || ln.product?.name || "Item",
        price: typeof ln.unitPrice === "number" ? ln.unitPrice : 0,
        quantity: ln.quantity || 1,
        thumbnail,
        size: variant?.optionValues?.Size || ln.size,
        color: variant?.optionValues?.Color || ln.color,
      };
    });
}, [cartItems, productsById, variantsAll]);


  // Items chosen either from "Buy Now" (router state) or entire cart
  const itemsForCheckout = useMemo(() => {
    if (state?.productId) {
      return [
        {
          productId: state.productId,
          variantId: state.variantId,
          name: state.productName || "Item",
          price: Number(state.price) || 0, // AED base
          quantity: Number(state.quantity) || 1,
          thumbnail: state.thumbnail || "/placeholder.jpg",
          size: state.size,
          color: state.color,
        },
      ];
    }
    return sourceLines;
  }, [state, sourceLines]);

  // ✅ why button is disabled (show under button)
const disabledReason = useMemo(() => {
  if (authLoading) return "Loading your account… please wait.";
  if (!selectedAddress?.fullName) return "Full name is required.";
  if (!finalEmail) return "Email is required (add email in profile or address).";
  if (!selectedAddress?.phone) return "Phone number is required.";
  if (!selectedAddress?.unitNumber) return "Unit number is required.";
  if (!selectedAddress?.buildingName) return "Building name is required.";
  if (!selectedAddress?.area) return "Area / community is required.";
  if (!selectedAddress?.city) return "City is required.";
  if (!selectedAddress?.emirate) return "Emirate is required.";
  if (!itemsForCheckout?.length) return "No items to checkout.";
  return "";
}, [authLoading, selectedAddress, finalEmail, itemsForCheckout]);

  // pricing preview (AED base numbers)
  const pricing = useMemo(() => {
    const adapted =
      settings && (settings.shipping || settings.tax)
        ? adaptSettingsToPreview(settings)
        : undefined;

    return computePricingPreview(itemsForCheckout, adapted);
  }, [itemsForCheckout, settings]);

  // normalized payment method for backend
  const normalizedMethod = useMemo(() => {
    // backend expects "COD" | "STRIPE"
    const m = String(method || "cod").toUpperCase();
    return m === "STRIPE" ? "STRIPE" : "COD";
  }, [method]);

  // Basic guards
 const validateBeforeOrder = useCallback(() => {
  if (
    !selectedAddress?.fullName ||
    !selectedAddress?.phone ||
    !selectedAddress?.unitNumber ||
    !selectedAddress?.buildingName ||
    !selectedAddress?.area ||
    !selectedAddress?.city ||
    !selectedAddress?.emirate
  ) {
    toast.error("Please provide a complete UAE delivery address.");
    return false;
  }

  if (authLoading) {
    toast.info("Checking your account…");
    return false;
  }

  if (!finalEmail) {
    toast.error("Please add your email to receive order confirmation.");
    return false;
  }

  if (!itemsForCheckout?.length) {
    toast.error("No items to checkout.");
    return false;
  }

  return true;
}, [selectedAddress, itemsForCheckout, finalEmail, authLoading]);



  // Create order (used by both COD and Stripe success)
  const createOrder = useCallback(
    async (paymentIntentId = null) => {
      if (!validateBeforeOrder()) return;

      // guard for Stripe
      if (normalizedMethod === "STRIPE" && !paymentIntentId) {
        toast.error("Stripe payment not initialized. Please try again.");
        return;
      }

      const products = itemsForCheckout.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
      }));

      const orderData = {
        products,
        address: {
          label: selectedAddress?.label || "Home",
          fullName: selectedAddress?.fullName || "",
        email: finalEmail || "",



          phone: selectedAddress?.phone || "",
          addressType: selectedAddress?.addressType || "apartment",
          unitNumber: selectedAddress?.unitNumber || "",
          buildingName: selectedAddress?.buildingName || "",
          street: selectedAddress?.street || "",
          area: selectedAddress?.area || "",
          city: selectedAddress?.city || "",
          emirate: selectedAddress?.emirate || "",
          landmark: selectedAddress?.landmark || "",
          poBox: selectedAddress?.poBox || "",
          postalCode: selectedAddress?.postalCode || "",
        },

        paymentMethod: normalizedMethod, // "COD" | "STRIPE"

        // only send codConfirmed for COD
        ...(normalizedMethod === "COD" ? { codConfirmed: true } : {}),

        // only send paymentIntentId for Stripe
        ...(normalizedMethod === "STRIPE" ? { paymentIntentId } : {}),
      };

      try {
        toast.dismiss();

        const res = await axios.post(`${backendUrl}/api/order/place`, orderData, {
          withCredentials: true,
        });

        const created = res.data;

// ✅ store guest token for guest checkout
if (created?.guestToken && created?._id) {
  localStorage.setItem(`guest_order_token_${created._id}`, created.guestToken);
}

// ✅ STEP 3: clear cart AFTER successful order (before navigate)
if (!state?.productId) {
  if (isLoggedin) {
    await dispatch(clearCartServer()); // clears server + redux
  } else {
    dispatch(clearCartGuest());        // clears redux guest cart
    // remove guest cart from localStorage if you store it
    localStorage.removeItem("guest_cart"); // change key if yours is different
  }
}




        if (normalizedMethod === "STRIPE") {
          toast.success("Order request received! Waiting for admin confirmation.");
        } else {
          toast.success("Order placed successfully!");
        }

        navigate(`/order-success/${created._id}`, {
          state:
            normalizedMethod === "STRIPE"
              ? { justRequested: true }
              : { justPlaced: true },
        });
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to place order");
        console.error(e);
      }
    },
    [
      backendUrl,
      itemsForCheckout,
      selectedAddress,
      normalizedMethod,
      navigate,
      validateBeforeOrder,
    ]
  );

  // COD flow button handler
  const placeOrderCOD = async () => {
    if (!validateBeforeOrder()) return;
    await createOrder(null);
  };

  return (
    <div className="flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t">
      {/* LEFT: Address Picker */}
      <div className="w-full sm:max-w-[50%]">
        <BackButton />
        <AddressPicker backendUrl={backendUrl} onChange={setSelectedAddress} isLoggedin={isLoggedin} authLoading={authLoading}/>
      </div>

      {/* RIGHT: Items + totals + payment */}
      <div className="w-full sm:max-w-[45%] mt-8">
        <OrderItemsSummary items={itemsForCheckout} />

        {/* ✅ Currency handled globally by CurrencyContext now */}
        <CartTotal items={itemsForCheckout} settings={settings} />

        <PaymentSelector method={method} setMethod={setMethod} />

        {/* STRIPE: render card payment UI */}
        {normalizedMethod === "STRIPE" ? (
          <StripeCheckout
            backendUrl={backendUrl}
            amount={pricing.grandTotal} // AED base amount used for payment
            orderData={{ products: itemsForCheckout }}
            onSuccess={async (paymentIntentId) => {
              await createOrder(paymentIntentId);
            }}
          />
        ) : (
          // COD: normal place order button
          <div className="w-full text-end">
            <button
              className="px-16 py-3 my-8 text-sm text-white bg-black disabled:opacity-50"
              onClick={placeOrderCOD}
             disabled={
  authLoading ||                      // ✅ wait until profile loads
  !selectedAddress?.fullName ||
  !finalEmail ||                      // ✅ uses address OR profile
  !selectedAddress?.phone ||
  !selectedAddress?.unitNumber ||
  !selectedAddress?.buildingName ||
  !selectedAddress?.area ||
  !selectedAddress?.city ||
  !selectedAddress?.emirate
}


            >
              PLACE ORDER
            </button>
            {disabledReason ? (
  <p className="mt-2 text-sm text-red-600 text-right">
    {disabledReason}
  </p>
) : null}

          </div>
        )}
      </div>
    </div>
  );
}
