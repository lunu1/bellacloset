import Cart from '../models/cartModel.js';


export const addToCart = async (req, res) => {
  try {
    const userId = req.body.userId.trim();
    const productId = req.body.productId.trim();

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: 1 }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1 });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart.', details: err.message });
  }
};


export const getCart = async (req, res) => {
  const userId = req.params.userId.trim();

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
};


export const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart', details: err.message });
  }
};


export const clearCart = async (req, res) => {
  const userId = req.params.userId;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (cart) {
      cart.items = []; 
      await cart.save();
    }

    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart', details: err.message });
  }
};
