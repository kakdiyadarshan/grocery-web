const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            variantId: {
                type: String,
                required: false
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            discountPrice: {
                type: Number,
                default: null
            },
            sellerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "out for delivery", "delivered", "completed", "cancelled"],
        default: "pending"
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null
    },
    paymentMethod: {
        type: String,
        default: "COD"
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    trackingHistory: [
        {
            status: String,
            timestamp: { type: Date, default: Date.now },
            description: String
        }
    ],
    adminCommission: {
        type: Number,
        default: 10 // 10%
    },
    adminCommissionAmount: {
        type: Number,
        default: 0
    },
    sellerAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


module.exports = mongoose.model("Order", orderSchema);