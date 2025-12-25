// backend/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
    quantity: { type: Number, required: true },
    size: String,
    color: String,
  }],
  totalAmount: { type: Number, required: true },
  paymentIntentId: { type: String },


    paymentMethod: { type: String, 
    enum: ["COD", "STRIPE"], 
    required: true },
  paymentStatus: { type: String, 
    enum: ["Pending","Authorized", "Paid", "Failed", "Refunded","Cancelled"], 
    default: "Pending" },
  cod: {
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date },
  },

  status: { type: String,
  enum: ["Pending","Pending_Confirmation", "Shipped", "Delivered", "Cancelled"], 
  default: "Pending" },
  cancelledAt: { type: Date },

  tracking: { carrier: String, trackingNumber: String, eta: Date },
  statusHistory: [{
    status: { type: String, 
      enum: ["Pending","Pending_Confirmation","Shipped","Delivered","Cancelled"] },
    note: String,
    at: { type: Date, default: Date.now }
  }],

 // address: { street: String, city: String, state: String, zip: String, country: String },

 address: {
  label: String,
  fullName: { type: String, required: true },
  phone: { type: String, required: true },

  addressType: { type: String, enum: ["apartment", "villa", "office"] },

  unitNumber: { type: String, required: true },
  buildingName: { type: String, required: true },

  area: { type: String, required: true },
  city: { type: String, required: true }, // Dubai/Abu Dhabi
  emirate: {
    type: String,
    enum: [
      "Abu Dhabi",
      "Dubai",
      "Sharjah",
      "Ajman",
      "Fujairah",
      "Ras Al Khaimah",
      "Umm Al Quwain",
    ],
    required: true,
  },

  street: String,      // optional
  landmark: String,    // optional
  poBox: String,       // optional
  postalCode: String,  // optional

  formatted: String,   // optional (nice for invoices)
},


  // Pricing snapshot
  pricing: {
    subtotal: Number,
    shippingFee: Number,
    shippingMethod: { code: String, label: String },
    deliveryEta: String,
    taxAmount: Number,
    taxRate: Number, // store percent (e.g., 5)
    taxMode: { type: String, enum: ["tax_exclusive"], default: "tax_exclusive" },
    grandTotal: Number
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
