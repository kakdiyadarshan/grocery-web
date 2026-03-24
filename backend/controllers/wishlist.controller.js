const Wishlist = require('../models/wishlist.model');

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware
        const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
        if (!wishlist) {
            return res.status(200).json({ success: true, wishlist: { items: [] } });
        }
        return res.status(200).json({ success: true, wishlist });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = new Wishlist({ userId, items: [{ productId }] });
        } else {
            const itemIndex = wishlist.items.findIndex(p => p.productId.toString() === productId);
            if (itemIndex === -1) {
                wishlist.items.push({ productId });
            } else {
                return res.status(400).json({ success: false, message: 'Item already in wishlist' });
            }
        }

        await wishlist.save();
        return res.status(200).json({ success: true, wishlist, message: 'Item added to wishlist successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

        wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
        await wishlist.save();

        return res.status(200).json({ success: true, wishlist, message: 'Item removed from wishlist' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
