const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    description: { type: String, required: false },
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    },
    buttonText: { type: String, default: 'Shop Now' },
    bgColor: { type: String, default: 'bg-[#f1fcf1]' },
    link: { type: String, default: '/shop' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    titleStyle: {
        color: { type: String, default: '#1b1b1b' },
        fontSize: { type: String, default: '48px' }
    },
    subtitleStyle: {
        color: { type: String, default: '#555555' },
        fontSize: { type: String, default: '16px' }
    },
    textPosition: { type: String, default: 'left', enum: ['left', 'center', 'right'] }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
