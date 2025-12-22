// backend/controllers/orderController.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import userModel from "../models/userModel.js";
import { emailOrderCancelled, emailOrderConfirmed, emailOrderRequested } from "../services/email.service.js";
import { checkAndDecrementStock, restock } from "../utils/stock.util.js";
import Cart from "../models/cartModel.js";
import Stripe from "stripe";
// import Setting from "../models/Setting.js";

import { getStoreSettings, computeServerSubtotal, buildPricingSnapshot } from "../utils/pricing.util.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper: remove purchased items from user's cart
async function removePurchasedFromCart(userId, purchased, session = null) {
  const cart = await Cart.findOne({ user: userId }).session(session || null);
  if (!cart) return;

  for (const p of purchased) {
    const pid = String(p.productId);
    const vid = String(p.variantId || "");

    const idx = cart.items.findIndex(
      (i) => String(i.product) === pid && String(i.variant || "") === vid
    );

    if (idx > -1) {
      const newQty = (cart.items[idx].quantity || 0) - Number(p.quantity || 0);
      if (newQty > 0) {
        cart.items[idx].quantity = newQty;   // just reduce qty
      } else {
        cart.items.splice(idx, 1);           // remove if <= 0
      }
    }
  }

  await cart.save({ session: session || undefined });
}



// export const placeOrder = async (req, res) => {
//   const session = await mongoose.startSession();
//   try {
//     const userId = req.user._id;
//     const { products, totalAmount, address, paymentMethod, codConfirmed } = req.body;

//     if (!products?.length || totalAmount == null || !address || !paymentMethod) {
//       return res.status(400).json({ message: "Missing required order data." });
//     }

//     const method = String(paymentMethod).toUpperCase();
//     if (method === "COD" && !codConfirmed) {
//       return res.status(400).json({ message: "COD must be confirmed before placing the order." });
//     }

//     let createdOrder;

//     // Try transactional path first
//     try {
//       await session.withTransaction(async () => {
//         // 1) Atomically check & decrement stock
//         await checkAndDecrementStock(products, session);

//         // 2) Create order in the same transaction
//         const [order] = await Order.create(
//           [{
//             user: userId,
//             products,
//             totalAmount: Number(totalAmount) || 0,
//             paymentMethod: method,
//             paymentStatus: method === "COD" ? "Pending" : "Paid",
//             cod: {
//               confirmed: method === "COD" ? !!codConfirmed : false,
//               confirmedAt: method === "COD" && codConfirmed ? new Date() : undefined,
//             },
//             status: "Pending",
//             address,
//             statusHistory: [{ status: "Pending", note: "Order placed" }],
//           }],
//           { session }
//         );

//         createdOrder = order;

//         // 3) Remove purchased items from user's cart
//         await removePurchasedFromCart(userId, products, session);


//       });
//     } catch (trxErr) {
//       // Fallback when local MongoDB has no replica set / transactions
//       const msg = String(trxErr?.message || "");
//       if (msg.includes("Transaction numbers are only allowed") || trxErr?.code === 20) {
//         try {
//           // Safe non-transaction path (helper does manual rollback on failure)
//           await checkAndDecrementStock(products, null);

//           createdOrder = await Order.create({
//             user: userId,
//             products,
//             totalAmount: Number(totalAmount) || 0,
//             paymentMethod: method,
//             paymentStatus: method === "COD" ? "Pending" : "Paid",
//             cod: {
//               confirmed: method === "COD" ? !!codConfirmed : false,
//               confirmedAt: method === "COD" && codConfirmed ? new Date() : undefined,
//             },
//             status: "Pending",
//             address,
//             statusHistory: [{ status: "Pending", note: "Order placed" }],
//           });
//           // Remove purchased items from user's cart
//           await removePurchasedFromCart(userId, products, null);
//         } catch (fallbackErr) {
//           return res.status(fallbackErr.status || 500).json({
//             message: fallbackErr.message || "Order failed",
//             details: fallbackErr.line ? { line: fallbackErr.line } : undefined,
//           });
//         }
//       } else {
//         throw trxErr;
//       }
//     } finally {
//       session.endSession();
//     }

//     // Fire-and-forget email (do not block HTTP response)
//     (async () => {
//       try {
//         const user = await userModel.findById(userId).select("name email");
//         if (user?.email) {
//           const orderForEmail = await Order.findById(createdOrder._id)
//             .populate("products.productId", "name price")
//             .populate("products.variantId", "price");
//           await emailOrderConfirmed({ to: user.email, order: orderForEmail, user });
//         }
//       } catch (e) {
//         console.error("Order confirmation email failed:", e?.message);
//       }
//     })();

//     return res.status(201).json(createdOrder);
//   } catch (err) {
//     session.endSession();
//     return res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * GET /api/order
//  * - Returns the current user's orders (most recent first)
//  */
 export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("products.productId")
      .populate("products.variantId");

    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
 }




