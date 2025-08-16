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

  //cod field- archana

  paymentMethod :{
    type: String,
    enum: ["COD", "RAZORPAY", "STRIPE"],
    required: true,
  },
  paymentStatus : {
     type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },
   cod: {
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date },
  },

  
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"], // ✅ fixed spacing
    default: "Pending",
  },
  tracking: {
  carrier: String,
  trackingNumber: String,
  eta: Date,
},
statusHistory: [{
  status: { type: String, enum: ["Pending","Shipped","Delivered","Cancelled"] },
  note: String,
  at: { type: Date, default: Date.now }
}],

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