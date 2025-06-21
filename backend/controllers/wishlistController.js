import Wishlist from "../models/Wishlist.js"

export const addToWishlist = async (requestAnimationFrame, res) => {
    try {
        const {productId} = requestAnimationFrame.body;
        const userId = requestAnimationFrame.user._id;

        // Check if the product is already in the wishlist
        const exists= await Wishlist.findOne({ user: userId, product: productId });
        if (exists) {
            return res.status(400).json({ message: "Product already in wishlist." });
        
        }
        // Create a new wishlist item
        const item = await Wishlist.create({ user: userId, product: productId});
        res.status(201).json(item);
       } catch (err) {
        res.status(500).json({ message: err.message})
       }
}
export const getwishlist = async (req,res) => {
    try {
        const userId = req.user._id;
        const wishlist = await Wishlist.find({ user: userId }).populate("Product");
        res.json(wishlist);

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.user._id;

        const result = await Wishlist.findOneAndDelete({ user : userId, product: productId})

        if(!result) {
            return res.status(404).json({ message: " Item not found in Wishlist." });
        }
          res.json({ message: " Removed from wishlist successfully."});
    } catch (err) {
        res.status(500).json({ message : err.message });

    }
}



