import mongoose from "mongoose";

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
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema, "users");  // Ensure correct collection name

export default userModel;
