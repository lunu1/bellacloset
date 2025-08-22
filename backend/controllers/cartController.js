import Cart from '../models/cartModel.js';
import Variant from '../models/Variants.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// export const addToCart = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const productId = (req.body.productId || '').trim();
//     const variantId = (req.body.variantId || '').trim();   // may be empty for non-variant products
//     const qty = Math.max(1, Number(req.body.quantity) || 1);

//     if (!productId) {
//       return res.status(400).json({ error: 'Product ID is required.' });
//     }

//     // If variantId present -> validate variant & stock; else validate product stock
//     let stockCap = 0;
//     if (variantId) {
//       const variant = await Variant.findById(variantId);
//       if (!variant) return res.status(404).json({ error: 'Variant not found' });
//       stockCap = typeof variant.stock === 'number' ? variant.stock : 0;
//     } else {
//       const product = await Product.findById(productId);
//       if (!product) return res.status(404).json({ error: 'Product not found' });
//       stockCap = typeof product.stock === 'number' ? product.stock : 0;
//     }
//     if (stockCap < 1) return res.status(400).json({ error: 'Out of stock' });

//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) {
//       cart = new Cart({
//         user: userId,
//         items: [{ product: productId, variant: variantId || undefined, quantity: Math.min(qty, stockCap) }],
//       });
//     } else {
//       const idx = cart.items.findIndex(i =>
//         i.product.toString() === productId &&
//         String(i.variant || '') === String(variantId || '')
//       );
//       if (idx > -1) {
//         const newQty = cart.items[idx].quantity + qty;
//         if (newQty > stockCap) {
//           return res.status(400).json({ error: `Only ${stockCap} item(s) left in stock` });
//         }
//         cart.items[idx].quantity = newQty;
//       } else {
//         cart.items.push({
//           product: productId,
//           variant: variantId || undefined,
//           quantity: Math.min(qty, stockCap),
//         });
//       }
//     }

//     await cart.save();
//     const populated = await cart.populate('items.product items.variant');
//     return res.status(200).json(populated);
//   } catch (err) {
//     return res.status(500).json({ error: 'Failed to add to cart.', details: err.message });
//   }
// };


export const addToCart = async (req, res) => {
  try {
    // must be set by userAuth
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const productId = (req.body.productId || '').trim();
    const variantId = (req.body.variantId || '').trim(); // may be '' for simple products
    const quantity = Math.max(1, Number(req.body.quantity) || 1);

    // basic validation
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    // fetch product
    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let stockCap = 0;
    let lineVariantId = undefined; // what we will store in cart.items.variant

    if (variantId) {
      // variant path
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        return res.status(400).json({ error: 'Invalid variantId' });
      }
      const variant = await Variant.findById(variantId);
      if (!variant || variant.isActive === false) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      // optional: ensure this variant actually belongs to the product
      if (String(variant.product) !== String(product._id)) {
        return res.status(400).json({ error: 'Variant does not belong to product' });
      }
      stockCap = typeof variant.stock === 'number' ? variant.stock : 0;
      lineVariantId = variant._id; // store variant on the line
    } else {
      // simple product path
      stockCap = typeof product.defaultStock === 'number' ? product.defaultStock : 0;
      lineVariantId = undefined; // no variant for simple line
    }

    if (stockCap < 1) {
      return res.status(400).json({ error: 'Out of stock' });
    }

    // load or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    // find existing line by (product, variant)
    const idx = cart.items.findIndex(
      (i) =>
        String(i.product) === String(productId) &&
        String(i.variant || '') === String(lineVariantId || '')
    );

    if (idx > -1) {
      // increase
      const newQty = (cart.items[idx].quantity || 0) + quantity;
      if (newQty > stockCap) {
        return res.status(400).json({ error: `Only ${stockCap} item(s) left in stock` });
      }
      cart.items[idx].quantity = newQty;
    } else {
      // push new line
      if (quantity > stockCap) {
        return res.status(400).json({ error: `Only ${stockCap} item(s) left in stock` });
      }
      cart.items.push({
        product: productId,
        variant: lineVariantId, // undefined for simple products
        quantity
      });
    }

    await cart.save();

    // populate safely in one call
    await cart.populate([{ path: 'items.product' }, { path: 'items.variant' }]);

    return res.status(200).json(cart);
  } catch (err) {
    // log to server console for quick diagnosis
    console.error('addToCart error:', err);
    // CastError → bad ObjectId from client
    if (err?.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid id format', details: err.message });
    }
    return res
      .status(500)
      .json({ error: 'Failed to add to cart.', details: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(200).json({ items: [] });  // <-- early return before populate
    await cart.populate('items.product items.variant');
    return res.status(200).json(cart);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { variantId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.product.toString() === String(productId) &&
          String(i.variant || '') === String(variantId || '')
        )
    );

    await cart.save();
    await cart.populate([{ path: 'items.product' }, { path: 'items.variant' }]);
    return res.status(200).json(cart);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove from cart', details: err.message });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear cart', details: err.message });
  }
};

export const setCartQuantity = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { productId, variantId, quantity } = req.body;
    const qty = Math.max(0, Number(quantity) || 0);

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    const idx = cart.items.findIndex(
      (i) =>
        i.product.toString() === String(productId) &&
        String(i.variant || '') === String(variantId || '')
    );
    if (idx === -1) return res.status(404).json({ error: 'Cart line not found.' });

    // Stock cap
    let stockCap = Infinity;
    if (variantId) {
      const v = await Variant.findById(variantId);
      if (!v) return res.status(404).json({ error: 'Variant not found.' });
      stockCap = typeof v.stock === 'number' ? v.stock : 0;
    } else {
      const p = await Product.findById(productId);
      if (!p) return res.status(404).json({ error: 'Product not found.' });
      stockCap = typeof p.stock === 'number' ? p.stock : Infinity;
    }

    if (qty > stockCap) {
      return res.status(400).json({ error: `Only ${stockCap} item(s) left in stock` });
    }

    if (qty === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = qty;
    }

    await cart.save();
    await cart.populate([{ path: 'items.product' }, { path: 'items.variant' }]);
    return res.status(200).json(cart);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update quantity', details: err.message });
  }
};
