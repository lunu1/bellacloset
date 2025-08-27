// models/BackInStock.js
import mongoose from "mongoose";

const backInStockSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    email: { type: String },                                     // for guests
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

// Unique (user, product) OR (email, product)
backInStockSchema.index(
  { user: 1, product: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);
backInStockSchema.index(
  { email: 1, product: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

export default mongoose.models.BackInStock ||
  mongoose.model("BackInStock", backInStockSchema);
