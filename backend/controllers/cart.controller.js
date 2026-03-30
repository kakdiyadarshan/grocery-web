const Cart = require('../models/cart.model');

// Helper to fetch cart with aggregated offers
const getCartWithOffers = async (userId) => {
    const today = new Date();
    const cartData = await Cart.aggregate([
        { $match: { userId: new (require('mongoose')).Types.ObjectId(userId) } },
        { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'items.productId'
            }
        },
        { $unwind: { path: '$items.productId', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'offers',
                let: { productId: '$items.productId._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$$productId', '$product_id'] },
                                    { $lte: ['$offer_start_date', today] },
                                    { $gte: ['$offer_end_date', today] }
                                ]
                            }
                        }
                    }
                ],
                as: 'items.productId.offer'
            }
        },
        {
            $addFields: {
                'items.productId.offer': { $arrayElemAt: ['$items.productId.offer', 0] }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'items.productId.category',
                foreignField: '_id',
                as: 'items.productId.category'
            }
        },
        { $unwind: { path: '$items.productId.category', preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                'items.productId.weighstWise': {
                    $map: {
                        input: '$items.productId.weighstWise',
                        as: 'w',
                        in: {
                            $mergeObjects: [
                                '$$w',
                                {
                                    discountPrice: {
                                        $cond: {
                                            if: { $ifNull: ['$items.productId.offer', false] },
                                            then: {
                                                $cond: {
                                                    if: { $eq: ['$items.productId.offer.offer_type', 'Discount'] },
                                                    then: {
                                                        $subtract: [
                                                            '$$w.price',
                                                            { $divide: [{ $multiply: ['$$w.price', '$items.productId.offer.offer_value'] }, 100] }
                                                        ]
                                                    },
                                                    else: {
                                                        $max: [0, { $subtract: ['$$w.price', '$items.productId.offer.offer_value'] }]
                                                    }
                                                }
                                            },
                                            else: '$$w.price'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                userId: { $first: '$userId' },
                items: { $push: '$items' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' }
            }
        }
    ]);

    if (!cartData || cartData.length === 0) return null;

    const cart = cartData[0];
    cart.items = cart.items.map(item => {
        const product = item.productId;
        if (!product || !product._id) return item;

        item.categoryName = product.category?.categoryName || "Grocery";
        if (product.weighstWise) {
            let foundVariant = null;
            if (item.variantId) {
                foundVariant = product.weighstWise.find(v => v._id.toString() === item.variantId.toString());
            }
            item.selectedVariant = foundVariant || product.weighstWise[0];
            if (!item.variantId && foundVariant) {
                item.variantId = foundVariant._id.toString();
            }
        }
        const { weighstWise, ...productWithoutVariants } = product;
        item.productId = productWithoutVariants;
        return item;
    });

    return cart;
};




exports.getCart = async (req, res) => {
    try {
        const cart = await getCartWithOffers(req.user.id);
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
        const updatedCart = await getCartWithOffers(userId);

        return res.status(200).json({
            success: true,
            cart: updatedCart,
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
            const updatedCart = await getCartWithOffers(userId);

            return res.status(200).json({
                success: true,
                cart: updatedCart,
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
        const updatedCart = await getCartWithOffers(userId);

        return res.status(200).json({
            success: true,
            cart: updatedCart,
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
        const updatedCart = await getCartWithOffers(userId);

        return res.status(200).json({
            success: true,
            cart: updatedCart || { items: [] },
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

