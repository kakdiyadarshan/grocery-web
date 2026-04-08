const Order = require('../models/order.model');
const mongoose = require('mongoose');
const Coupon = require('../models/coupon.model');
const Payment = require('../models/payment.model');
const Cart = require('../models/cart.model');
const Address = require('../models/address.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { emitRoleNotification, emitUserNotification } = require('../socketManager/socketManager');

// Helper to update stock for an order item (variant-aware fallback)
const adjustProductStock = async (item, delta) => {
    if (!item || !item.productId || !item.quantity) return;

    // productId may be an object with _id or raw id
    const productId = item.productId._id ? item.productId._id : item.productId;

    // variantId may come as object id or string
    let variantId = null;
    if (item.variantId) {
        variantId = item.variantId._id ? item.variantId._id : item.variantId;
    } else if (item.selectedVariant && item.selectedVariant._id) {
        variantId = item.selectedVariant._id;
    }

    if (variantId) {
        const updated = await Product.findOneAndUpdate(
            { _id: productId, 'weighstWise._id': variantId },
            { $inc: { 'weighstWise.$.stock': delta } },
            { new: true }
        );

        if (!updated) {
            console.warn(`adjustProductStock: variant ${variantId} not found for product ${productId}`);
        }
        return;
    }

    // Fallback: decrement first variant stock for products added without variantId
    const fallback = await Product.findOneAndUpdate(
        { _id: productId, 'weighstWise.0': { $exists: true } },
        { $inc: { 'weighstWise.0.stock': delta } },
        { new: true }
    );

    if (!fallback) {
        console.warn(`adjustProductStock: fallback failed for product ${productId}`);
    }
};

// Helper to group items by seller and enrich with seller information
const groupItemsBySeller = async (items) => {
    let subtotal = 0;
    const enrichedItems = [];
    const sellerGroups = {};

    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const sellerId = product.sellerId.toString();
        item.sellerId = sellerId;

        const itemTotal = (item.discountPrice || item.price) * item.quantity;
        subtotal += itemTotal;

        enrichedItems.push(item);

        if (!sellerGroups[sellerId]) {
            sellerGroups[sellerId] = {
                items: [],
                totalAmount: 0,
                adminDiscount: 0 // Admin fee/commission can be calculated here if needed
            };
        }
        sellerGroups[sellerId].items.push(item);
        sellerGroups[sellerId].totalAmount += itemTotal;
    }

    return { enrichedItems, subtotal, sellerGroups };
};

// Helper to transfer funds to sellers using Stripe Connect
const transferToSellers = async (sellerGroups, paymentIntentId) => {
    for (const sellerId in sellerGroups) {
        const group = sellerGroups[sellerId];
        const seller = await User.findById(sellerId);

        if (seller && seller.stripeAccountId) {
            // Calculate seller's share (Total - Admin Commission)
            let adminCommPercent = 10;
            const admin = await User.findOne({ role: 'admin' });
            if (admin && admin.adminSettings && admin.adminSettings.globalCommission) {
                adminCommPercent = parseFloat(admin.adminSettings.globalCommission);
            }
            const sellerAmount = group.totalAmount * (1 - (adminCommPercent / 100));
            const amountInCents = Math.round(sellerAmount * 100);

            if (amountInCents > 0) {
                try {
                    await stripe.transfers.create({
                        amount: amountInCents,
                        currency: 'usd', // Adjust if needed
                        destination: seller.stripeAccountId,
                        // source_transaction: paymentIntentId, // Optional: links transfer to the original charge
                        metadata: { sellerId: sellerId.toString() }
                    });
                    console.log(`Successfully transferred ${amountInCents} cents to seller ${sellerId}`);
                } catch (err) {
                    console.error(`Stripe transfer failed for seller ${sellerId}:`, err);
                }
            }
        } else {
            console.warn(`Seller ${sellerId} does not have a Stripe account linked. Manual settlement required.`);
        }
    }
};

// Helper to determine dynamic status based on time
const calculateDynamicStatus = (order) => {
    if (!order) return 'pending';
    // Use manual status if it's been updated beyond 'pending'
    if (order.status && order.status !== 'pending') return order.status;

    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - createdAt) / 60000);

    // Dynamic auto-progression only if still 'pending'
    if (diffInMinutes >= 120) return 'completed';
    if (diffInMinutes >= 60) return 'out for delivery';
    if (diffInMinutes >= 45) return 'shipped';
    if (diffInMinutes >= 15) return 'processing';

    return 'pending';
};

