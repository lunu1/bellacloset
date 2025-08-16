import express from "express";
import upload from "../config/multer.config.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  reorderCategories, // ✅ add this
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", upload.single("image"), createCategory);
router.get("/", getCategories);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

// ✅ New reorder route
router.post("/reorder", reorderCategories);

export default router;
