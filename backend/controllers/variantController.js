import Variant from '../models/Variants.js';

const getVariantById = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id).populate('product');
    res.json(variant);
  } catch (error) {
    res.status(404).json({ message: 'Variant not found', error });
  }
};

const updateVariant = async (req, res) => {
  try {
    const updatedVariant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedVariant);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update variant', error });
  }
};


// REDUCE STOCK WHEN QUANTITY INCREASED
 const reduceStock = async (req, res) => {
  const { variantId, quantity } = req.body;

  try {
    const variant = await Variant.findById(variantId);

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    variant.stock -= quantity;
    await variant.save();

    res.status(200).json({
      message: 'Stock updated successfully',
      remainingStock: variant.stock,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reducing stock', error: error.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    await Variant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete variant', error });
  }
};
const getVariantsByProduct = async (req, res) => {
  try {
    const variants = await Variant.find({ product: req.params.productId });

    if (!variants || variants.length === 0) {
      return res.status(404).json({ message: 'No variants found for this product' });
    }

    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching variants', error: error.message });
  }
};


export default {
  getVariantById,
  updateVariant,
  deleteVariant,
  reduceStock,
  getVariantsByProduct
};
