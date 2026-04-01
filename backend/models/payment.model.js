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
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Stripe"],
        required: true
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