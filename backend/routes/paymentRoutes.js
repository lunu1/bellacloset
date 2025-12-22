import express from "express";
import {
  createPaymentIntent,
  capturePayment,
  cancelPayment,
} from "../controllers/paymentController.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

router.post("/create-intent",userAuth, createPaymentIntent);

// admin actions (protect these with admin auth middleware!)
router.post("/capture", adminAuth, capturePayment);
router.post("/cancel", adminAuth, cancelPayment);

export default router;
