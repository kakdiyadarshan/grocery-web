const mongoose = require('mongoose');

const subscribeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    status: {
        type: String,
        enum: ['Active', 'Unsubscribed'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscribe', subscribeSchema);
