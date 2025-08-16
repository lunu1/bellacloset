import Order from "../models/Order.js";
import mongoose from "mongoose";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, totalAmount, address, paymentMethod, codConfirmed } = req.body;

    if (!products?.length || totalAmount == null || !address || !paymentMethod) {
      return res.status(400).json({ message: "Missing required order data." });
    }

    const method = String(paymentMethod).toUpperCase();
    if (method === "COD" && !codConfirmed) {
      return res.status(400).json({ message: "COD must be confirmed before placing the order." });
    }

    const order = await Order.create({
      user: userId,
      products,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: method,
      paymentStatus: method === "COD" ? "Pending" : "Paid",
      cod: {
        confirmed: method === "COD" ? !!codConfirmed : false,
        confirmedAt: method === "COD" && codConfirmed ? new Date() : undefined,
      },
      status: "Pending",
      address,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("products.productId")
      .populate("products.variantId");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
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

    const updated = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { $set: { status: "Cancelled", cancelledAt: new Date() } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Order cancelled.", order: updated }); // <-- return updated
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: err.message });
  }
};
