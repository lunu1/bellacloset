import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { stripePromise } from "../../stripe";
import StripePay from "./StripePay";

export default function StripeCheckout({ backendUrl, amount, orderData, onSuccess }) {
  const [clientSecret, setClientSecret] = useState("");
  const [initing, setIniting] = useState(false);

  const itemsCount = orderData?.products?.length || 0;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIniting(true);
        const res = await axios.post(
          `${backendUrl}/api/payment/create-intent`,
          {
            products: orderData.products,
            currency: "aed",
            metadata: { items: String(itemsCount) },
          },
          { withCredentials: true }
        );

        if (alive) setClientSecret(res.data.clientSecret);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Stripe init failed");
      } finally {
        if (alive) setIniting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [backendUrl, amount, itemsCount]);

  useEffect(() => {
  setClientSecret("");
}, [amount]);
  if (initing && !clientSecret) return <div className="mt-6 border p-4">Loading payment…</div>;
  if (!clientSecret) return null;




  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePay amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
}
