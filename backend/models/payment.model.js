const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: false // Changed to false because Stripe orders are created after payment
    },
    pendingOrderData: {
        type: Object,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Stripe"],
        required: true
    },
    stripePaymentIntentId: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);