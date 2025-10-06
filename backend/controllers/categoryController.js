import Category from "../models/Category.js";

// =============================
// Create a new Category
// =============================
export const createCategory = async (req, res) => {
  const { label, parent = null, description = "" } = req.body;
  // If using Cloudinary, req.file.path will contain the uploaded URL
  const image = req.file ? req.file.path : null;

  try {
    // Check if a category with same label exists under same parent
    const existing = await Category.findOne({ label, parent });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with the same title already exists at this level.",
      });
    }

    const category = await Category.create({
      label,
      parent,
      image,
      description,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// List all categories (flat)
// =============================
export const listAllCategoriesFlat = async (req, res) => {
  try {
    const cats = await Category.find({}, { label: 1, name: 1, parent: 1 }).lean();

    const byId = new Map(cats.map((c) => [String(c._id), c]));
    const fullPath = (id) => {
      const parts = [];
      let cur = byId.get(String(id));
      while (cur) {
        const text = cur.label ?? cur.name ?? "";
        parts.unshift(text);
        cur = cur.parent ? byId.get(String(cur.parent)) : null;
      }
      return parts.join(" > ");
    };

    const items = cats.map((c) => ({
      _id: c._id,
      value: String(c._id),
      label: c.label ?? c.name ?? "",
      pathLabel: fullPath(c._id),
    }));

    res.json({ items });
  } catch (e) {
    res.status(500).json({
      message: "Failed to load categories",
      error: e.message,
    });
  }
};

// =============================
// Get all categories (nested tree)
// =============================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ position: 1 }).lean();

    const buildTree = (parentId = null) =>
      categories
        .filter((cat) => String(cat.parent) === String(parentId))
        .map((cat) => ({
          ...cat,
          children: buildTree(cat._id),
        }));

    res.status(200).json(buildTree());
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// Reorder categories
// =============================
export const reorderCategories = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await Category.findByIdAndUpdate(orderedIds[i], { position: i });
    }

    res.status(200).json({ message: "Categories reordered successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Reordering failed",
      error: err.message,
    });
  }
};

// =============================
// Update a category
// =============================
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { label, parent = null, description = "" } = req.body;

  try {
    const existing = await Category.findOne({
      label,
      parent,
      _id: { $ne: id },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with the same title already exists at this level.",
      });
    }

    const updateData = {
      label,
      parent,
      description,
    };

    if (req.file) {
      updateData.image = req.file.path; // ✅ Update image if new file provided
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// Delete a category
// =============================
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Delete child categories first.",
      });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
