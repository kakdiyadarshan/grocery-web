const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }],
    weighstWise: [{
        weight: {
            type: String,
            required: true,
        },
        unit: {
            type: String,
            required: true,
            enum: ['Gram', 'Kilogram', 'Pound', 'Liter', 'Milliliter', 'Piece'],
            default: 'Kilogram'
        },
        price: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
        }
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        enum: ['featured', 'best_selling'],
        default: []
    },
    sku: {
        type: String,
        default: ""
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Product", productSchema);
