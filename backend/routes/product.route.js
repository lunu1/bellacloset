import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getSearchSuggestions
} from "../controllers/productController.js";

const router = express.Router();

router.post("/create", createProduct);
router.get("/search", searchProducts);
router.get('/suggestions',getSearchSuggestions)
router.get("/all", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);


export default router;