// Helper to transform order with aggregated offers
const getOrderWithOffers = async (orderId) => {
    const today = new Date();
    const orderData = await Order.aggregate([
        { $match: { _id: new (require('mongoose')).Types.ObjectId(orderId) } },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userId'
            }
        },
        { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                address: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: '$userId.addresses',
                                as: 'addr',
                                cond: { $eq: ['$$addr._id', '$addressId'] }
                            }
                        },
                        0
                    ]
                }
            }
        },
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
                from: 'users',
                localField: 'items.productId.sellerId',
                foreignField: '_id',
                as: 'items.productId.sellerId'
            }
        },
        {
            $unwind: {
                path: '$items.productId.sellerId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                'items.productId.sellerId': {
                    _id: '$items.productId.sellerId._id',
                    firstname: '$items.productId.sellerId.firstname',
                    lastname: '$items.productId.sellerId.lastname',
                    email: '$items.productId.sellerId.email',
                    brandDetails: '$items.productId.sellerId.brandDetails'
                }
            }
        },
        {
            $project: {
                'items.productId.sellerId.password': 0,
                'items.productId.sellerId.gstDetails': 0,
                'items.productId.sellerId.bankDetails': 0,
                'items.productId.sellerId.pickupAddress': 0,
                'items.productId.sellerId.otpVerification': 0,
                'items.productId.sellerId.agreement': 0,
                'items.productId.sellerId.status': 0,
                'items.productId.sellerId.onboardingStep': 0,
                'items.productId.sellerId.isOnboardingCompleted': 0,
                'items.productId.sellerId.stripeAccountId': 0,
                'items.productId.sellerId.addresses': 0,
                'items.productId.sellerId.role': 0,
                'items.productId.sellerId.isVerified': 0,
                'items.productId.sellerId.__v': 0,
                'items.productId.sellerId.createdAt': 0,
                'items.productId.sellerId.updatedAt': 0
            }
        },
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
                                            else: null
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
            $lookup: {
                from: 'coupons',
                localField: 'couponId',
                foreignField: '_id',
                as: 'couponId'
            }
        },
        { $unwind: { path: '$couponId', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'payments',
                localField: '_id',
                foreignField: 'orderId',
                as: 'payment'
            }
        },
        { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$_id',
                userId: { $first: '$userId' },
                items: { $push: '$items' },
                totalAmount: { $first: '$totalAmount' },
                status: { $first: '$status' },
                paymentMethod: { $first: '$paymentMethod' },
                addressId: { $first: '$addressId' },
                address: { $first: '$address' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
                payment: { $first: '$payment' },
                trackingHistory: { $first: '$trackingHistory' },
                couponId: { $first: '$couponId' }
            }
        }
    ]);

    if (!orderData || orderData.length === 0) return null;

    const order = orderData[0];
    // order.displayStatus = calculateDynamicStatus(order);

    order.items = order.items.map(item => {
        const product = item.productId;
        delete item.sellerId;
        // If order stores its own prices (new system), use them!
        if (item.price !== undefined && item.price !== null) {
            item.selectedVariant = {
                ...(product?.weighstWise?.[0] || {}),
                price: item.price,
                discountPrice: item.discountPrice
            };
            if (product?.weighstWise && item.variantId) {
                const found = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                if (found) {
                    item.selectedVariant.weight = found.weight;
                    item.selectedVariant.unit = found.unit;
                }
            }
        } else if (product && product.weighstWise) {
            // BACKWARD COMPATIBILITY for legacy orders
            let foundVariant = null;
            if (item.variantId) {
                foundVariant = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
            }
            // Use the variant with the already aggregated discountPrice
            item.selectedVariant = JSON.parse(JSON.stringify(foundVariant || product.weighstWise[0]));
        }

        const { weighstWise, ...productWithoutVariants } = product || {};
        item.productId = productWithoutVariants;
        return item;
    });

    return order;
};

