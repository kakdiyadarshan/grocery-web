const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                const today = new Date();
                today.setHours(0,0,0,0);
                return v > today;
            },
            message: "Expiry date must be in the future (after today)."
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);    