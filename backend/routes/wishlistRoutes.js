import express from "express";

import { addToWishlist, getwishlist, removeFromWishlist } from "../controllers/wishlistController.js";

import userAuth from "../middlewares/userAuth.js";

const router = express.Router();
// Add a product to the wishlist
router.post("/", userAuth, addToWishlist);
// Get the user's wishlist
router.get("/", userAuth, getwishlist);
// Remove a product from the wishlist
router.delete("/:productId", userAuth, removeFromWishlist);

export default router;