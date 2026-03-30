const Order = require('../models/order.model');
const Coupon = require('../models/coupon.model');
const Payment = require('../models/payment.model');
const Cart = require('../models/cart.model');
const Address = require('../models/address.model'); // Added missing model
const Product = require('../models/product.model'); // Added missing model
const User = require('../models/user.model'); // Added missing model
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper to determine dynamic status based on time
const calculateDynamicStatus = (order) => {
    if (order.status === 'completed' || order.status === 'cancelled') return order.status;

    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - createdAt) / 60000);

    if (diffInMinutes >= 120) return 'completed';
    if (diffInMinutes >= 60) return 'Out for Delivery';
    if (diffInMinutes >= 15) return 'Processing';

    return order.status || 'pending';
};

// Helper to transform order and potentially auto-update in DB
const transformAndAutoUpdate = async (order) => {
    if (!order) return null;
    const currentStatus = order.status;
    const dynamicStatus = calculateDynamicStatus(order);

    if (dynamicStatus === 'completed' && currentStatus === 'pending') {
        order.status = 'completed';
        await Order.findByIdAndUpdate(order._id, { status: 'completed' });
    }

    // Convert Mongoose doc to plain JS object
    const orderObj = order.toObject ? order.toObject() : { ...order };

    // Now use orderObj safely
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
        let { userId, items, totalAmount, couponId, paymentMethod, addressId, upiDetails, bankDetails, addressDetails } = req.body;
        if (!userId || !items || !totalAmount || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        totalAmount = parseFloat(Number(totalAmount).toFixed(2));
        const order = await Order.create({ userId, items, totalAmount, couponId, paymentMethod, addressId });

        // Handle Stripe Payment
        if (paymentMethod === 'Stripe') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'inr',
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

            // Cart will be cleared on Webhook success for Stripe
            return res.status(200).json({ success: true, data: { orderId: order._id, paymentUrl: session.url } });
        }

        // For non-Stripe orders, clear cart immediately!
        await Cart.findOneAndUpdate({ userId }, { items: [] });

        await Payment.create({ userId, orderId: order._id, paymentMethod, amount: totalAmount, status: 'pending', upiDetails, bankDetails });
        const populatedOrder = await Order.findById(order._id)
            .populate('addressId')
            .populate('items.productId');

        res.status(201).json({ success: true, data: await transformAndAutoUpdate(populatedOrder) });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'firstname lastname email')
            .populate('addressId')
            .populate('items.productId', 'name images weighstWise')
            .sort({ createdAt: -1 });

        const transformedOrders = await Promise.all(orders.map(order => transformAndAutoUpdate(order)));
        res.status(200).json({ success: true, data: transformedOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('userId', 'firstname lastname email')
            .populate('addressId')
            .populate('items.productId', 'name images weighstWise')
            .sort({ createdAt: -1 });

        const transformedOrders = await Promise.all(orders.map(order => transformAndAutoUpdate(order)));
        res.status(200).json({ success: true, data: transformedOrders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'firstname lastname addresses')
            .populate('items.productId')
            .populate('couponId');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const transformed = await transformAndAutoUpdate(order);

        //  Fetch selected address from user's addresses array
        let address = null;

        if (order.addressId) {
            const user = await User.findOne(
                { "addresses._id": order.addressId },
                { "addresses.$": 1 }
            );

            address = user?.addresses?.[0] || null;
        }

        res.status(200).json({
            success: true,
            data: {
                ...transformed,
                address // ✅ Now you will get selected address
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId'); // keep this as before

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const transformed = await transformAndAutoUpdate(order);
        const createdAt = new Date(order.createdAt);

        // ✅ Fetch address from user's addresses array
        let address = null;
        if (order.addressId) {
            const user = await User.findOne(
                { "addresses._id": order.addressId },
                { "addresses.$": 1 }
            );
            address = user?.addresses?.[0] || null;
        }

        const steps = [
            { status: "Order Placed", date: createdAt, isCompleted: true },
            { status: "Processing", date: new Date(createdAt.getTime() + 15 * 60 * 1000), isCompleted: transformed.displayStatus !== 'pending' },
            { status: "Out for Delivery", date: new Date(createdAt.getTime() + 60 * 60 * 1000), isCompleted: ['Out for Delivery', 'completed'].includes(transformed.displayStatus) },
            { status: "Delivered", date: new Date(createdAt.getTime() + 120 * 60 * 1000), isCompleted: transformed.displayStatus === 'completed' }
        ];

        res.status(200).json({
            success: true,
            data: { ...transformed, address, steps } // ✅ address added here
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
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

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Prevent cancelling already completed/cancelled orders
        if (['completed', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled — it is already ${order.status}`
            });
        }

        // Optional: only allow the owner to cancel
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        order.status = 'cancelled';
        await order.save();

        // Optional: Refund if paid via Stripe
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
        const order = await Order.findByIdAndUpdate(orderId, { status: 'completed' });
        // After Stripe payment is successful, clear the cart!
        if (order) {
            await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
        }
    }
    res.json({ received: true });
};
