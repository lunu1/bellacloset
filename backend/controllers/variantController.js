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

const deleteVariant = async (req, res) => {
  try {
    await Variant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete variant', error });
  }
};

export default {
  getVariantById,
  updateVariant,
  deleteVariant
};
