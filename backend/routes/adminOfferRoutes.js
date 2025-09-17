import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { createOffer, listOffers, updateOffer, deleteOffer, getOffer } from "../controllers/offerController.js";

const router = express.Router();

router.get("/",      userAuth, listOffers);
router.get("/:id",   userAuth, getOffer);
router.post("/",     userAuth, createOffer);
router.put("/:id",   userAuth, updateOffer);
router.delete("/:id", userAuth, deleteOffer);

export default router;
