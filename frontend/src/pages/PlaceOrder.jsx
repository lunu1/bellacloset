// src/pages/PlaceOrder.jsx
import { useContext, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import CartTotal from "../components/CartTotal";
import { AppContext } from "../context/AppContext";
import { useSelector } from "react-redux";

import AddressPicker from "../components/checkout/AddressPicker";
import OrderItemsSummary from "../components/checkout/OrderItemsSummary";
import PaymentSelector from "../components/checkout/PaymentSelector";

import { computePricingPreview, adaptSettingsToPreview } from "../utils/pricingPreview";
import useShopSettings from "../hooks/useShopSettings";
import { adaptSettingsForPreview } from "../utils/settingAdapter";

import StripePay from "../components/checkout/StripePay";
import StripeCheckout from "../components/checkout/StripeCheckout";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const { state } = useLocation();

  const cartItems = useSelector((s) => s.cart.items);

  // selected address from AddressPicker
  const [selectedAddress, setSelectedAddress] = useState(null);

  // payment method from PaymentSelector: "cod" | "stripe"
  const [method, setMethod] = useState("cod");

  // settings for pricing preview
  const { settings: apiSettings } = useShopSettings();
  const settings = adaptSettingsForPreview(apiSettings);

  // ✅ Build clean, available lines from the cart for checkout UI/pricing
  const sourceLines = useMemo(() => {
    return (cartItems || [])
      .filter((ln) => !ln.unavailable)
      .map((ln) => ({
        productId: ln.productId,
        variantId: ln.variantId ?? undefined,
        name: ln.product?.name || "Item",
        price: typeof ln.unitPrice === "number" ? ln.unitPrice : 0,
        quantity: ln.quantity || 1,
        thumbnail: ln.product?.images?.[0] || "/placeholder.jpg",
        size: ln.variant?.optionValues?.Size || ln.size,
        color: ln.variant?.optionValues?.Color || ln.color,
      }));
  }, [cartItems]);

  // Items chosen either from "Buy Now" (router state) or entire cart
  const itemsForCheckout = useMemo(() => {
    if (state?.productId) {
      return [
        {
          productId: state.productId,
          variantId: state.variantId,
          name: state.productName || "Item",
          price: Number(state.price) || 0,
          quantity: Number(state.quantity) || 1,
          thumbnail: state.thumbnail || "/placeholder.jpg",
          size: state.size,
          color: state.color,
        },
      ];
    }
    return sourceLines;
  }, [state, sourceLines]);

  // pricing preview
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
    if (!selectedAddress?.street) {
      toast.error("Please provide a valid delivery address.");
      return false;
    }
    if (!itemsForCheckout?.length) {
      toast.error("No items to checkout.");
      return false;
    }
    return true;
  }, [selectedAddress, itemsForCheckout]);

  // Create order (used by both COD and Stripe success)
  const createOrder = useCallback(
    async (paymentIntentId = null) => {
      if (!validateBeforeOrder()) return;

      const products = itemsForCheckout.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
      }));

      const orderData = {
        products,
        totalAmount: pricing.grandTotal,
        address: selectedAddress,

        paymentMethod: normalizedMethod, // "COD" | "STRIPE"
        codConfirmed: normalizedMethod === "COD",

        // attach Stripe intent id if paid by card
        paymentIntentId: paymentIntentId || undefined,

        pricing: {
          subtotal: pricing.subtotal,
          shippingFee: pricing.shippingFee,
          taxAmount: pricing.taxAmount,
          taxRate: pricing.taxRate,
          taxMode: pricing.taxMode,
          shippingMethod: pricing.shippingMethod,
          deliveryEta: pricing.deliveryEta,
          grandTotal: pricing.grandTotal,
          currency: "AED",
        },
      };

      try {
        toast.dismiss();

        let created;
        try {
          const res = await axios.post(`${backendUrl}/api/order`, orderData, {
            withCredentials: true,
          });
          created = res.data;
        } catch (err) {
          // legacy fallback
          if (err?.response?.status === 404) {
            const res2 = await axios.post(`${backendUrl}/api/order/place`, orderData, {
              withCredentials: true,
            });
            created = res2.data;
          } else {
            throw err;
          }
        }

        toast.success("Order placed successfully!");
        navigate(`/order-success/${created._id}`, { state: { justPlaced: true } });
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to place order");
        console.error(e);
      }
    },
    [
      backendUrl,
      itemsForCheckout,
      pricing,
      selectedAddress,
      normalizedMethod,
      navigate,
      validateBeforeOrder,
    ]
  );

  // COD flow button handler
  const placeOrderCOD = async () => {
    await createOrder(null);
  };

  return (
    <div className="flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t">
      {/* LEFT: Address Picker */}
      <div className="w-full sm:max-w-[50%]">
        <AddressPicker backendUrl={backendUrl} onChange={setSelectedAddress} />
      </div>

      {/* RIGHT: Items + totals + payment */}
      <div className="w-full sm:max-w-[45%] mt-8">
        <OrderItemsSummary items={itemsForCheckout} />

        <CartTotal items={itemsForCheckout} settings={settings} currency="AED" />

        <PaymentSelector method={method} setMethod={setMethod} />

        {/* STRIPE: render card payment UI */}
      {normalizedMethod === "STRIPE" ? (
  <StripeCheckout
    backendUrl={backendUrl}
    amount={pricing.grandTotal}
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
              disabled={!selectedAddress?.street}
            >
              PLACE ORDER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

