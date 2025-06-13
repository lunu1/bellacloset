import mongoose from "mongoose";



// Sub-schema for Address
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  isDefault : {
    type: Boolean,
    default:false

  }
});

// Sub-schema for Order
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  totalPrice: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
});




const userSchema = new mongoose.Schema({
    name: { type: String, required: true },  // Ensure 'name' matches register function
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiry: { type: Date, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" }, 
    resetOtpExpiryAt: { type: Number, default: 0 },
    //to check isAdmin
    // isAdmin: { type:Boolean, default:false}
    role: { type: String, enum: ['user', 'admin'], default:'user'},
    isBlocked: { type: Boolean, default: false },
 
    // New fields
  addresses: [addressSchema],   // Array of addresses
  orders: [orderSchema],         // Array of orders

});

const userModel = mongoose.models.User || mongoose.model("User", userSchema, "users"); 

export default userModel;
