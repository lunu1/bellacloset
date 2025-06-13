// routes/adminRoutes.js
import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController.js';

const router = express.Router();

//Register new admin
router.post('/register', registerAdmin);
//Login admin
router.post('/login', loginAdmin);
//Logout admin
router.post('/logout', logoutAdmin); 

export default router;
