// controllers/adminController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Cookie options (dev: lax/http, prod: none/https)
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  domain: isProd ? ".bellaluxurycloset.com" : undefined, 
  secure: isProd,
   path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  
};

// Register admin (no auto-login by default)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      email,
      password: hashed,
      role: role || 'admin',
    });

    const { password: _pw, ...safe } = admin.toObject();
    return res.status(201).json({ success: true, message: 'Admin registered successfully', admin: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ✅ Login admin (sets admin_token)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    if (admin.role !== 'admin' && !admin.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admins only' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password: _pw, ...safe } = admin.toObject();

    return res
      .cookie('admin_token', token, cookieOpts)    // <— separate cookie
      .status(200)
      .json({ success: true, message: 'Login successful', admin: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ✅ Logout admin (clears admin_token)
export const logoutAdmin = (req, res) => {
  try {
 res.clearCookie("admin_token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NODE_ENV === "production" ? ".bellaluxurycloset.com" : undefined,
    path: "/",
  });
      return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ✅ Current admin data (requires adminAuth which sets req.admin)
export const getAdminData = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { password, ...safe } = req.admin.toObject();
    return res.status(200).json({ success: true, admin: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
