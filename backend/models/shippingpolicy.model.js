const mongoose = require('mongoose');

const shippingPolicySchema = new mongoose.Schema({
    description: {
        type: String
    },
    type: {
        type: String,
        default: 'text'
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("shippingpolicy", shippingPolicySchema);
