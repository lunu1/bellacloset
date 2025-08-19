import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
   slug: { type: String, required: true, unique: true, trim: true },
  description: String,
  brand: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [String],
  options: [String], 
  images: [String],
    defaultPrice: Number,
  compareAtPrice: Number,
  defaultStock: Number,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: "text", brand: "text", description: "text" }); // if you plan to use $text
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);