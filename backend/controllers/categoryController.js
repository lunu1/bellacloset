import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  const { label, parent = null} = req.body;
  //Cloudinary stores the uploaded image and returns the URL in req.file.path
    const image= req.file? req.file.path: null;
  

  try {
    
    const existing = await Category.findOne({ label, parent });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with the same title already exists at this level.",
      });
    }

    

    const category = await Category.create({ label, parent, image });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all categories with nested children
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();

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

// Update a category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { label, parent = null } = req.body;

  try {
    const existing = await Category.findOne({ label, parent, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with the same title already exists at this level.",
      });
    }

    const updateData = {
      label,
      parent,
    };

    // ✅ Add image update if file exists
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: Check if it has children before deleting
    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Delete child categories first.",
      });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

