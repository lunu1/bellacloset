import Product from "../models/Product.js";
import Category from "../models/Category.js";   // ⬅️ add this
import Variant from "../models/Variants.js";
import slugify from "slugify";
import mongoose from "mongoose";

// Build full lineage path [rootId, ..., leafId] from a leaf category id
async function buildCategoryPathFromLeaf(leafId) {
  const path = [];
  let node = await Category.findById(leafId).lean();
  if (!node) throw new Error("Invalid category id");
  while (node) {
    path.unshift(node._id);
    node = node.parent ? await Category.findById(node.parent).lean() : null;
  }
  return path;
}

// Validate a client-provided path is a continuous parent->child chain
async function validateCategoryPath(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("categoryPath must be a non-empty array");
  }
  const found = await Category.find({ _id: { $in: ids } }, { _id: 1, parent: 1 }).lean();
  if (found.length !== ids.length) throw new Error("categoryPath contains invalid ids");

  const map = new Map(found.map(c => [String(c._id), c]));
  for (let i = 0; i < ids.length; i++) {
    const id = String(ids[i]);
    const node = map.get(id);
    if (!node) throw new Error("Invalid categoryPath");
    if (i === 0) {
      if (node.parent) throw new Error("First node in categoryPath must be a root (parent=null)");
    } else {
      const prevId = String(ids[i - 1]);
      if (!node.parent || String(node.parent) !== prevId) {
        throw new Error("categoryPath is not a continuous parent->child chain");
      }
    }
  }
  return true;
}



// Create product with variants
// Create product with variants + lineage (category, subcategory, categoryPath)
export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      // product core
      name, slug: clientSlug, description, brand, tags,
      options = [], variants = [], defaultImages = [],
      defaultPrice, compareAtPrice, defaultStock,

      // lineage inputs (send ONE of these)
      categoryPath,      // array of ids [root, ..., leaf]  (recommended)
      categoryId,        // a single leaf category id
      category,          // legacy: if provided, treated as leaf id (for backward compatibility)
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Missing required field: name" });
    }

    // ---- Build lineage ----
    let pathIds;
    if (Array.isArray(categoryPath) && categoryPath.length > 0) {
      pathIds = categoryPath.map(id => new mongoose.Types.ObjectId(id));
      await validateCategoryPath(pathIds);
    } else if (categoryId || category) {
      const leaf = categoryId || category;
      if (!mongoose.Types.ObjectId.isValid(leaf)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      pathIds = await buildCategoryPathFromLeaf(leaf);
    } else {
      return res.status(400).json({ message: "Provide categoryPath (array) or categoryId (leaf)" });
    }

    const rootCategoryId = pathIds[0];
    const leafCategoryId = pathIds[pathIds.length - 1];

    // ---- Slug ----
    const baseSlug = clientSlug?.trim() || slugify(name, { lower: true });
    const finalSlug = `${baseSlug}-${Date.now()}`;

    // ---- Create product ----
    const [created] = await Product.create([{
      name,
      slug: finalSlug,
      description,
      brand,
      // lineage fields:
      category: rootCategoryId,          // root/top-level
      subcategory: leafCategoryId,       // leaf
      categoryPath: pathIds,             // full lineage

      tags,
      options,
      // default fields used only when no variants provided:
      defaultPrice: variants.length === 0 ? parseFloat(defaultPrice || 0) : undefined,
      compareAtPrice: variants.length === 0 ? parseFloat(compareAtPrice || 0) : undefined,
      defaultStock: variants.length === 0 ? parseInt(defaultStock || 0, 10) : undefined,

      images: [],
      isActive: true,
      isFeatured: false,
      seo: {},
    }], { session });

    // ---- Create variants (unchanged logic) ----
    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const usedSkus = new Set();
      createdVariants = await Promise.all(
        variants
          .filter(v => v.attributes && Object.values(v.attributes).some(val => val && String(val).trim() !== ""))
          .map(async (v) => {
            const attrs = v.attributes || {};
            const values = Object.values(attrs).join("-").toLowerCase();
            const variantSlug = slugify(`${finalSlug}-${values}`, { lower: true });
            const sku = `${finalSlug.toUpperCase()}-${values.toUpperCase().replace(/\s+/g, "-")}`;

            if (usedSkus.has(sku)) throw new Error("Duplicate variant SKU generated.");
            usedSkus.add(sku);

            return Variant.create([{
              product: created._id,
              optionValues: attrs,
              slug: variantSlug,
              sku,
              price: parseFloat(v.price || defaultPrice || 0),
              compareAtPrice: parseFloat(v.compareAtPrice || compareAtPrice || 0),
              stock: parseInt(v.stock || defaultStock || 0, 10),
              images: Array.isArray(v.images) ? v.images.slice(0, 4) : [],
            }], { session }).then(arr => arr[0]);
          })
      );
    }

    // ---- Decide product.images thumbnail set ----
    const hasColorOption = options.includes("Color");
    const defaultVariantImages = createdVariants.find(v => v.images?.length)?.images || [];
    const images =
      createdVariants.length > 0 && hasColorOption
        ? defaultVariantImages.slice(0, 4)
        : defaultImages.slice(0, 4);

    await Product.findByIdAndUpdate(created._id, { images }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ product: { ...created.toObject(), images }, variants: createdVariants });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Product creation error:", error);
    return res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};


