import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";

export default function StripePay({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const payNow = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    toast.dismiss();

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      // ✅ Manual capture flow (authorize only)
      if (paymentIntent?.status === "requires_capture") {
        toast.success("Order request received! Payment authorized (not charged yet).");
        await onSuccess(paymentIntent.id); // create order as PENDING_CONFIRMATION
        return;
      }

      // Fallback: if you ever use automatic capture in future
      if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful!");
        await onSuccess(paymentIntent.id); // create order as PAID
        return;
      }

      toast.info(`Payment status: ${paymentIntent?.status || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border p-4">
      <div className="text-sm font-medium mb-3">Pay by Card</div>

      <PaymentElement />

      <p className="mt-2 text-xs text-gray-600">
        Your payment will only be processed once we confirm your item’s availability.
      </p>

      <button
        className="mt-4 w-full py-3 bg-black text-white disabled:opacity-50"
        onClick={payNow}
        disabled={!stripe || !elements || loading}
      >
        {loading ? "Processing..." : `Request Order (AED ${amount})`}
      </button>
    </div>
  );
}
