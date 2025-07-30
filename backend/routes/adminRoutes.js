// routes/adminRoutes.js
import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "moretogo"; // ❗Better to use process.env.JWT_SECRET

// Register new admin
router.post('/register', registerAdmin);

// Login admin
router.post('/login', loginAdmin);

// Logout admin
router.post('/logout', logoutAdmin);

// ✅ Verify login status

router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Authenticated", adminId: decoded.id });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});


export default router;
