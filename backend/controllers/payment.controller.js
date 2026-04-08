const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

exports.createPayment = async (req, res) => {
    try {
        const { userId, orderId, paymentMethod, amount, status } = req.body;
        const payment = new Payment({
            userId,
            orderId,
            paymentMethod,
            amount,
            status
        });
        await payment.save();
        const populatedPayment = await Payment.findById(payment._id).populate("userId", "firstname lastname email");
        res.status(201).json({ success: true, message: 'Payment created successfully', data: populatedPayment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true }).populate("userId", "firstname lastname email");
        res.status(200).json({ success: true, message: 'Payment status updated successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id).populate("userId", "firstname lastname email");
        res.status(200).json({ success: true, message: 'Payment found successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate("userId", "firstname lastname email").sort({ createdAt: -1 });
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

exports.getSellerPayments = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user._id);

        const payments = await Order.aggregate([

            // Match seller inside items array
            {
                $match: {
                    "items.sellerId": sellerId
                }
            },

            {
                $addFields: {
                    sellerItems: {
                        $filter: {
                            input: "$items",
                            as: "item",
                            cond: { $eq: ["$$item.sellerId", sellerId] }
                        }
                    }
                }
            },

            // Lookup payment
            {
                $lookup: {
                    from: "payments",
                    localField: "_id",
                    foreignField: "orderId", //  IMPORTANT CHANGE
                    as: "paymentInfo"
                }
            },

            { $unwind: { path: "$paymentInfo", preserveNullAndEmptyArrays: true } },

            //  User info
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },

            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

            // Calculate Seller Specific Total & Commission
            {
                $addFields: {
                    sellerTotal: { 
                        $sum: { 
                            $map: { 
                                input: "$sellerItems", 
                                as: "item", 
                                in: { $multiply: ["$$item.price", "$$item.quantity"] } 
                            } 
                        } 
                    },
                    // Use admin commission percentage from order (default 10)
                    activeCommission: { $ifNull: ["$adminCommission", 10] }
                }
            },
            {
                $addFields: {
                    commissionAmount: { 
                        $divide: [{ $multiply: ["$sellerTotal", "$activeCommission"] }, 100] 
                    }
                }
            },
            {
                $addFields: {
                    finalSellerShare: { 
                        $subtract: ["$sellerTotal", "$commissionAmount"] 
                    }
                }
            },

            // Final output
            {
                $project: {
                    _id: { $ifNull: ["$paymentInfo._id", "$_id"] },
                    orderId: "$_id",
                    paymentMethod: {
                        $ifNull: ["$paymentInfo.paymentMethod", "$paymentMethod"]
                    },
                    amount: { $round: ["$finalSellerShare", 2] }, 
                    adminCommission: "$activeCommission",
                    adminCommissionAmount: { $round: ["$commissionAmount", 2] },
                    status: { $ifNull: ["$paymentInfo.status", "pending"] },
                    createdAt: {
                        $ifNull: ["$paymentInfo.createdAt", "$createdAt"]
                    },
                    userName: {
                        $concat: ["$userInfo.firstname", " ", "$userInfo.lastname"]
                    },
                    email: "$userInfo.email",
                    items: "$sellerItems"
                }
            },

            { $sort: { createdAt: -1 } }

        ]);

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error("getSellerPayments error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};