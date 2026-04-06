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
        enum: ["user", "admin","seller"],
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
    gstDetails: {
        gstin: {
            type: String,
            uppercase: true,
        },
        businessName: String,
        panNumber: String,
        businessType: [String],
        address: Object,
        isGSTVerified: {
            type: Boolean,
            default: false,
        },

        gstVerifiedAt: Date,
    },
    otpVerification: {
        otp: String,
        expiresAt: Date,
        isOtpVerified: {
            type: Boolean,
            default: false,
        },
    },
    brandDetails: {
        storeName: {
            type: String,
        },
        ownerName: String,
        storeLogo: String,
        storeDescription: String,
    },
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
    },
    pickupAddress: {
        flatHouse: String,
        street: String,
        landmark: String,
        pincode: String,
        city: String,
        state: String,
    },
    agreement: {
        isAccepted: {
            type: Boolean,
            default: false,
        },
        acceptedAt: Date,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    onboardingStep: {
        type: Number,
        default: 0,
    },
    isOnboardingCompleted: {
        type: Boolean,
        default: false,
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


userSchema.index({ email: 1, role: 1 }, { unique: true });
module.exports = mongoose.model("User", userSchema);
