const Payment = require('../models/payment.model');

exports.createPayment = async (req, res) => {
    try {
        const { userId, orderId, paymentMethod, amount, status, upiDetails, bankDetails } = req.body;
        const payment = new Payment({
            userId,
            orderId,
            paymentMethod,
            amount,
            status,
            upiDetails,
            bankDetails
        });
        await payment.save();
        res.status(201).json({ success: true, message: 'Payment created successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, message: 'Payment status updated successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        res.status(200).json({ success: true, message: 'Payment found successfully', data: payment });  
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        res.status(200).json({ success: true, message: 'Payments found successfully', data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}   

exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Payment deleted successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getPaymentByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ userId });
        res.status(200).json({ success: true, message: 'Payments found successfully', data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getPaymentByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOne({ orderId });
        res.status(200).json({ success: true, message: 'Payment found successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
    