import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, default: 0 }
});

const colorVariantSchema = new mongoose.Schema({
  color: { type: String, required: true },       // e.g., "Red"
  hex: String,                                   // e.g., "#FF0000"
  image: { type: String, required: true },       // image for this color
  sizes: [sizeSchema]                            // sizes for this color
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  hasColorVariants: { type: Boolean, default: false }, // helpful for frontend check

  sizes: [sizeSchema],                  // used if hasColorVariants is false
  variants: [colorVariantSchema],      // used if hasColorVariants is true

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);



//sample json data

// with color variants 

// {
//   "name": "Elegant Summer Dress",
//   "description": "A lightweight, stylish dress perfect for summer outings.",
//   "price": 1999,
//   "category": "663fc7f4b3b99b0012f07f02",  // replace with your actual category ObjectId
//   "hasColorVariants": true,
//   "variants": [
//     {
//       "color": "Red",
//       "hex": "#FF0000",
//       "image": "https://example.com/images/dress-red.jpg",
//       "sizes": [
//         { "size": "S", "stock": 10 },
//         { "size": "M", "stock": 5 },
//         { "size": "L", "stock": 0 }
//       ]
//     },
//     {
//       "color": "Blue",
//       "hex": "#0000FF",
//       "image": "https://example.com/images/dress-blue.jpg",
//       "sizes": [
//         { "size": "S", "stock": 7 },
//         { "size": "M", "stock": 4 },
//         { "size": "L", "stock": 3 }
//       ]
//     }
//   ]
// }

//without color variants

// {
//   "name": "Basic White T-Shirt",
//   "description": "Classic white t-shirt, perfect for everyday wear.",
//   "price": 799,
//   "category": "663fc7f4b3b99b0012f07f02",  // replace with your actual category ObjectId
//   "hasColorVariants": false,
//   "sizes": [
//     { "size": "S", "stock": 20 },
//     { "size": "M", "stock": 15 },
//     { "size": "L", "stock": 10 }
//   ]
// }
