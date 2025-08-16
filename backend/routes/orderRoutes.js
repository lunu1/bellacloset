import express from "express";
import userAuth  from "../middlewares/userAuth.js";

import { placeOrder, getUserOrders, cancelOrder, getOrderById, } from "../controllers/orderController.js";


const router = express.Router();

//Place a new order
router.post("/place" , userAuth, placeOrder);

//Get user orders
router.get("/" , userAuth, getUserOrders);

//Get user order details
router.get("/:orderId" , userAuth, getOrderById);

//Cancel an order
router.put("/cancel/:orderId" , userAuth, cancelOrder);

export default router;