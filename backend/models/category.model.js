const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        url: { type: String },
        public_id: { type: String }
    },
    description: {
        type: String
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        },
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.model("category", categorySchema);