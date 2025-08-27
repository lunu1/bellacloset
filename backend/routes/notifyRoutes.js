// routes/notifyRoutes.js
import express from "express";
import userAuth from "../middlewares/userAuth.js"; // allow guest? then make it optional
import { subscribeBackInStock } from "../controllers/notifyController.js";

const router = express.Router();
router.post("/subscribe", userAuth, subscribeBackInStock); 
export default router;
