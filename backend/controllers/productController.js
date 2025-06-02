import Product from "../models/Product.js";

// @desc Create a new product
// @POST /api/products
// @access Private (admin)

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            sizes,
            variants,
            hasColorVariants
        } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            variants,
            hasColorVariants,
            sizes: hasColorVariants ? [] : sizes,
            variants: hasColorVariants ? variants : []
        });

        await newProduct.save();    
        res.status(201).json({ message: "Product created", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}