export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { products, address, paymentMethod, codConfirmed, paymentIntentId } = req.body;

    if (!products?.length || !address || !paymentMethod) {
      return res.status(400).json({ message: "Missing required order data." });
    }

    const method = String(paymentMethod).toUpperCase();

    // COD requires confirm
    if (method === "COD" && !codConfirmed) {
      return res.status(400).json({ message: "COD must be confirmed before placing the order." });
    }

    // Stripe requires paymentIntentId
    if (method === "STRIPE" && !paymentIntentId) {
      return res.status(400).json({ message: "Missing paymentIntentId for Stripe order." });
    }

    // 1) Compute server-side pricing
    const [settings, subtotal] = await Promise.all([
      getStoreSettings(),
      computeServerSubtotal(products),
    ]);
    const pricing = buildPricingSnapshot({ subtotal, settings });
    const totalAmount = pricing.grandTotal;

    // 2) Decide status/payment fields by method
    let status = "Pending";
    let paymentStatus = "Pending";
    let cod = { confirmed: false };
    let stripeFields = {};

  if (method === "COD") {
  cod = {
    confirmed: !!codConfirmed,
    confirmedAt: codConfirmed ? new Date() : undefined,
  };
}


 if (method === "STRIPE") {
  // ✅ verify this intent is truly authorized (manual capture)
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (pi.status !== "requires_capture") {
    return res.status(400).json({ message: `Stripe not authorized: ${pi.status}` });
  }

  const expected = Math.round(Number(totalAmount) * 100);
  if (pi.amount !== expected) {
    return res.status(400).json({ message: "Payment amount mismatch" });
  }

  status = "Pending_Confirmation";
  paymentStatus = "Authorized";
  stripeFields = { paymentIntentId };
}



    // ✅ Build base payload AFTER status is final (so history is correct)
    const base = {
      user: userId,
      products,
      totalAmount,
      paymentMethod: method,
      address,
      pricing,
      statusHistory: [{ status, note: "Order placed" }],
      cod,
      paymentStatus,
      ...stripeFields,
      status,
    };

    let createdOrder;

    // 3) Transaction first
    try {
      await session.withTransaction(async () => {
        await checkAndDecrementStock(products, session);

        const [order] = await Order.create([base], { session });
        createdOrder = order;

        await removePurchasedFromCart(userId, products, session);
      });
    } catch (trxErr) {
      const msg = String(trxErr?.message || "");
      if (msg.includes("Transaction numbers are only allowed") || trxErr?.code === 20) {
        // 4) Fallback without transactions
        await checkAndDecrementStock(products, null);

        createdOrder = await Order.create(base);
        await removePurchasedFromCart(userId, products, null);
      } else {
        throw trxErr;
      }
    } finally {
      session.endSession();
    }

    
// 5) Email async
(async () => {
  try {
    const user = await userModel.findById(userId).select("name email");
    if (!user?.email) return;

    const orderForEmail = await Order.findById(createdOrder._id)
      .populate("products.productId", "name images")
      .populate("products.variantId", "price");

    const isStripeRequest =
      createdOrder.paymentMethod === "STRIPE" &&
      createdOrder.paymentStatus === "Authorized" &&
      createdOrder.status === "Pending_Confirmation";

    if (isStripeRequest) {
      await emailOrderRequested({ to: user.email, order: orderForEmail, user });
    } else {
      await emailOrderConfirmed({ to: user.email, order: orderForEmail, user });
    }
  } catch (e) {
    console.error("Order email failed:", e?.message);
  }
})();


    return res.status(201).json(createdOrder);
  } catch (err) {
    session.endSession();
    console.error("placeOrder error:", err);
    return res.status(500).json({ message: err.message || "Order failed" });
  }
};



/**
 * GET /api/order/:orderId
 * - Returns one order (owned by the current user)
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("products.productId", "name images price")
      .populate("products.variantId", "images price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/order/cancel/:orderId
 * - Only Pending orders can be cancelled by the user
 * - Restocks quantities, updates status/history, emails user
 */
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res.status(409).json({ message: "Order cannot be cancelled now." });
    }

    if (order.paymentMethod === "STRIPE" && order.paymentStatus === "Authorized" && order.paymentIntentId) {
  try {
    await stripe.paymentIntents.cancel(order.paymentIntentId);
    order.paymentStatus = "Cancelled";
  } catch (e) {
    return res.status(500).json({ message: "Failed to cancel payment authorization" });
  }
}


    let updated;

    // Prefer transactional restock + cancel
    try {
      await session.withTransaction(async () => {
        await restock(order.products, session);
        updated = await Order.findByIdAndUpdate(
          order._id,
          {
            $set: { status: "Cancelled", cancelledAt: new Date() },
            $push: { statusHistory: { status: "Cancelled", note: "Cancelled by user" } },
          },
          { new: true, session }
        );
      });
    } catch {
      // Fallback non-transaction path
      await restock(order.products, null);
      updated = await Order.findByIdAndUpdate(
        order._id,
        {
          $set: { status: "Cancelled", cancelledAt: new Date() },
          $push: { statusHistory: { status: "Cancelled", note: "Cancelled by user" } },
        },
        { new: true }
      );
    } finally {
      session.endSession();
    }

    // Fire-and-forget email
    (async () => {
      try {
        const user = await userModel.findById(userId).select("name email");
        if (user?.email) await emailOrderCancelled({ to: user.email, order: updated, user });
      } catch (e) {
        console.error("Cancel email failed:", e?.message);
      }
    })();

    return res.status(200).json({ message: "Order cancelled.", order: updated });
  } catch (err) {
    session.endSession();
    return res.status(500).json({ message: err.message });
  }
};

