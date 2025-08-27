// services/backInStockService.js
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Variant from "../models/Variants.js";
import BackInStock from "../models/BackInStock.js";
import sendEmail from "../utils/sendEmail.js";

const DEBUG = process.env.BACKINSTOCK_DEBUG === "1";

/**
 * Compute available stock for a product using the chosen policy.
 *
 * policy:
 *  - "max"      -> max(defaultStock, sum(variants))
 *  - "sum"      -> defaultStock + sum(variants)
 *  - "variants" -> sum(variants) only
 *  - "default"  -> defaultStock only
 *
 * Choose the one that matches how you treat stock in your shop.
 */
export async function computeProductStock(productId, policy = process.env.BACKINSTOCK_POLICY || "max") {
  // Sum ACTIVE variants (isActive !== false)
  const agg = await Variant.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: { $ne: false } } },
    { $group: { _id: "$product", stock: { $sum: { $ifNull: ["$stock", 0] } } } },
  ]);
  const variantTotal = agg?.[0]?.stock ?? 0;

  // Product default stock
  const p = await Product.findById(productId).select("defaultStock");
  const base = Number(p?.defaultStock) || 0;

  let total = 0;
  switch (String(policy).toLowerCase()) {
    case "sum":
      total = base + variantTotal;
      break;
    case "variants":
      total = variantTotal;
      break;
    case "default":
      total = base;
      break;
    case "max":
    default:
      total = Math.max(base, variantTotal);
      break;
  }

  if (DEBUG) {
    console.log("[BackInStock] computeProductStock", {
      productId: String(productId),
      policy,
      defaultStock: base,
      variantTotal,
      total,
    });
  }
  return { total, defaultStock: base, variantTotal, policy };
}

/**
 * Notify all subscribers that a product is back in stock.
 * - Skips if product is missing or inactive.
 * - Uses computeProductStock() to decide availability.
 * - Sends email via utils/sendEmail.js
 * - Clears all subscriptions for that product afterward.
 */
export async function notifyBackInStockForProduct(productId) {
  const product = await Product.findById(productId).select("_id name isActive");
  if (!product) {
    if (DEBUG) console.log("[BackInStock] product not found", productId);
    return;
  }
  if (product.isActive === false) {
    if (DEBUG) console.log("[BackInStock] product inactive, abort", productId);
    return;
  }

  const { total, defaultStock, variantTotal, policy } = await computeProductStock(productId);

  if (total <= 0) {
    if (DEBUG) console.log("[BackInStock] still out of stock (total<=0), abort", { productId: String(productId), defaultStock, variantTotal, policy });
    return;
  }

  // Find subscribers
  const subs = await BackInStock.find({ product: productId }).populate("user", "email name");
  if (DEBUG) console.log("[BackInStock] subs found", subs.length, "for product", String(productId));
  if (!subs.length) return;

  const productUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/product/${productId}`;

  const sendJobs = subs.map(async (sub) => {
    const to = sub.user?.email || sub.email;
    if (!to) {
      if (DEBUG) console.log("[BackInStock] skip sub without email", String(sub._id));
      return;
    }
    await sendEmail({
      to,
      subject: `Back in stock: ${product.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#333">
          <p>Good news! <strong>${product.name}</strong> is back in stock.</p>
          <p><a href="${productUrl}" target="_blank" style="background:#111;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none">Shop now</a></p>
          <p style="color:#666;font-size:12px;">You're receiving this because you subscribed to back-in-stock alerts.</p>
        </div>
      `,
    });
    if (DEBUG) console.log("[BackInStock] email sent to", to);
  });

  const results = await Promise.allSettled(sendJobs);
  const failures = results.filter(r => r.status === "rejected");
  if (failures.length) {
    console.error("[BackInStock] email failures:", failures.map(f => f.reason));
  }

  // Clear all subs for this product so users aren’t notified multiple times
  await BackInStock.deleteMany({ product: productId });
  if (DEBUG) console.log("[BackInStock] subs cleared for product", String(productId));
}

/**
 * Optional helper: sweep all products that currently have subscriptions.
 * Useful for a cron job if stock can change outside your normal update flows.
 */
export async function sweepAndNotifyAll() {
  const subs = await BackInStock.find().select("product").lean();
  const unique = [...new Set(subs.map(s => String(s.product)))];
  if (DEBUG) console.log("[BackInStock] sweep unique products", unique.length);
  for (const pid of unique) {
    try {
      await notifyBackInStockForProduct(pid);
    } catch (e) {
      console.error("[BackInStock] sweep error for", pid, e);
    }
  }
}
