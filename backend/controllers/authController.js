import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import createToken from "../utils/createToken.util.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;  // Ensure 'name' is used

  try {
    const existingUser = await userModel.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword });

    const token = createToken({ id: user._id, role: user.role });  

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions={
      from : process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to MERN Auth",
      text:`Welcome to greatstack website. Your account has been created successfully with email id: ${email}`
    }

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ success: true, message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and Password required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect Password" });
    }

    const token = createToken({ id: user._id, role: user.role }); // 2

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: "Login successful" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.status(200).json({ success: true, message: "User logged out" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//Send Verification OTP
export const sendVerifyOtp = async (req, res) => {
  try {
         const {userId}= req.body;

         const user = await userModel.findById(userId);

         if(user.isAccountVerified){
          return res.json({ success: false, message: "User is already verified" });
         }

         const otp = Math.floor(100000 + Math.random() * 900000);

         user.verifyOtp = otp;
         user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000;

         await user.save();

         const mailOptions={
          from : process.env.SENDER_EMAIL,
          to: user.email,
          subject: "Account Verification OTP",
          text:`your otp : ${otp}. Verify your account`
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    
  }
  catch (error) {
       res.json({success:true, message:error.message})
  }
}

//verify acc by using otp
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  if(!userId || !otp){
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {

    const user = await userModel.findById(userId);

    if(!user){
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if(user.isAccountVerified){
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    if(user.verifyOtp=== "" || user.verifyOtp !== otp){
      res.json({success:false, message:"Invalid OTP"})
    }

    if(user.verifyOtpExpiry < Date.now()){
      res.json({success:false, message:"OTP expired"})
    }

    user.isAccountVerified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });

}
  catch (error) {
       res.json({success:false, message:error.message})
  }
}


//check if user is authenticated
export const isAuthenticated = async (req,res) => {
  try {
    return res.status(200).json({ success: true, message: "User is authenticated" });
  }catch{
    res.json({success:false, message:errorMonitor.message});
  }
}


//Reset Otp

export const ResetOtp = async (req,res)=>{
   
    const {email} = req.body;

    if(!email){
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    try{
      
      const user = await userModel.findOne({email});

      if(!user){
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000);

      user.resetOtp = otp;

      user.resetOtpExpiryAt = Date.now() + 15 * 60 * 1000;

      await user.save();

      const mailOptions={
        from : process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset OTP",
        text:`your otp : ${otp}. Reset your password`
      }

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ success: true, message: "OTP sent successfully" });

    }catch{
       return res.json({success:false, message:error.message})
    }

}

//Reset Password
export const resetPassword = async (req,res)=>{

  const {email, otp, newPassword} = req.body;

  if(!email || !otp || !newPassword){
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try{

    const user = await userModel.findOne({email});

    if(!user){
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if(user.resetOtp === "" || user.resetOtp !== otp){
      return res.json({success:false, message:"Invalid OTP"})
    }

    if(user.resetOtpExpiryAt < Date.now()){
      return res.json({success:false, message:"OTP expired"})
    }

     const hashPassword = await bcrypt.hash(newPassword, 10);

     user.password = hashPassword;
     user.resetOtp = "";
     user.resetOtpExpiryAt = 0;

     await user.save();

     return res.status(200).json({ success: true, message: "Password reset successfully" });


  }catch{
    return res.json({success:false, message:error.message}) 
  }

}