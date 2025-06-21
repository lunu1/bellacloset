import express from "express";
import upload from "../config/multer.config.js";
import { createCategory, getCategories, updateCategory, deleteCategory  } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/",upload.single("image"), createCategory);

router.get("/", getCategories);
// Update a category
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

export default router;