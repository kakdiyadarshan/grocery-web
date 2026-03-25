const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    product_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    offer_type: {
        type: String,
        enum: ['Discount', 'Fixed'],
        required: true
    },
    offer_value: {
        type: Number,
        required: true,
        min: 0
    },
    offer_start_date: {
        type: Date,
        required: true
    },
    offer_end_date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
