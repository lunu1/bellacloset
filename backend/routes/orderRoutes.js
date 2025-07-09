import express from "express";
import userAuth  from "../middlewares/userAuth.js";

import { placeOrder, getUserOrders, cancelOrder } from "../controllers/orderController.js";


const router = express.Router();

//Place a new order
router.post("/" , userAuth, placeOrder);

//Get user orders
router.get("/" , userAuth, getUserOrders);

//Cancel an order
router.put("/cancel/:orderId" , userAuth, cancelOrder);

export default router;