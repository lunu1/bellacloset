import Stripe from "stripe";
import { getStoreSettings, computeServerSubtotal, buildPricingSnapshot } from "../utils/pricing.util.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { products, currency = "aed", metadata = {} } = req.body;

    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    // ✅ compute server pricing (same logic as placeOrder)
    const [settings, subtotal] = await Promise.all([
      getStoreSettings(),
      computeServerSubtotal(products),
    ]);

    const pricing = buildPricingSnapshot({ subtotal, settings });
    const totalAmount = Number(pricing.grandTotal || 0);

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const amountInSmallestUnit = Math.round(totalAmount * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: String(currency || "aed").toLowerCase(),
      capture_method: "manual",
      // ✅ easiest: card only (removes redirect requirements)
      payment_method_types: ["card"],
      metadata: {
        ...metadata,
        userId: String(req.user._id),
      },
    });

    return res.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      status: intent.status,
      pricing, // optional, helpful for debug
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
