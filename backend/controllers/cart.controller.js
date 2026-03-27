const Cart = require('../models/cart.model');

// Helper to attach selected variant and remove the full list
const transformCartResponse = (cart) => {
    const cartObj = cart.toObject();
    cartObj.items = cartObj.items.map(item => {
        const product = item.productId;

        if (product && product.category) {
            item.categoryName = product.category.categoryName || "Grocery";
        }

        if (product && product.weighstWise) {
            // Find the specified variant OR fallback to the first available one
            let foundVariant = null;
            if (item.variantId) {
                foundVariant = product.weighstWise.find(v => v._id.toString() === item.variantId.toString());
            }

            // Critical fallback: if no matching variant found, use the first one 
            // to ensure frontend always shows a weight and price
            item.selectedVariant = foundVariant || product.weighstWise[0];

            // Preserve the correctly selected variant ID if it was missing
            if (!item.variantId && foundVariant) {
                item.variantId = foundVariant._id.toString();
            }
        }

        // Return a copy of the product without weighstWise to the frontend
        if (item.productId) {
            const { weighstWise, ...productWithoutVariants } = item.productId;
            item.productId = productWithoutVariants;
        }

        return item;
    });
    return cartObj;
};




exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            populate: { path: 'category' }
        })
       .populate('userId', 'firstname lastname email addresses');

        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [] } });
        }

        return res.status(200).json({ success: true, cart: transformCartResponse(cart) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, variantId, quantity = 1 } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [{ productId, variantId, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(p =>
                (p.productId._id || p.productId).toString() === productId &&
                (p.variantId === variantId)
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, variantId, quantity });
            }
        }

        await cart.save();
        await cart.populate('items.productId');

        return res.status(200).json({
            success: true,
            cart: transformCartResponse(cart),
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, variantId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity cannot be less than 1' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(p =>
            (p.productId._id || p.productId).toString() === productId &&
            (p.variantId === variantId)
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await cart.populate({
                path: 'items.productId',
                populate: { path: 'category' }
            });

            return res.status(200).json({
                success: true,
                cart: transformCartResponse(cart),
                message: 'Cart updated successfully'
            });
        }

        return res.status(404).json({ success: false, message: 'Item not found in cart' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { variantId } = req.query;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter(item =>
            (item.productId._id || item.productId).toString() !== productId ||
            (variantId && item.variantId !== variantId)
        );

        await cart.save();
        await cart.populate('items.productId');

        return res.status(200).json({
            success: true,
            cart: transformCartResponse(cart),
            message: 'Item removed from cart'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = [];
        await cart.save();

        return res.status(200).json({
            success: true,
            cart: transformCartResponse(cart),
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

