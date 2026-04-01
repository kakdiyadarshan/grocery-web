const Order = require('../models/order.model');
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
    order.displayStatus = calculateDynamicStatus(order);
    
    order.items = order.items.map(item => {
        const product = item.productId;
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
        let { userId, items, totalAmount, couponId, paymentMethod, addressId, upiDetails, bankDetails } = req.body;
        
        if (!userId || !items || !totalAmount || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        totalAmount = parseFloat(Number(totalAmount).toFixed(2));
        const order = await Order.create({ 
            userId, items, totalAmount, couponId, paymentMethod, addressId,
            trackingHistory: [{ status: 'pending', description: 'Order successfully placed' }]
        });

        if (paymentMethod === 'Stripe') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd', // changed to USD
                        product_data: { name: `Order ${order._id}` },
                        unit_amount: Math.round(totalAmount * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/order-completed?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
                cancel_url: `${process.env.CLIENT_URL}/checkout`,
                metadata: { orderId: order._id.toString() }
            });

            await Payment.create({ userId, orderId: order._id, paymentMethod, amount: totalAmount, status: 'pending' });
            return res.status(200).json({ success: true, data: { orderId: order._id, paymentUrl: session.url } });
        }

        await Payment.create({ userId, orderId: order._id, paymentMethod, amount: totalAmount, status: 'pending', upiDetails, bankDetails });
        
        // stock minus variant wise
        for (const item of items) {
            await adjustProductStock(item, -item.quantity);
        }

        await Cart.findOneAndUpdate({ userId }, { items: [] });

        // Notify Admins about new order
        await emitRoleNotification({
            designations: ['admin'],
            event: 'notify',
            data: {
                type: 'new_order',
                message: `New Order Received: #${order._id.toString().slice(-6).toUpperCase()}`,
                payload: { orderId: order._id }
            }
        });

        const populatedOrder = await Order.findById(order._id).populate('addressId').populate('items.productId');
        res.status(201).json({ success: true, data: await transformAndAutoUpdate(populatedOrder) });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
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
            order.displayStatus = calculateDynamicStatus(order);
            
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
            order.displayStatus = calculateDynamicStatus(order);
            
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

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { 
            status,
            $push: { trackingHistory: { status, timestamp: new Date(), description: `Order status updated to ${status}` } }
        });
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
        
        const createdAt = new Date(order.createdAt);
        const steps = [
            { status: "Order Placed", date: createdAt, isCompleted: true },
            { status: "Processing", date: new Date(createdAt.getTime() + 15 * 60 * 1000), isCompleted: ['processing', 'shipped', 'out for delivery', 'delivered', 'completed'].includes(order.displayStatus) },
            { status: "Shipped", date: new Date(createdAt.getTime() + 45 * 60 * 1000), isCompleted: ['shipped', 'out for delivery', 'delivered', 'completed'].includes(order.displayStatus) },
            { status: "Out for Delivery", date: new Date(createdAt.getTime() + 60 * 60 * 1000), isCompleted: ['out for delivery', 'delivered', 'completed'].includes(order.displayStatus) },
            { status: "Delivered", date: new Date(createdAt.getTime() + 120 * 60 * 1000), isCompleted: ['delivered', 'completed'].includes(order.displayStatus) }
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
        if (order.paymentMethod === 'Stripe') {
            const payment = await Payment.findOne({ orderId: order._id });
            if (payment?.stripePaymentIntentId) {
                await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
            }
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
        const { orderId } = session.metadata;
        const order = await Order.findByIdAndUpdate(orderId, { status: 'completed' }, { new: true });
        if (order) {
            await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
            await Payment.findOneAndUpdate({ orderId: order._id }, { status: 'paid' });

            // Notify user and admin
            await emitUserNotification({
                userId: order.userId,
                event: 'notify',
                data: {
                    type: 'order_status',
                    message: `Payment successful! Order #${order._id.toString().slice(-6).toUpperCase()} is now being processed.`,
                    payload: { orderId: order._id, status: 'completed' }
                }
            });

            await emitRoleNotification({
                designations: ['admin'],
                event: 'notify',
                data: {
                    type: 'new_order',
                    message: `Payment received for Order #${order._id.toString().slice(-6).toUpperCase()}. (Stripe)`,
                    payload: { orderId: order._id }
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
            const orderId = session.metadata.orderId;
            const order = await Order.findById(orderId);
            
            if (order && order.status !== 'completed') {
                order.status = 'completed';
                await order.save();
                
                await Payment.findOneAndUpdate({ orderId: order._id }, { status: 'paid' });
                await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
            }
            return res.status(200).json({ success: true, message: 'Payment verified', data: order });
        }
        
        return res.status(400).json({ success: false, message: 'Payment not completed or session invalid' });
    } catch (error) {
        console.error("verifyStripeSession error:", error);
    }
};

// Removed getOrderMonthlyAnalytics and getRevenueAnalytics (moved to dashboard.controller.js)