// Helper to transform order and potentially auto-update in DB (LEGACY SUPPORT)
const transformAndAutoUpdate = async (order) => {
    if (!order) return null;
    const dynamicStatus = calculateDynamicStatus(order);

    const orderObj = order.toObject ? order.toObject() : JSON.parse(JSON.stringify(order));
    orderObj.displayStatus = dynamicStatus;

    orderObj.items = (orderObj.items || []).map(item => {
        const product = item.productId;
        if (product && product.weighstWise) {
            let foundVariant = null;
            if (item.variantId) {
                foundVariant = product.weighstWise.find(
                    v => (v._id || v).toString() === (item.variantId || "").toString()
                );
            }
            item.selectedVariant = foundVariant || product.weighstWise[0];
        }

        if (item.productId && typeof item.productId === 'object') {
            const { weighstWise, ...productWithoutVariants } = item.productId;
            item.productId = productWithoutVariants;
        }
        return item;
    });

    return orderObj;
};

exports.createOrder = async (req, res) => {
    try {
        let { userId, items, totalAmount, couponId, paymentMethod, addressId, addressDetails } = req.body;

        if (!userId || !items || !totalAmount || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const { enrichedItems, sellerGroups } = await groupItemsBySeller(items);
        const finalTotal = parseFloat(Number(totalAmount).toFixed(2));

        let adminCommPercent = 10;
        const admin = await User.findOne({ role: 'admin' });
        if (admin && admin.adminSettings && admin.adminSettings.globalCommission) {
            adminCommPercent = parseFloat(admin.adminSettings.globalCommission);
        }

        const adminCommAmount = parseFloat((finalTotal * (adminCommPercent / 100)).toFixed(2));
        const finalSellerAmount = parseFloat((finalTotal - adminCommAmount).toFixed(2));

        // ================= STRIPE =================
        if (paymentMethod.toLowerCase() === 'stripe') {
            const isSplitOrder = Object.keys(sellerGroups).length > 1;

            const payment = await Payment.create({
                userId,
                paymentMethod,
                amount: finalTotal,
                sellerAmount: finalSellerAmount,
                adminCommission: adminCommAmount,
                status: 'pending',
                pendingOrderData: {
                    userId,
                    items: enrichedItems,
                    totalAmount: finalTotal,
                    couponId,
                    paymentMethod,
                    addressId,
                    addressDetails,
                    isSplitOrder
                }
            });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: `Order Payment (${userId})` },
                        unit_amount: Math.round(finalTotal * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/order-completed?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/checkout`,
                metadata: { paymentId: payment._id.toString() }
            });

            return res.status(200).json({
                success: true,
                data: { paymentUrl: session.url }
            });
        }

        // ================= COD =================
        const createdOrders = [];

        for (const sellerId in sellerGroups) {
            const group = sellerGroups[sellerId];

            const sellerGroupAmount = group.totalAmount;
            const sellerGroupAdminComm = parseFloat((sellerGroupAmount * (adminCommPercent / 100)).toFixed(2));
            const sellerGroupFinalAmount = parseFloat((sellerGroupAmount - sellerGroupAdminComm).toFixed(2));

            const order = await Order.create({
                userId,
                sellerId,
                items: group.items,
                totalAmount: parseFloat(sellerGroupAmount.toFixed(2)),
                adminCommissionAmount: sellerGroupAdminComm,
                sellerAmount: sellerGroupFinalAmount,
                couponId,
                paymentMethod,
                addressId,
                trackingHistory: [{
                    status: 'pending',
                    description: 'Order successfully placed via COD'
                }]
            });

            createdOrders.push(order);

            // Notify seller
            await emitUserNotification({
                userId: sellerId,
                event: 'notify',
                data: {
                    type: 'new_order',
                    message: `New Order #${order._id.toString().slice(-6).toUpperCase()}`,
                    payload: { orderId: order._id }
                }
            });
        }

        // Payment record
        await Payment.create({
            userId,
            orderId: createdOrders[0]._id,
            orderIds: createdOrders.map(o => o._id),
            paymentMethod,
            amount: finalTotal,
            sellerAmount: finalSellerAmount,
            adminCommission: adminCommAmount,
            status: 'pending'
        });

        // Stock update
        for (const item of enrichedItems) {
            await adjustProductStock(item, -item.quantity);
        }

        // Clear cart
        await Cart.findOneAndUpdate({ userId }, { items: [] });

        // Coupon update
        if (couponId) {
            await Coupon.findByIdAndUpdate(couponId, {
                $addToSet: { usedBy: userId }
            });
        }

        // Admin notification
        await emitRoleNotification({
            designations: ['admin'],
            event: 'notify',
            data: {
                type: 'new_order',
                message: `New COD Order Received for User ${userId}`,
                payload: { orderIds: createdOrders.map(o => o._id) }
            }
        });

        return res.status(201).json({
            success: true,
            data: createdOrders[0]
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAllOrders = async (req, res) => {
    try {
        const today = new Date();
        const orders = await Order.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    address: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$userId.addresses',
                                    as: 'addr',
                                    cond: { $eq: ['$$addr._id', '$addressId'] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
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
                    from: 'users',
                    localField: 'items.productId.sellerId',
                    foreignField: '_id',
                    as: 'items.productId.sellerId'
                }
            },
            {
                $unwind: {
                    path: '$items.productId.sellerId',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'items.productId.sellerId.password': 0,
                    'items.productId.sellerId.gstDetails': 0,
                    'items.productId.sellerId.bankDetails': 0,
                    'items.productId.sellerId.pickupAddress': 0,
                    'items.productId.sellerId.otpVerification': 0,
                    'items.productId.sellerId.agreement': 0,
                    'items.productId.sellerId.status': 0,
                    'items.productId.sellerId.onboardingStep': 0,
                    'items.productId.sellerId.isOnboardingCompleted': 0,
                    'items.productId.sellerId.stripeAccountId': 0,
                    'items.productId.sellerId.addresses': 0,
                    'items.productId.sellerId.role': 0,
                    'items.productId.sellerId.isVerified': 0,
                    'items.productId.sellerId.__v': 0,
                    'items.productId.sellerId.createdAt': 0,
                    'items.productId.sellerId.updatedAt': 0
                }
            },
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
                                                else: null
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
                $lookup: {
                    from: 'coupons',
                    localField: 'couponId',
                    foreignField: '_id',
                    as: 'couponId'
                }
            },
            { $unwind: { path: '$couponId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment'
                }
            },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    userId: { $first: '$userId' },
                    items: { $push: '$items' },
                    totalAmount: { $first: '$totalAmount' },
                    status: { $first: '$status' },
                    paymentMethod: { $first: '$paymentMethod' },
                    address: { $first: '$address' },
                    createdAt: { $first: '$createdAt' },
                    payment: { $first: '$payment' },
                    trackingHistory: { $first: '$trackingHistory' },
                    couponId: { $first: '$couponId' }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const ordersWithPayments = orders.map(order => {
            // order.displayStatus = calculateDynamicStatus(order);

            order.items = order.items.map(item => {
                const product = item.productId;

                // New system: use prices from the order items
                if (item.price !== undefined && item.price !== null) {
                    item.selectedVariant = {
                        price: item.price,
                        discountPrice: item.discountPrice,
                        ...(product?.weighstWise?.[0] || {})
                    };
                    if (product?.weighstWise && item.variantId) {
                        const found = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                        if (found) {
                            item.selectedVariant.weight = found.weight;
                            item.selectedVariant.unit = found.unit;
                        }
                    }
                } else if (product && product.weighstWise) {
                    let foundVariant = null;
                    if (item.variantId) {
                        foundVariant = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                    }
                    item.selectedVariant = foundVariant || product.weighstWise[0];
                }

                const { weighstWise, ...productWithoutVariants } = product || {};
                item.productId = productWithoutVariants;
                return item;
            });

            return order;
        });

        res.status(200).json({ success: true, data: ordersWithPayments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const today = new Date();
        const orders = await Order.aggregate([
            { $match: { userId: new (require('mongoose')).Types.ObjectId(req.user.id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    address: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$userId.addresses',
                                    as: 'addr',
                                    cond: { $eq: ['$$addr._id', '$addressId'] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
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
                                                else: null
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
                $lookup: {
                    from: 'coupons',
                    localField: 'couponId',
                    foreignField: '_id',
                    as: 'couponId'
                }
            },
            { $unwind: { path: '$couponId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment'
                }
            },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    userId: { $first: '$userId' },
                    items: { $push: '$items' },
                    totalAmount: { $first: '$totalAmount' },
                    status: { $first: '$status' },
                    paymentMethod: { $first: '$paymentMethod' },
                    address: { $first: '$address' },
                    createdAt: { $first: '$createdAt' },
                    payment: { $first: '$payment' },
                    trackingHistory: { $first: '$trackingHistory' },
                    couponId: { $first: '$couponId' }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const ordersWithPayments = orders.map(order => {
            // order.displayStatus = calculateDynamicStatus(order);

            order.items = order.items.map(item => {
                const product = item.productId;
                if (item.price !== undefined && item.price !== null) {
                    item.selectedVariant = {
                        price: item.price,
                        discountPrice: item.discountPrice,
                        ...(product?.weighstWise?.[0] || {})
                    };
                    if (product?.weighstWise && item.variantId) {
                        const found = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                        if (found) {
                            item.selectedVariant.weight = found.weight;
                            item.selectedVariant.unit = found.unit;
                        }
                    }
                } else if (product && product.weighstWise) {
                    let foundVariant = null;
                    if (item.variantId) {
                        foundVariant = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                    }
                    item.selectedVariant = foundVariant || product.weighstWise[0];
                }

                const { weighstWise, ...productWithoutVariants } = product || {};
                item.productId = productWithoutVariants;
                return item;
            });

            return order;
        });

        res.status(200).json({ success: true, data: ordersWithPayments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await getOrderWithOffers(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrdersByIds = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ success: false, message: 'No order IDs provided' });

        const orderIdArray = ids.split(',').map(id => id.trim());
        const orders = await Promise.all(orderIdArray.map(id => getOrderWithOffers(id)));

        return res.status(200).json({
            success: true,
            data: orders.filter(o => o !== null)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            status,
            $push: { trackingHistory: { status, timestamp: new Date(), description: `Order status updated to ${status}` } }
        }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Logic for COD: Update payment status to 'paid' when delivered or completed
        if (updatedOrder.paymentMethod === 'COD' && (status === 'delivered' || status === 'completed')) {
            await Payment.findOneAndUpdate(
                { orderId: updatedOrder._id },
                { status: 'paid' }
            );
        }

        const order = await getOrderWithOffers(req.params.id);

        // Notify User about status update
        if (order) {
            await emitUserNotification({
                userId: order.userId?._id || order.userId,
                event: 'notify',
                data: {
                    type: 'order_status',
                    message: `Order #${order._id.toString().slice(-6).toUpperCase()} status updated to: ${status}`,
                    payload: { orderId: order._id, status }
                }
            });

            // If completed or delivered, also notify admin for summary
            if (status === 'completed' || status === 'delivered') {
                await emitRoleNotification({
                    designations: ['admin'],
                    event: 'notify',
                    data: {
                        type: 'order_completed',
                        message: `Order #${order._id.toString().slice(-6).toUpperCase()} has been delivered successfully.`,
                        payload: { orderId: order._id }
                    }
                });

                // Notify sellers involved in the order
                if (order.items && order.items.length > 0) {
                    const sellerIds = [...new Set(order.items.map(item =>
                        item.productId?.sellerId?._id || item.productId?.sellerId || item.sellerId
                    ).filter(Boolean))];

                    for (const sId of sellerIds) {
                        await emitUserNotification({
                            userId: sId,
                            event: 'notify',
                            data: {
                                type: 'order_delivered',
                                message: `Order #${order._id.toString().slice(-6).toUpperCase()} containing your product(s) has been delivered.`,
                                payload: { orderId: order._id }
                            }
                        });
                    }
                }
            }
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const order = await getOrderWithOffers(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const trackingMap = {};
        if (order.trackingHistory) {
            order.trackingHistory.forEach(entry => {
                trackingMap[entry.status.toLowerCase()] = entry.timestamp || entry.date || new Date();
            });
        }

        const createdAt = new Date(order.createdAt);

        const getStepTime = (statusId, fallbackMinutes) => {
            if (trackingMap[statusId]) return new Date(trackingMap[statusId]);
            return new Date(createdAt.getTime() + fallbackMinutes * 60 * 1000);
        };

        const displayStatus = (order.displayStatus || order.status)?.toLowerCase();

        const steps = [
            {
                status: "Order Placed",
                date: getStepTime('pending', 0),
                isCompleted: true
            },
            {
                status: "Processing",
                date: getStepTime('processing', 15),
                isCompleted: ['processing', 'shipped', 'out for delivery', 'delivered', 'completed'].includes(displayStatus)
            },
            {
                status: "Shipped",
                date: getStepTime('shipped', 45),
                isCompleted: ['shipped', 'out for delivery', 'delivered', 'completed'].includes(displayStatus)
            },
            {
                status: "Out for Delivery",
                date: getStepTime('out for delivery', 60),
                isCompleted: ['out for delivery', 'delivered', 'completed'].includes(displayStatus)
            },
            {
                status: "Delivered",
                date: getStepTime('delivered', 120),
                isCompleted: ['delivered', 'completed'].includes(displayStatus)
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                ...order,
                steps
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (['completed', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled — it is already ${order.status}`
            });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        order.status = 'cancelled';
        await order.save();

        // restock variant wise cancelled order
        for (const item of order.items) {
            await adjustProductStock(item, +item.quantity);
        }

        const payment = await Payment.findOne({ orderId: order._id });
        if (payment) {
            if (order.paymentMethod === 'Stripe') {
                if (payment.stripePaymentIntentId) {
                    try {

                        await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
                    } catch (err) {
                        console.error("Stripe refund error:", err);
                    }
                }
                payment.status = 'refunded';
            } else {
                payment.status = 'cancelled';
            }
            await payment.save();
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { paymentId } = session.metadata;

        const paymentIntentId = session.payment_intent;

        const payment = await Payment.findById(paymentId);
        if (payment && !payment.orderId && payment.pendingOrderData) {
            const orderData = payment.pendingOrderData;

            if (orderData.isSplitOrder) {
                const { sellerGroups } = await groupItemsBySeller(orderData.items);
                const createdOrders = [];

                for (const sellerId in sellerGroups) {
                    const group = sellerGroups[sellerId];
                    const sellerGroupAmount = group.totalAmount;
                    const sellerGroupAdminComm = parseFloat((sellerGroupAmount * 0.10).toFixed(2));
                    const sellerGroupFinalAmount = parseFloat((sellerGroupAmount - sellerGroupAdminComm).toFixed(2));

                    const order = await Order.create({
                        ...orderData,
                        sellerId,
                        items: group.items,
                        totalAmount: parseFloat(sellerGroupAmount.toFixed(2)),
                        adminCommissionAmount: sellerGroupAdminComm,
                        sellerAmount: sellerGroupFinalAmount,
                        trackingHistory: [{ status: 'pending', description: 'Order successfully placed via Stripe' }]
                    });
                    createdOrders.push(order);

                    // Notify seller
                    await emitUserNotification({
                        userId: sellerId,
                        event: 'notify',
                        data: {
                            type: 'new_order',
                            message: `New Order Received via Stripe: #${order._id.toString().slice(-6).toUpperCase()}`,
                            payload: { orderId: order._id }
                        }
                    });
                }

                payment.orderId = createdOrders[0]._id; // Link to first order as primary reference
                payment.orderIds = createdOrders.map(o => o._id);
            } else {
                // Create the order finally (Legacy/Simple)
                const sellerId = orderData.items[0].sellerId;
                const order = await Order.create({
                    ...orderData,
                    sellerId,
                    adminCommissionAmount: payment.adminCommission,
                    sellerAmount: payment.sellerAmount,
                    trackingHistory: [{ status: 'pending', description: 'Order successfully placed via Stripe' }]
                });
                payment.orderId = order._id;
                payment.orderIds = [order._id];
            }

            payment.stripePaymentIntentId = paymentIntentId;
            payment.status = 'paid';
            payment.pendingOrderData = null;
            await payment.save();

            // Stocks and Cart
            for (const item of orderData.items) {
                await adjustProductStock(item, -item.quantity);
            }
            await Cart.findOneAndUpdate({ userId: orderData.userId }, { items: [] });
            if (orderData.couponId) {
                await Coupon.findByIdAndUpdate(orderData.couponId, { $addToSet: { usedBy: orderData.userId } });
            }

            // Notifications
            await emitUserNotification({
                userId: orderData.userId,
                event: 'notify',
                data: {
                    type: 'order_status',
                    message: `Payment successful! Your order has been placed and split among ${Object.keys(orderData.sellerGroups || {}).length || 'relevant'} sellers.`,
                    payload: { paymentId: payment._id }
                }
            });

            // Perform Seller-Wise Stripe Transfers
            if (paymentIntentId) {
                const { sellerGroups } = await groupItemsBySeller(orderData.items);
                await transferToSellers(sellerGroups, paymentIntentId);
            }

            await emitRoleNotification({
                designations: ['admin'],
                event: 'notify',
                data: {
                    type: 'new_order',
                    message: `Payment received for split orders. (Stripe Webhook)`,
                    payload: { paymentId: payment._id }
                }
            });
        }
    }
    res.json({ received: true });
};

exports.verifyStripeSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID is required' });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { paymentId } = session.metadata;
            let payment = await Payment.findById(paymentId);
            const paymentIntentId = session.payment_intent;

            if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

            let order;
            if (payment.orderId) {
                // Order already created by webhook or previous verify call
                order = await Order.findById(payment.orderId);
            } else if (payment.pendingOrderData) {
                // Create the order now
                const orderData = payment.pendingOrderData;

                if (orderData.isSplitOrder) {
                    const { sellerGroups } = await groupItemsBySeller(orderData.items);
                    const createdOrders = [];

                    for (const sellerId in sellerGroups) {
                        const group = sellerGroups[sellerId];
                        const sellerGroupAmount = group.totalAmount;
                        const sellerGroupAdminComm = parseFloat((sellerGroupAmount * 0.10).toFixed(2));
                        const sellerGroupFinalAmount = parseFloat((sellerGroupAmount - sellerGroupAdminComm).toFixed(2));

                        const order = await Order.create({
                            ...orderData,
                            sellerId,
                            items: group.items,
                            totalAmount: parseFloat(sellerGroupAmount.toFixed(2)),
                            adminCommissionAmount: sellerGroupAdminComm,
                            sellerAmount: sellerGroupFinalAmount,
                            trackingHistory: [{ status: 'pending', description: 'Order successfully placed via Stripe' }]
                        });
                        createdOrders.push(order);

                        // Notify seller
                        await emitUserNotification({
                            userId: sellerId,
                            event: 'notify',
                            data: {
                                type: 'new_order',
                                message: `New Order Received via Stripe: #${order._id.toString().slice(-6).toUpperCase()}`,
                                payload: { orderId: order._id }
                            }
                        });
                    }

                    payment.orderId = createdOrders[0]._id;
                    payment.orderIds = createdOrders.map(o => o._id);
                    order = createdOrders[0]; // Set one for the response
                } else {
                    const sellerId = orderData.items[0].sellerId;
                    order = await Order.create({
                        ...orderData,
                        sellerId,
                        adminCommissionAmount: payment.adminCommission,
                        sellerAmount: payment.sellerAmount,
                        trackingHistory: [{ status: 'pending', description: 'Order successfully placed via Stripe' }]
                    });
                    payment.orderId = order._id;
                    payment.orderIds = [order._id];
                }

                payment.status = 'paid';
                payment.pendingOrderData = null;
                payment.stripePaymentIntentId = paymentIntentId;
                await payment.save();

                // Stock update
                for (const item of orderData.items) {
                    await adjustProductStock(item, -item.quantity);
                }

                // Clear cart
                await Cart.findOneAndUpdate({ userId: orderData.userId }, { items: [] });
                if (orderData.couponId) {
                    await Coupon.findByIdAndUpdate(orderData.couponId, { $addToSet: { usedBy: orderData.userId } });
                }

                // Notify admin
                await emitRoleNotification({
                    designations: ['admin'],
                    event: 'notify',
                    data: {
                        type: 'new_order',
                        message: `Stripe Payment Verified: Multiple Orders created.`,
                        payload: { userId: orderData.userId }
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified and Order created',
                data: order
            });
        }

        return res.status(400).json({ success: false, message: 'Payment not completed' });
    } catch (error) {
        console.error("verifyStripeSession error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerOrderById = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const orderId = req.params.id;

        const orders = await Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
            { $unwind: "$items" },
            { $match: { "items.sellerId": new mongoose.Types.ObjectId(sellerId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "payments",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "payment"
                }
            },
            { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "items.productId"
                }
            },
            { $unwind: { path: "$items.productId", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "items.selectedVariant": {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$items.productId.weighstWise",
                                    as: "w",
                                    cond: { $eq: ["$$w._id", "$items.variantId"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userId: {
                        $first: {
                            _id: "$user._id",
                            firstname: "$user.firstname",
                            lastname: "$user.lastname",
                            email: "$user.email",
                            mobileno: "$user.mobileno",
                            addresses: "$user.addresses"
                        }
                    },
                    items: { $push: "$items" },
                    totalAmount: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    status: { $first: "$status" },
                    paymentMethod: { $first: "$paymentMethod" },
                    addressId: { $first: "$addressId" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    payment: { $first: "$payment" },
                    trackingHistory: { $first: "$trackingHistory" }
                }
            },
            {
                $addFields: {
                    address: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$userId.addresses",
                                    as: "addr",
                                    cond: { $eq: ["$$addr._id", "$addressId"] }
                                }
                            },
                            0
                        ]
                    }
                }
            }
        ]);

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found for this seller" });
        }

        const order = orders[0];
        order.items = order.items.map(item => {
            const product = item.productId;
            if (item.price !== undefined && item.price !== null) {
                item.selectedVariant = {
                    price: item.price,
                    discountPrice: item.discountPrice,
                    ...(product?.weighstWise?.[0] || {})
                };
                if (product?.weighstWise && item.variantId) {
                    const found = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                    if (found) {
                        item.selectedVariant.weight = found.weight;
                        item.selectedVariant.unit = found.unit;
                        item.selectedVariant.stock = found.stock;
                        item.selectedVariant._id = found._id;
                    }
                }
            } else if (product && product.weighstWise) {
                let foundVariant = null;
                if (item.variantId) {
                    foundVariant = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                }
                item.selectedVariant = foundVariant || product.weighstWise[0];
            }

            const { weighstWise, ...productWithoutVariants } = product || {};
            item.productId = productWithoutVariants;
            return item;
        });

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("getSellerOrderById error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const orders = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.sellerId": new mongoose.Types.ObjectId(sellerId) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "payments",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "payment"
                }
            },
            { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "items.productId"
                }
            },
            { $unwind: { path: "$items.productId", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "items.selectedVariant": {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$items.productId.weighstWise",
                                    as: "w",
                                    cond: { $eq: ["$$w._id", "$items.variantId"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userId: {
                        $first: {
                            _id: "$user._id",
                            firstname: "$user.firstname",
                            lastname: "$user.lastname",
                            email: "$user.email",
                            mobileno: "$user.mobileno",
                            addresses: "$user.addresses"
                        }
                    },
                    items: { $push: "$items" },
                    totalAmount: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    status: { $first: "$status" },
                    paymentMethod: { $first: "$paymentMethod" },
                    addressId: { $first: "$addressId" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    payment: { $first: "$payment" },
                    trackingHistory: { $first: "$trackingHistory" }
                }
            },
            {
                $addFields: {
                    address: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$userId.addresses",
                                    as: "addr",
                                    cond: { $eq: ["$$addr._id", "$addressId"] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const ordersWithPayments = orders.map(order => {
            order.items = order.items.map(item => {
                const product = item.productId;
                if (item.price !== undefined && item.price !== null) {
                    item.selectedVariant = {
                        price: item.price,
                        discountPrice: item.discountPrice,
                        ...(product?.weighstWise?.[0] || {})
                    };
                    if (product?.weighstWise && item.variantId) {
                        const found = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                        if (found) {
                            item.selectedVariant.weight = found.weight;
                            item.selectedVariant.unit = found.unit;
                            item.selectedVariant.stock = found.stock;
                            item.selectedVariant._id = found._id;
                        }
                    }
                } else if (product && product.weighstWise) {
                    let foundVariant = null;
                    if (item.variantId) {
                        foundVariant = product.weighstWise.find(v => (v._id || v).toString() === item.variantId.toString());
                    }
                    item.selectedVariant = foundVariant || product.weighstWise[0];
                }

                const { weighstWise, ...productWithoutVariants } = product || {};
                item.productId = productWithoutVariants;
                return item;
            });

            return order;
        });

        res.status(200).json({
            success: true,
            data: ordersWithPayments
        });
    } catch (error) {
        console.error("getSellerOrders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

