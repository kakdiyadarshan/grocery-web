const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { deleteFromS3, uploadToS3 } = require('../utils/s3Service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { emitRoleNotification, emitUserNotification } = require('../socketManager/socketManager');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" });

        return res.status(200).json({
            status: 200,
            message: "All users fetched successfully..!",
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "User fetched successfully..!",
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        let updateData = { ...req.body };
        // Prevent photo from being overwritten by req.body. 
        // Photo should ONLY be updated via req.file below.
        if (updateData.photo) delete updateData.photo;

        if (req.file) {
            // Delete old photo from S3 if it exists
            if (existingUser.photo && existingUser.photo.public_id) {
                await deleteFromS3(existingUser.photo.public_id);
            }

            // Upload new photo to S3
            const uploadedResult = await uploadToS3(req.file, "profiles");
            updateData.photo = {
                url: uploadedResult.url,
                public_id: uploadedResult.public_id
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            status: 200,
            message: "User updated successfully..!",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let userId = req.user._id;

        let { oldPassword, newPassword, confirmPassword } = req.body;

        let getUser = await User.findById(userId);

        if (!getUser) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
        }

        let correctPassword = await bcrypt.compare(oldPassword, getUser.password);

        if (!correctPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Old Password Not Match",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "New Password And ConfirmPassword Not Match",
            });
        }

        let salt = await bcrypt.genSalt(10);
        let hasPssword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password: hasPssword }, { new: true });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Password Change SuccessFully..!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

// 1. Verify GST
exports.verifyGst = async (req, res) => {
    try {
        const { userId, gstin, businessName, panNumber, businessType, businessAddress } = req.body;

        if (!userId || !gstin) {
            return res.status(400).json({
                message: "userId and gstin are required"
            });
        }

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your account (OTP) before GST verification"
            });
        }

        let gstDetailsData = {};

        // If manual details are provided, use them
        if (businessName) {
            gstDetailsData = {
                gstin: gstin,
                businessName: businessName,
                panNumber: panNumber,
                businessType: businessType ? [businessType] : [],
                address: { fullAddress: businessAddress },
                isGSTVerified: true,
                gstVerifiedAt: new Date()
            };
        }
        // else {
        //     // Otherwise, fetch from External API
        //     const response = await axios.get(
        //         `https://powerful-gstin-tool.p.rapidapi.com/v1/gstin/${gstin}/details`,
        //         {
        //             headers: {
        //                 "x-rapidapi-key": "19085c3b50msh1d04dabec337ac4p116842jsn267ad9ee3c00",
        //                 "x-rapidapi-host": "powerful-gstin-tool.p.rapidapi.com"
        //             }
        //         }
        //     );

        //     const gstData = response.data.data;

        //     if (!gstData || gstData.error) {
        //         return res.status(400).json({
        //             message: "Invalid GSTIN or GST data not found"
        //         });
        //     }

        //     gstDetailsData = {
        //         gstin: gstin,
        //         businessName: gstData.legal_name || "",
        //         panNumber: gstData.gstin?.slice(2, 12),
        //         businessType: gstData.business_activity_nature || [],
        //         address: gstData.place_of_business_principal?.address || {},
        //         isGSTVerified: true,
        //         gstVerifiedAt: new Date()
        //     };
        // }

        user.gstDetails = gstDetailsData;
        user.onboardingStep = 2; // Move to next step
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "GST Verified Successfully..!",
            gstDetails: user.gstDetails,
            onboardingStep: user.onboardingStep
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "GST verification failed",
            error: error.message
        });
    }
};

