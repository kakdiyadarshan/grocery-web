const mongoose = require('mongoose');

const privacySchema = new mongoose.Schema({
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

module.exports = mongoose.model("privacy", privacySchema);