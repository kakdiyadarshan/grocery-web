const Cart = require('../models/cart.model');

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [] } });
        }
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [{ productId, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(p => (p.productId._id || p.productId).toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        await cart.populate('items.productId');
        return res.status(200).json({ success: true, cart, message: 'Item added to cart successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity cannot be less than 1' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(p => (p.productId._id || p.productId).toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await cart.populate('items.productId');
            return res.status(200).json({ success: true, cart, message: 'Cart updated successfully' });
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

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter(item => (item.productId._id || item.productId).toString() !== productId);
        await cart.save();
        await cart.populate('items.productId');

        return res.status(200).json({ success: true, cart, message: 'Item removed from cart' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
