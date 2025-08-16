import Product from "../models/Product.js";
import Variant from "../models/Variants.js";
import slugify from "slugify";
import mongoose from "mongoose";

// Create product with variants
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug: clientSlug,
      description,
      brand,
      category,
      tags,
      options = [],
      variants = [],
      defaultImages = [],
      defaultPrice,
      compareAtPrice,
      defaultStock,
    } = req.body;

    // 1. Validate Required Fields
    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Missing required product fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // 2. Generate Unique Slug
    const baseSlug = clientSlug?.trim() || slugify(name, { lower: true });
    const finalSlug = `${baseSlug}-${Date.now()}`;

    // 3. Create the Base Product
    const product = await Product.create({
      name,
      slug: finalSlug,
      description,
      brand,
      category,
      tags,
      options,
      defaultPrice:
        variants.length === 0 ? parseFloat(defaultPrice || 0) : undefined,
      compareAtPrice:
        variants.length === 0 ? parseFloat(compareAtPrice || 0) : undefined,
      defaultStock:
        variants.length === 0 ? parseInt(defaultStock || 0) : undefined,
      images: [],
      isActive: true,
      isFeatured: false,
      seo: {},
    });

    // 4. Generate Variants if present
    let createdVariants = [];

    if (Array.isArray(variants) && variants.length > 0) {
      const usedSkus = new Set();

      createdVariants = await Promise.all(
        variants
          .filter(
            (v) =>
              v.attributes &&
              Object.values(v.attributes).some(
                (val) => val && val.trim() !== ""
              )
          )
          .map(async (v) => {
            const attrs = v.attributes || {};
            const valuesArr = Object.values(attrs);
            const values = valuesArr.join("-").toLowerCase();
            const variantSlug = slugify(`${finalSlug}-${values}`, {
              lower: true,
            });
            const sku = `${finalSlug.toUpperCase()}-${values
              .toUpperCase()
              .replace(/\s+/g, "-")}`;

            if (usedSkus.has(sku))
              throw new Error("Duplicate variant SKU generated.");
            usedSkus.add(sku);

            return Variant.create({
              product: product._id,
              optionValues: attrs,
              slug: variantSlug,
              sku,
              price: parseFloat(v.price || defaultPrice || 0),
              compareAtPrice: parseFloat(
                v.compareAtPrice || compareAtPrice || 0
              ),
              stock: parseInt(v.stock || defaultStock || 0),
              images: Array.isArray(v.images) ? v.images.slice(0, 4) : [],
            });
          })
      );
    }

    // 5. Assign Default Images to Product
    const hasColorOption = options.includes("Color");
    const defaultVariantImages =
      createdVariants.find((v) => v.images.length)?.images || [];

    product.images =
      createdVariants.length > 0 && hasColorOption
        ? defaultVariantImages.slice(0, 4)
        : defaultImages.slice(0, 4);

    await product.save();

    // 6. Done
    res.status(201).json({ product, variants: createdVariants });
  } catch (error) {
    console.error("❌ Product creation error:", error);
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

// Get all products with variants grouped
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const result = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ product: product._id });
        return { product, variants };
      })
    );

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// Get single product with variants
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const variants = await Variant.find({ product: product._id });
    res.json({ product, variants });
  } catch (error) {
    res.status(404).json({ message: "Product not found", error });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
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
