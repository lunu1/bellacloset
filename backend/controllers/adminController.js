// controllers/adminController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

const JWT_SECRET = "moretogo"; // keep this in .env

// Register admin
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

    // ✅ Set token as HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // set to true if using HTTPS
        sameSite: "lax", // or "strict"
        maxAge: 3600000, // 1 hour
      })
      .status(200)
      .json({ message: 'Login successful', admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// export const verifyAdmin = (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1]; // read from header
//     if (!token) return res.status(401).json({ message: 'No token' });

//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.status(200).json({ message: 'Token verified', adminId: decoded.id });
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };





// Logout admin (client-side should handle token deletion)
// export const logoutAdmin = (req, res) => {
//     res.status(200).json({ message: 'Logout successful' });
// };

// ✅ backend/controllers/adminController.js
// Logout admin
export const logoutAdmin = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};
