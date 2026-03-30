const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobileno: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    otp: {
        type: Number
    },
    otpExpiresAt: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    photo: {
        url: { type: String },
        public_id: { type: String }
    },
    addresses: [
        {
            firstname: { type: String },
            lastname: { type: String },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true },
            isDefault: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ],
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


userSchema.index({ email: 1, role: 1 }, { unique: true });
module.exports = mongoose.model("User", userSchema);