// 2. Send OTP
exports.sendOnboardingOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otpVerification = {
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            isOtpVerified: false
        };

        user.markModified('otpVerification');
        await user.save();

        console.log(`Onboarding OTP for seller ${userId}: ${otp}`);

        res.status(200).json({
            message: "OTP sent successfully..!"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Verify OTP
exports.verifyOnboardingOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                message: "userId and otp are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your account (Login OTP) first."
            });
        }

        if (!user.otpVerification?.otp) {
            return res.status(400).json({
                message: "OTP not generated"
            });
        }

        if (new Date(user.otpVerification.expiresAt) < Date.now()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        if (user.otpVerification.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        user.otpVerification.isOtpVerified = true;
        user.otpVerification.otp = null;
        user.otpVerification.expiresAt = null;

        // Update User Step
        user.onboardingStep = 3;

        user.markModified('otpVerification');
        await user.save();

        res.status(200).json({
            status: 200,
            message: "OTP verified successfully..!",
            onboardingStep: user.onboardingStep
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Update Brand Details
exports.updateBrandDetails = async (req, res) => {
    try {
        const { userId, storeName, ownerName, storeDescription } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "userId is required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.brandDetails = {
            storeName,
            ownerName,
            storeDescription
        };

        // Update User Step
        user.onboardingStep = 4;
        await user.save();

        res.status(200).json({
            status: 200,
            message: "Brand details updated successfully..!",
            onboardingStep: user.onboardingStep
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Update Bank Details
exports.updateBankDetails = async (req, res) => {
    try {
        const { userId, accountHolderName, accountNumber, ifscCode } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.onboardingStep < 4) {
            // Flexible check: must be at least at banking details stage
            // user.onboardingStep might be 4 now
        }

        user.bankDetails = {
            accountHolderName,
            accountNumber,
            ifscCode
        };

        // Update User Step
        user.onboardingStep = 5;
        await user.save();

        res.status(200).json({
            status: 200,
            message: "Bank details updated successfully..!",
            onboardingStep: user.onboardingStep
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Update Pickup Address
exports.updatePickupAddress = async (req, res) => {
    try {
        const {
            userId,
            flatHouse,
            street,
            landmark,
            pincode,
            city,
            state
        } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.pickupAddress = {
            flatHouse,
            street,
            landmark,
            pincode,
            city,
            state
        };

        // Update User Step
        user.onboardingStep = 6; // Next: Agreement
        await user.save();

        res.status(200).json({
            status: 200,
            message: "Pickup address updated successfully..!",
            onboardingStep: user.onboardingStep
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Final Submit & Agreement
exports.submitOnboarding = async (req, res) => {
    try {
        const { userId, isAccepted } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!isAccepted) {
            return res.status(400).json({
                message: "You must accept the agreement"
            });
        }

        user.agreement = {
            isAccepted: true,
            acceptedAt: new Date()
        };

        user.status = "pending";
        user.isOnboardingCompleted = true;
        user.onboardingStep = 7; // Completed
        user.role = "seller"; // Change role to seller

        await user.save();

        // Send notification to admin about new seller registration
        try {
            const admins = await User.find({ role: "admin" });
            const nameParts = [user.firstName, user.lastName].filter(Boolean);
            const sellerName = nameParts.length > 0 ? nameParts.join(' ') : user.email;

            for (const admin of admins) {
                await emitUserNotification({
                    userId: admin._id,
                    event: 'notify',
                    data: {
                        type: 'new_seller_registration',
                        message: `New seller registered: ${sellerName}`,
                        sellerName: sellerName,
                        sellerId: user._id,
                        timestamp: new Date()
                    }
                });
            }
        } catch (notificationError) {
            console.error("Failed to send seller registration notification:", notificationError);
        }

        res.status(200).json({
            status: 200,
            message: "Seller onboarding completed. Waiting for admin approval",
            onboardingStep: user.onboardingStep
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approved or Rejected Seller By Admin
exports.approveOrRejectSeller = async (req, res) => {
    try {
        const { userId, status, rejectionReason } = req.body;

        // 1. Validate input
        if (!userId || !status) {
            return res.status(400).json({
                message: "userId and status are required"
            });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        // 2. Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3. Update status
        user.status = status;

        if (status === "rejected") {
            user.rejectionReason = rejectionReason || "Does not meet criteria";
        } else if (status === "approved") {
            user.rejectionReason = ""; // Clear reason if approved
        }

        await user.save();

        if (status === "approved") {
            await emitUserNotification({
                userId: user._id,
                event: 'notify',
                data: {
                    type: 'seller_account_approved',
                    message: `Congratulations! Your seller account request has been APPROVED.`
                }
            });
        }

        // 4. Send Response immediately
        res.status(200).json({
            status: 200,
            message: `Seller ${status} successfully..!`,
            user
        });

        // 5. Send Email in Background
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const nameParts = [user.firstName, user.lastName].filter(Boolean);
        const sellerName = nameParts.length > 0 ? nameParts.join(' ') : "Seller";

        const subject = status === "approved" ? "🎉 GroceryWeb Seller Account Approved" : "⚠️ GroceryWeb Seller Account Update";

        let htmlContent = "";
        if (status === "approved") {
            htmlContent = `
                <h3>Hello ${sellerName},</h3>
                <p>Congratulations! Your seller account request has been <b>APPROVED</b>.</p>
                <p>You can now log in to your dashboard and start listing your products.</p>
                <br/>
                <p>Welcome to Groceryweb!</p>
            `;
        } else {
            htmlContent = `
                <h3>Hello ${sellerName},</h3>
                <p>We regret to inform you that your seller account request has been <b>REJECTED</b>.</p>
                <p><b>Reason:</b> ${"Criteria not met"}</p>
                <br/>
                <p>Please contact support for more details.</p>
            `;
        }

        transporter.sendMail({
            to: user.email,
            subject: subject,
            html: htmlContent
        }).catch(err => {
            console.error(`Failed to send ${status} email to ${user.email}:`, err);
        });

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message
            });
        }
    }
};

exports.getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 }).select("-password");
        res.status(200).json({
            status: 200,
            message: "Sellers fetched successfully..!!",
            data: sellers
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.createStripeOnboardingLink = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || !user.stripeAccountId) {
            return res.status(404).json({ success: false, message: "Stripe account not found for this seller." });
        }

        const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            refresh_url: `${process.env.CLIENT_URL}/seller/stripe-onboarding`,
            return_url: `${process.env.CLIENT_URL}/seller/dashboard`,
            type: 'account_onboarding',
        });

        res.status(200).json({ success: true, url: accountLink.url });
    } catch (error) {
        console.error("Stripe Onboarding error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGlobalCommission = async (req, res) => {
    try {
        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }
        const commission = admin.adminSettings?.globalCommission || 10;
        res.status(200).json({ success: true, data: commission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGlobalCommission = async (req, res) => {
    try {
        const { value } = req.body;
        if (value === undefined) {
            return res.status(400).json({ success: false, message: "Commission value is required." });
        }

        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        admin.adminSettings = {
            ...admin.adminSettings,
            globalCommission: Number(value)
        };
        await admin.save();

        // Notify all sellers dynamically
        const sellers = await User.find({ role: 'seller' });
        const emailPromises = sellers.map(async (seller) => {
            if (seller.email) {
                try {
                    const emailTemplate = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Commission Update Notification</h2>
                        <p>Dear ${seller.firstname || 'Seller'},</p>
                        <p>We want to inform you that our platform's administrative commission has been updated.</p>
                        <p><strong>New Commission Rate: ${value}%</strong></p>
                        <p>This rate will be applied to all future orders.</p>
                        <br/>
                        <p>Thank you,</p>
                        <p><strong>Grocery Web Admin Team</strong></p>
                    </div>
                    `;
                    
                    const transporter = nodemailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    });
                    
                    await transporter.sendMail({
                        from: `Groceryweb <${process.env.EMAIL_USER}>`,
                        to: seller.email,
                        subject: 'Important: Admin Commission Rate Update',
                        html: emailTemplate
                    });
                } catch (emailErr) {
                    console.error(`Failed to send commission update email to ${seller.email}:`, emailErr);
                }
            }
        });

        await Promise.allSettled(emailPromises);

        res.status(200).json({ success: true, data: admin.adminSettings, message: "Commission updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