// Get all products with variants grouped
// Get all products (paginated) with optional variants
// Get all products (paginated) with optional variants
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
      subcategory,
      brand,
      isActive,
      withVariants = "true",
      deep = "0"            // NEW: deep search via categoryPath when deep=1
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Build filter
    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { brand: regex }, { description: regex }];
    }
    if (brand) filter.brand = brand;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";

    // lineage filters
    if (subcategory && mongoose.Types.ObjectId.isValid(subcategory)) {
      filter.subcategory = subcategory; // exact leaf only
    } else if (category && mongoose.Types.ObjectId.isValid(category)) {
      if (deep === "1") {
        filter.categoryPath = category; // deep: any product under this node
      } else {
        filter.category = category;     // direct category only
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    let items;
    if (withVariants !== "false") {
      const ids = products.map((p) => p._id);
      const allVariants = await Variant.find({ product: { $in: ids } }).lean();
      const byProduct = new Map();
      for (const v of allVariants) {
        const key = String(v.product);
        if (!byProduct.has(key)) byProduct.set(key, []);
        byProduct.get(key).push(v);
      }
      items = products.map((p) => ({ product: p, variants: byProduct.get(String(p._id)) || [] }));
    } else {
      items = products.map((p) => ({ product: p, variants: [] }));
    }

    return res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// GET /api/products/by-category/:id?deep=1&page=1&limit=24
export const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deep = req.query.deep === "1";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 24));
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const filter = deep ? { categoryPath: id } : { subcategory: id };
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const ids = products.map(p => p._id);
    const allVariants = await Variant.find({ product: { $in: ids } }).lean();
    const map = new Map();
    for (const v of allVariants) {
      const k = String(v.product);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(v);
    }

    const items = products.map(p => ({ product: p, variants: map.get(String(p._id)) || [] }));
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch products by category", error: e.message });
  }
};



// Get single product with variants
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await Variant.find({ product: product._id }).lean();
    return res.json({ product, variants });
  } catch (error) {
    return res.status(404).json({ message: "Product not found", error: error.message });
  }
};




// Delete product and all its variants
export const deleteProduct = async (req, res) => {
  try {
    await Variant.deleteMany({ product: req.params.id });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product and variants deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
};

// Search products by name, brand, or description
export const searchProducts = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    // Convert to case-insensitive partial regex
    const regex = new RegExp(query, "i"); // partial + case-insensitive match

    const results = await Product.find({
      $or: [{ name: regex }, { brand: regex }, { description: regex }],
    }).limit(30);

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("❌ Search error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to perform search",
        error: error.message,
      });
  }
};

// Search for suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json({ suggestions: [] });

    const regex = new RegExp(`^${q}`, "i"); // starts with q, case-insensitive

    const suggestions = await Product.find({ name: { $regex: regex } })
      .limit(8)
      .select("name _id");

    res.json({ suggestions: suggestions.map((p) => p.name) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching suggestions", error: error.message });
  }
};

// Get variants for a product
export const getVariantsByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const variants = await Variant.find({ product: id }).lean();
    return res.json(variants);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch variants", error: error.message });
  }
};


// Update product (whitelist fields)
export const updateProduct = async (req, res) => {
  try {
    const allowed = [
      "name", "slug", "description", "brand", "category", "tags",
      "options", "images", "defaultPrice", "compareAtPrice",
      "defaultStock", "isActive", "isFeatured", "seo"
    ];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      patch,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};


