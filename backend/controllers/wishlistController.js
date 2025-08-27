// controllers/wishlistController.js
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import Variant from "../models/Variants.js";
import BackInStock from "../models/BackInStock.js"; // new (see model below)

/** Compute current stock for a product (variants sum if you use variants, else defaultStock) */
async function computeStock(productId) {
  // If you don't use variants stock, return product.defaultStock instead.
  const total = await Variant.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: { $ne: false } } },
    { $group: { _id: "$product", stock: { $sum: { $ifNull: ["$stock", 0] } } } },
  ]);
  return total?.[0]?.stock ?? 0;
}

/** Build the shaped wishlist item the client will render */
async function shapeWishlistItem(doc) {
  const p = doc.product || null;                // may be null if hard-deleted
  const productMissing = !p;
  const productInactive = !!p && p.isActive === false;

  let status = "ok";
  let stock = 0;

  if (productMissing || productInactive) {
    status = "product_unavailable";
  } else {
    // compute stock
    stock = await computeStock(p._id);
    status = stock <= 0 ? "out_of_stock" : "ok";
  }

  return {
    wishlistId: String(doc._id),
    productId: String(p?._id || doc.product),   // keep raw id if product missing
    status,                                     // 'ok' | 'out_of_stock' | 'product_unavailable'
    stock,
    product: p
      ? { _id: p._id, name: p.name, images: p.images ?? [], isActive: p.isActive !== false }
      : null,
    createdAt: doc.createdAt,
  };
}

/** POST /api/wishlist */
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID is required." });

    const exists = await Wishlist.findOne({ user: userId, product: productId });
    if (exists) return res.status(400).json({ message: "Product already in wishlist." });

    const item = await Wishlist.create({ user: userId, product: productId });
    const populated = await item.populate({ path: "product", select: "name images isActive" });
    const shaped = await shapeWishlistItem(populated);
    res.status(201).json({ item: shaped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** GET /api/wishlist */
export const getwishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const docs = await Wishlist.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "product", select: "name images isActive defaultStock" });

    const shaped = [];
    for (const d of docs) shaped.push(await shapeWishlistItem(d));
    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** DELETE /api/wishlist/:productId OR body { wishlistId } */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { wishlistId } = req.body || {};

    let query = { user: userId };
    if (wishlistId) query._id = wishlistId;
    else query.product = productId;

    const result = await Wishlist.findOneAndDelete(query);
    if (!result) return res.status(404).json({ message: "Item not found in Wishlist." });

    res.status(200).json({ message: "Removed from wishlist successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
