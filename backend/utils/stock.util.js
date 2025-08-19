// backend/utils/stock.util.js
import Product from "../models/Product.js";
import Variant from "../models/Variants.js";

/**
 * Decrement stock for each cart line.
 * - If variantId exists -> decrement Variant.stock
 * - else -> decrement Product.defaultStock
 *
 * When `session` is provided, operations are inside the Mongo transaction.
 * When `session` is NOT provided, this function will roll back already-decremented
 * lines if a later line fails.
 */
export async function checkAndDecrementStock(lines, session) {
  const decremented = []; // for manual rollback when no session

  try {
    for (const line of lines) {
      const qty = Number(line.quantity) || 0;
      if (qty <= 0) {
        const err = new Error("Invalid quantity");
        err.status = 400;
        throw err;
      }

      if (line.variantId) {
        // Variant flow
        const updated = await Variant.findOneAndUpdate(
          { _id: line.variantId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true, session }
        );
        if (!updated) {
          const err = new Error("Insufficient stock for variant");
          err.status = 409;
          err.line = line;
          throw err;
        }
        if (!session) decremented.push({ type: "variant", id: line.variantId, qty });
      } else {
        // Product fallback flow
        const updated = await Product.findOneAndUpdate(
          { _id: line.productId, defaultStock: { $gte: qty } },
          { $inc: { defaultStock: -qty } },
          { new: true, session }
        );
        if (!updated) {
          const err = new Error("Insufficient stock for product");
          err.status = 409;
          err.line = line;
          throw err;
        }
        if (!session) decremented.push({ type: "product", id: line.productId, qty });
      }
    }
  } catch (err) {
    // Manual rollback only if we are NOT in a transaction
    if (!session && decremented.length) {
      await Promise.all(
        decremented.map((d) =>
          d.type === "variant"
            ? Variant.findByIdAndUpdate(d.id, { $inc: { stock: d.qty } })
            : Product.findByIdAndUpdate(d.id, { $inc: { defaultStock: d.qty } })
        )
      );
    }
    throw err;
  }
}

/** Add stock back for each line (used when cancelling a Pending order). */
export async function restock(lines, session) {
  await Promise.all(
    lines.map((line) => {
      const qty = Number(line.quantity) || 0;
      if (!qty) return null;

      return line.variantId
        ? Variant.findByIdAndUpdate(line.variantId, { $inc: { stock: qty } }, { session })
        : Product.findByIdAndUpdate(line.productId, { $inc: { defaultStock: qty } }, { session });
    })
  );
}
