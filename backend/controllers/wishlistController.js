import Wishlist from "../models/Wishlist.js"

export const addToWishlist = async (req, res) => {
    try {
        const {productId} = req.body;
        console.log("Received body:", req.body);

        if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }
            const userId = req.user._id;
            console.log("User from token:", req.user);

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
export const getwishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const wishlist = await Wishlist.find({ user: userId }).populate("product"); // ✅ correct

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!result) {
      return res.status(404).json({ message: "Item not found in Wishlist." });
    }

    res.status(200).json({ message: "Removed from wishlist successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



