const Order = require('../models/order.model');
const Coupon = require('../models/coupon.model');

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, couponId } = req.body;
        if (!userId || !items || !totalAmount) {
            return res.status(400).json({ success: false, message: 'User ID, items, and total amount are required.' });
        }

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
        res.status(201).json({ success: true, message: 'Order created successfully', data: order });
    } catch (error) {
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
        const order = await Order.findById(req.params.id).populate('userId', 'name email').populate('items.productId', 'name').populate('couponId', 'code discount');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order fetched successfully', data: order });
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