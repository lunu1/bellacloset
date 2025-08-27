// controllers/notifyController.js
import BackInStock from "../models/BackInStock.js";
import Product from "../models/Product.js";

export const subscribeBackInStock = async (req, res) => {
  try {
    const userId = req.user?._id || null; // allow guests if userAuth is optional
    const { productId, email } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    const product = await Product.findById(productId).select("_id name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!userId && !email) {
      return res.status(400).json({ message: "email is required for guests" });
    }

    const doc = await BackInStock.findOneAndUpdate(
      { ...(userId ? { user: userId } : { email }), product: productId },
      { $setOnInsert: { user: userId || undefined, email: userId ? undefined : email, product: productId } },
      { upsert: true, new: true }
    );

    res.json({ ok: true, subscribed: true, id: doc._id });
  } catch (err) {
    if (err.code === 11000) return res.json({ ok: true, subscribed: true, already: true });
    res.status(500).json({ message: err.message });
  }
};
