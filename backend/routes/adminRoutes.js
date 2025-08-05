// routes/adminRoutes.js
import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin, getAdminData } from '../controllers/adminController.js';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "moretogo"; 

// Register new admin
router.post('/register', registerAdmin);

// Login admin
router.post('/login', loginAdmin);

// Logout admin
router.post('/logout', logoutAdmin);


//  Verify login status

router.get("/is-auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Authenticated", adminId: decoded.id });
  } catch (err) {
    console.error("JWT verification failed in /data:", err.message);
    res.status(401).json({ success: false, message: "Invalid token: " + err.message });
  }
});

// ✅ Route to get admin data (called after login or on page refresh)
router.get("/data", async (req, res) => {
   

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, admin });
  } catch (err) {
    console.error("JWT verification failed in /data:", err.message);
   res.status(401).json({ success: false, message: "Invalid token: " + err.message });
  }
});



export default router;
