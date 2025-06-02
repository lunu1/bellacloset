// routes/productRoutes.js

import express from "express";
import { createProduct } from "../controllers/productController.js";
import userAuth from "../middlewares/userAuth.js";
import adminOnly from "../middlewares/adminOnly.js";

const ProductRouter = express.Router();

ProductRouter.post("/", userAuth, adminOnly, createProduct); //admin only product creation route

export default ProductRouter;
