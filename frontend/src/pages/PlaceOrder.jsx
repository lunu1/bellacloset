// src/pages/PlaceOrder.jsx
import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { AppContext } from "../context/AppContext";
import { useSelector } from "react-redux";

import AddressPicker from "../components/checkout/AddressPicker";
import OrderItemsSummary from "../components/checkout/OrderItemsSummary";
import PaymentSelector from "../components/checkout/PaymentSelector";
import { computePricingPreview,adaptSettingsToPreview } from "../utils/pricingPreview";
import useShopSettings from "../hooks/useShopSettings";
import { adaptSettingsForPreview } from "../utils/settingAdapter";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const { state } = useLocation();

  const cartItems = useSelector((s) => s.cart.items);
  // const settings   = useSelector((s) => s.settings.data); // currency/tax/shipping/delivery



  // selected address from AddressPicker
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [method, setMethod] = useState("cod"); // keep uppercase to match backend

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
      price: typeof ln.unitPrice === "number" ? ln.unitPrice : 0, // CartTotal expects `price`
      quantity: ln.quantity || 1,
      thumbnail: ln.product?.images?.[0] || "/placeholder.jpg",
      // Optional attribute snapshots (if present)
      size: ln.variant?.optionValues?.Size || ln.size,
      color: ln.variant?.optionValues?.Color || ln.color,
    }));
}, [cartItems]);


  // Items chosen either from "Buy Now" or whole cart
  // Items chosen either from "Buy Now" (via router state) or entire cart
const itemsForCheckout = useMemo(() => {
  if (state?.productId) {
    return [{
      productId: state.productId,
      variantId: state.variantId,
      name: state.productName || "Item",
      price: Number(state.price) || 0, // key rename -> price
      quantity: Number(state.quantity) || 1,
      thumbnail: state.thumbnail || "/placeholder.jpg",
      size: state.size,
      color: state.color,
    }];
  }
  // ✅ default to normalized cart lines
  return sourceLines;
}, [state, sourceLines]);


  // Compute totals with live settings (cart total UI already does this visually)
  const pricing = useMemo(() =>{
    const adapted = settings && (settings.shipping || settings.tax)
      ? adaptSettingsToPreview(settings) // backend shape
      :undefined; // already preview shape or null
    return computePricingPreview(itemsForCheckout, adapted);
  }, [itemsForCheckout, settings]);

  const placeOrder = async () => {
    if (!selectedAddress?.street) {
      toast.error("Please provide a valid delivery address.");
      return;
    }
    if (!itemsForCheckout?.length) {
      toast.error("No items to checkout.");
      return;
    }

    // normalize / guard payment method for backend
    const normalizedMethod = String(method || "cod").toUpperCase();

    const products = itemsForCheckout.map(it => ({
      productId: it.productId,
      variantId: it.variantId,
      size: it.size,
      color: it.color,
      quantity: it.quantity,
    }));

    const orderData = {
      products,
      // Send the final computed total; backend should still re-compute/validate
      totalAmount: pricing.grandTotal,
      address: selectedAddress,
      paymentMethod: normalizedMethod,     // "COD" | "RAZORPAY" | "STRIPE"
      codConfirmed: normalizedMethod === "COD",

      // Optional: send breakdown for transparency (backend may store/ignore)
      pricing: {
        subtotal: pricing.subtotal,
        shippingFee: pricing.shippingFee,
        taxAmount: pricing.taxAmount,
        taxRate: pricing.taxRate,
        taxMode: pricing.taxMode,
        shippingMethod: pricing.shippingMethod,
        deliveryEta: pricing.deliveryEta,
        grandTotal: pricing.grandTotal,
        currency:  "AED",
      },
    };

    try {
      let created;
try {
  // Prefer REST-y route if your router exposes it
          const res = await axios.post(
            `${backendUrl}/api/order`,
            orderData,
            { withCredentials: true }
          );
          created = res.data;
        } catch (err) {
          // Legacy fallback to /api/order/place
          if (err?.response?.status === 404) {
            const res2 = await axios.post(
              `${backendUrl}/api/order/place`,
              orderData,
              { withCredentials: true }
            );
            created = res2.data;
          } else {
            throw err;
          }
        }

      toast.dismiss();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${created._id}`, { state: { justPlaced: true } });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to place order");
      console.error(e);
    }
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
        {/* CartTotal already renders using settings via applyPricing */}
        <CartTotal items={itemsForCheckout} settings={settings}  currency="AED"/>

        <PaymentSelector method={method} setMethod={setMethod} />

        <div className="w-full text-end">
          <button
            className="px-16 py-3 my-8 text-sm text-white bg-black disabled:opacity-50"
            onClick={placeOrder}
            disabled={!selectedAddress?.street}
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </div>
  );
}
