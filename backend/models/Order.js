import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ fixed
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // ✅ fixed
        required: true,
      },
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant", // ✅ also check Variant model is registered
      },
      quantity: { type: Number, required: true },
      size: String,
      color: String,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"], // ✅ fixed spacing
    default: "Pending",
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  cancelledAt: Date,
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);