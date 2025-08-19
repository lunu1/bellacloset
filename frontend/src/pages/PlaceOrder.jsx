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

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const { state } = useLocation();
  const cartItems = useSelector((s) => s.cart.items);

  // selected address from AddressPicker
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [method, setMethod] = useState("cod");

  // Items chosen either from "Buy Now" or whole cart
  const itemsForCheckout = useMemo(() => {
    return state?.productId
      ? [{
          productId: state.productId,
          variantId: state.variantId,
          name: state.productName,
          price: Number(state.price) || 0,
          quantity: Number(state.quantity) || 1,
          thumbnail: state.thumbnail,
          size: state.size,
          color: state.color,
        }]
      : cartItems;
  }, [state, cartItems]);

  const placeOrder = async () => {
    if (!selectedAddress?.street) {
      toast.error("Please provide a valid delivery address.");
      return;
    }
    if (!itemsForCheckout?.length) {
      toast.error("No items to checkout.");
      return;
    }

    const products = itemsForCheckout.map(it => ({
      productId: it.productId,
      variantId: it.variantId,
      size: it.size,
      color: it.color,
      quantity: it.quantity,
    }));

    const totalAmount = itemsForCheckout.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );

    const orderData = {
      products,
      totalAmount,
      address: selectedAddress,
      paymentMethod: method,
      codConfirmed: method === "cod",
    };

    try {
      const { data: created } = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { withCredentials: true }
      );
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
        <CartTotal items={itemsForCheckout} />

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
