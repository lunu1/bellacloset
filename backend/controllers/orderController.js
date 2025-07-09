import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, totalAmount, address } = req.body;

    if (!products || !totalAmount || !address) {
      return res.status(400).json({ message: "Missing required order data." });
    }

    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
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
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).populate("products.productId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({ message: "Order cancelled.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
