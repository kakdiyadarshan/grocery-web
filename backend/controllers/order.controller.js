const Order = require('../models/order.model');
const Coupon = require('../models/coupon.model');
const Payment = require('../models/payment.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Helper to attach selected variant and remove the full list for order items
const transformOrderResponse = (order) => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.map(item => {
        const product = item.productId;
        
        if (product && product.weighstWise) {
            // Find the specified variant OR fallback to the first available one
            let foundVariant = null;
            if (item.variantId) {
                foundVariant = product.weighstWise.find(v => (v._id || v).toString() === (item.variantId || "").toString());
            }
            
            // Critical fallback: ensure frontend always shows a weight and price
            item.selectedVariant = foundVariant || product.weighstWise[0];
        }

        // Return a copy of the product without weighstWise to the frontend
        if (item.productId) {
            const { weighstWise, ...productWithoutVariants } = item.productId;
            item.productId = productWithoutVariants;
        }

        return item;
    });
    return orderObj;
};


exports.createOrder = async (req, res) => {
    try {
        let { userId, items, totalAmount, couponId, paymentMethod, upiDetails, bankDetails } = req.body;
        if (!userId || !items || !totalAmount || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'User ID, items, total amount, and payment method are required.' });
        }

        totalAmount = parseFloat(Number(totalAmount).toFixed(2));


        // Validate coupon if provided
        if (couponId) {
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: 'Coupon not found' });
            }
            if (!coupon.isActive) {
                return res.status(400).json({ success: false, message: 'Coupon is expired or inactive' });
            }
        }

        const order = await Order.create({ userId, items, totalAmount, couponId });

        // Handle Stripe Payment
        if (paymentMethod === 'Stripe') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: `Order #${order._id}`,
                            },
                            unit_amount: Math.round(totalAmount * 100),
                        },
                        quantity: 1,
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/order-completed?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
                cancel_url: `${process.env.CLIENT_URL}/checkout`,
                metadata: {
                    orderId: order._id.toString(),
                    userId: userId.toString(),
                }
            });

            const populatedOrder = await Order.findById(order._id).populate('items.productId', 'name images price discountPrice weighstWise');

            return res.status(200).json({
                success: true,
                message: 'Stripe session created',
                data: { orderId: order._id, paymentUrl: session.url, order: transformOrderResponse(populatedOrder) }
            });

        }

        // Handle COD, UPI, Bank
        const payment = new Payment({
            userId,
            orderId: order._id,
            paymentMethod,
            amount: totalAmount,
            status: paymentMethod === 'COD' ? 'pending' : 'completed',
            upiDetails,
            bankDetails
        });
        await payment.save();

        const populatedOrder = await Order.findById(order._id).populate('items.productId', 'name images price discountPrice weighstWise');

        res.status(201).json({
            success: true,
            message: 'Order and payment recorded successfully',
            data: { order: transformOrderResponse(populatedOrder), payment }
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
};


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').populate('items.productId', 'name').populate('couponId', 'code discount');
        res.status(200).json({ success: true, message: 'Orders fetched successfully', data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('items.productId', 'name images price discountPrice weighstWise')
            .populate('couponId', 'code discount');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, message: 'Order fetched successfully', data: transformOrderResponse(order) });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order status updated successfully', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).populate('items.productId', 'name').populate('couponId', 'code discount');
        res.status(200).json({ success: true, message: 'Orders fetched successfully', data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling order', error: error.message });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const createdAt = new Date(order.createdAt);
        const now = new Date();
        const estimatedDelivery = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000); // Placed + 2 hours

        // Auto-status logic for tracking display
        const isDelivered = order.status === "completed" || now >= estimatedDelivery;
        const isProcessing = order.status !== "pending" || now >= new Date(createdAt.getTime() + 15 * 60 * 1000);
        const isOutForDelivery = order.status === "completed" || now >= new Date(createdAt.getTime() + 60 * 60 * 1000);

        // Define tracking steps
        const steps = [
            { status: "Order Placed", date: createdAt, isCompleted: true },
            { status: "Processing", date: new Date(createdAt.getTime() + 15 * 60 * 1000), isCompleted: isProcessing },
            { status: "Out for Delivery", date: new Date(createdAt.getTime() + 60 * 60 * 1000), isCompleted: isOutForDelivery },
            { status: "Delivered", date: estimatedDelivery, isCompleted: isDelivered }
        ];

        res.status(200).json({
            success: true,
            message: 'Tracking info fetched successfully',
            data: {
                orderId: order._id,
                currentStatus: isDelivered ? "Delivered" : order.status,
                placedAt: createdAt,
                estimatedDelivery: estimatedDelivery,
                steps: steps
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error tracking order', error: error.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { orderId, userId } = session.metadata;

        // Update Order
        await Order.findByIdAndUpdate(orderId, { status: 'completed' });

        // Update or Create Payment
        await Payment.findOneAndUpdate(
            { orderId },
            {
                userId,
                orderId,
                paymentMethod: 'Stripe',
                amount: session.amount_total / 100,
                status: 'completed',
            },
            { upsert: true, new: true }
        );
        console.log(`Payment confirmed for Order ${orderId}`);
    }

    res.json({ received: true });
};
