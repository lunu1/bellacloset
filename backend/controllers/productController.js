import Product from "../models/Product.js";
import Variant from "../models/Variants.js";
import slugify from "slugify";
import mongoose from "mongoose";

// Create product with variants
export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name, slug: clientSlug, description, brand, category, tags,
      options = [], variants = [], defaultImages = [],
      defaultPrice, compareAtPrice, defaultStock,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Missing required product fields" });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const baseSlug = clientSlug?.trim() || slugify(name, { lower: true });
    const finalSlug = `${baseSlug}-${Date.now()}`;

    const product = await Product.create([{
      name, slug: finalSlug, description, brand, category, tags, options,
      defaultPrice: variants.length === 0 ? parseFloat(defaultPrice || 0) : undefined,
      compareAtPrice: variants.length === 0 ? parseFloat(compareAtPrice || 0) : undefined,
      defaultStock: variants.length === 0 ? parseInt(defaultStock || 0, 10) : undefined,
      images: [], isActive: true, isFeatured: false, seo: {},
    }], { session });

    const created = product[0];

    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const usedSkus = new Set();
      createdVariants = await Promise.all(
        variants
          .filter((v) => v.attributes && Object.values(v.attributes).some((val) => val && String(val).trim() !== ""))
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
            }], { session }).then((arr) => arr[0]);
          })
      );
    }

    const hasColorOption = options.includes("Color");
    const defaultVariantImages = createdVariants.find((v) => v.images?.length)?.images || [];
    created.images =
      createdVariants.length > 0 && hasColorOption
        ? defaultVariantImages.slice(0, 4)
        : defaultImages.slice(0, 4);

    await Product.findByIdAndUpdate(created._id, { images: created.images }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ product: created, variants: createdVariants });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Product creation error:", error);
    return res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

// Get all products with variants grouped
// Get all products (paginated) with optional variants
export const getAllProducts = async (req, res) => {
  try {
    // query params
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
      brand,
      isActive,
      withVariants = "true", // pass withVariants=false to skip
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    // build filter
    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { brand: regex }, { description: regex }];
    }
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }
    if (brand) filter.brand = brand;
    if (typeof isActive !== "undefined") {
      filter.isActive = isActive === "true";
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // fetch current page + total count
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    let items;

    if (withVariants !== "false") {
      const ids = products.map((p) => p._id);
      const allVariants = await Variant.find({ product: { $in: ids } }).lean();

      // group variants by product
      const byProduct = new Map();
      for (const v of allVariants) {
        const key = String(v.product);
        if (!byProduct.has(key)) byProduct.set(key, []);
        byProduct.get(key).push(v);
      }

      items = products.map((p) => ({
        product: p,
        variants: byProduct.get(String(p._id)) || [],
      }));
    } else {
      items = products.map((p) => ({ product: p, variants: [] }));
    }

    return res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
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


