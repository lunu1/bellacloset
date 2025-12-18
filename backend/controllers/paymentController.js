import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "aed", metadata = {} } = req.body;

    const n = Number(amount);
    if (!n || n <= 0) return res.status(400).json({ message: "Invalid amount" });

    const amountInSmallestUnit = Math.round(n * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency,
      capture_method: "manual", // ✅ authorize only
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return res.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id, // handy for debugging/admin
      status: intent.status,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Stripe error" });
  }
};

export const capturePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: "paymentIntentId is required" });

    // Optional: check current status first
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "requires_capture") {
      return res.status(400).json({
        message: `Cannot capture. PaymentIntent status is ${pi.status}`,
      });
    }

    const captured = await stripe.paymentIntents.capture(paymentIntentId);
    return res.json({ status: captured.status, id: captured.id });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Capture failed" });
  }
};

export const cancelPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: "paymentIntentId is required" });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Only cancel if not already captured
    if (["succeeded"].includes(pi.status)) {
      return res.status(400).json({ message: "Cannot cancel a succeeded (captured) payment." });
    }

    const cancelled = await stripe.paymentIntents.cancel(paymentIntentId);
    return res.json({ status: cancelled.status, id: cancelled.id });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Cancel failed" });
  }
};
