import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: String,
  detailedDescription: String,
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand'},

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  tags: [String],
  options: [String],
  images: [String],
  defaultPrice: Number,
  compareAtPrice: Number,
  defaultStock: Number,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  avgRating:   { type: Number, default: 0 },
reviewCount: { type: Number, default: 0 },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

// indexes — keep these, and remove any field-level index flags
productSchema.index({ name: 'text', brand: 'text', description: 'text', detailedDescription: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ categoryPath: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
