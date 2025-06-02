import express from "express";
import { uploadBanner, getBanner } from "../controllers/bannerController.js";
import upload from "../config/multer.config.js"; // for image upload

const bannerRouter = express.Router();

bannerRouter.post("/:section", upload.single("image"), uploadBanner);
bannerRouter.get("/:section", getBanner);

export default bannerRouter;
