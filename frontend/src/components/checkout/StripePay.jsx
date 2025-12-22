import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

export default function StripePay({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const requestOrder = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    toast.dismiss();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setLoading(false);
      return;
    }

    const st = paymentIntent?.status;

    if (st === "requires_capture") {
      toast.success("Order request received! Payment authorized (not charged yet).");
      await onSuccess(paymentIntent.id);
      setLoading(false);
      return;
    }

    if (st === "succeeded") {
      toast.success("Payment successful!");
      await onSuccess(paymentIntent.id);
      setLoading(false);
      return;
    }

    toast.info(`Payment status: ${st}`);
    setLoading(false);
  };

  return (
    <div className="mt-6 border p-4">
      <div className="text-sm font-medium mb-2">Pay by Card</div>

      <div className="text-xs text-gray-600 mb-3">
        Your payment will only be processed once we confirm your item’s availability.
      </div>

      <PaymentElement />

      <button
        className="mt-4 w-full py-3 bg-black text-white disabled:opacity-50"
        onClick={requestOrder}
        disabled={!stripe || !elements || loading}
      >
        {loading ? "Processing..." : `Request Order (AED ${amount})`}
      </button>
    </div>
  );
}
