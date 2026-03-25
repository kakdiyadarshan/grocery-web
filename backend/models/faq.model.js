const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    faqs: [{
        faqQuestion: {
            type: String,
            required: true,
        },
        faqAnswer: {
            type: String,
            required: true,
        },
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('faq', faqSchema);