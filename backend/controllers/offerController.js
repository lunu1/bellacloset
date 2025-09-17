import Offer from "../models/Offer.js";
import { fetchActiveOffers } from "../utils/offer.util.js";

export const listOffers = async (_req, res) => {
  try {
    const items = await Offer.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const getOffer = async (req, res) => {
  try {
    const it = await Offer.findById(req.params.id).lean();
    if (!it) return res.status(404).json({ message: "Offer not found" });
    res.json(it);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const createOffer = async (req, res) => {
  try {
    const body = req.body || {};

    // normalize scope
    if (!body.scope || !body.scope.kind) {
      body.scope = { kind: "all", categories: [], products: [], includeDescendants: true };
    } else if (body.scope.kind === "categories") {
      body.scope.products = [];
      body.scope.includeDescendants = body.scope.includeDescendants !== false;
    } else if (body.scope.kind === "products") {
      body.scope.categories = [];
      body.scope.includeDescendants = true;
    } else {
      body.scope = { kind: "all", categories: [], products: [], includeDescendants: true };
    }

    const o = await Offer.create(body);
    res.status(201).json(o);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const updateOffer = async (req, res) => {
  try {
    const body = { ...req.body };

    // normalize scope like createOffer
    if (!body.scope || !body.scope.kind) {
      body.scope = { kind: "all", categories: [], products: [], includeDescendants: true };
    } else if (body.scope.kind === "categories") {
      body.scope.products = [];
      body.scope.includeDescendants = body.scope.includeDescendants !== false;
    } else if (body.scope.kind === "products") {
      body.scope.categories = [];
      body.scope.includeDescendants = true;
    }

    // simple value checks
    if (body.type === "percent") {
      if (body.value < 0 || body.value > 100) return res.status(400).json({ message: "Percent must be between 0 and 100" });
    } else if (body.type === "amount") {
      if (body.value < 0) return res.status(400).json({ message: "Amount must be >= 0" });
    }

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Offer not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
};


export const deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** Public: get active offers; optional prune with ?productIds=..&categoryIds=.. */
export const activeOffers = async (req, res) => {
  try {
    const productIds  = (req.query.productIds || "").split(",").filter(Boolean);
    const categoryIds = (req.query.categoryIds || "").split(",").filter(Boolean);
    const offers = await fetchActiveOffers({ productIds, categoryIds });
    res.json(offers);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
