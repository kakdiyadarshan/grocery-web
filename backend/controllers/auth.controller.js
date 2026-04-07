const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { emitRoleNotification } = require('../socketManager/socketManager');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createUser = async (req, res) => {
    try {
        let { firstname, lastname, email, password, role, mobileno, businessName } = req.body;

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ status: 400, message: 'Name, email and password are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Email already in use.' });
        }

        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);

        // Optional: Create Stripe Connect Account for Sellers
        let currentStripeAccountId = null;
        if (role === 'seller') {
            try {
                const stripeAccount = await stripe.accounts.create({
                    type: 'standard',
                    email: email,
                    business_profile: {
                        name: businessName || `${firstname} ${lastname}`
                    }
                });
                currentStripeAccountId = stripeAccount.id;
            } catch (stripeErr) {
                console.error("Error creating Stripe Connect Account during registration:", stripeErr);
                // Optionally handle error (you might not want to block registration if Stripe fails)
            }
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashPassword,
            mobileno,
            role: role || "user",
            otp: role === "admin" ? undefined : otp,
            otpExpiresAt: role === "admin" ? undefined : otpExpiresAt,
            isVerified: role === "admin" ? true : false,
            stripeAccountId: currentStripeAccountId
        })
        

        // Send OTP via email only if not verified (not admin)
        if (user.role !== "admin") {
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'GroceryHub Account Verification - OTP',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #333; text-align: center;">Welcome to GroceryHub</h2>
                            <p>Hi ${firstname} ${lastname},</p>
                            <p>Thank you for registering with GroceryHub. Please use the following One-Time Password (OTP) to verify your account:</p>
                            <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
                                ${otp}
                            </div>
                            <p>This OTP is valid for 10 minutes.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                            <br>
                            <p>Best regards,<br>The GroceryHub Team</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;

        return res.status(200).json({
            status: 200,
            message: user.role === "admin" ? 'Admin created successfully.' : 'User registered successfully. Please verify your email with the OTP sent.',
            data: userResponse,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: 400, message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found.' });
        }

        if (user.otp !== Number(otp)) {
            return res.status(400).json({ status: 400, message: 'Invalid OTP.' });
        }

        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ status: 400, message: 'OTP has expired.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        let accessToken = await jwt.sign(
            { _id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            status: 200,
            message: 'Account verified successfully.',
            data: user,
            token: accessToken
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 400, message: 'Email is required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ status: 400, message: 'User is already verified.' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'GroceryHub OTP Verification - New OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">GroceryHub Verification</h2>
                    <p>Hi ${user.firstname} ${user.lastname},</p>
                    <p>Your new One-Time Password (OTP) for otp verification is:</p>
                    <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <br>
                    <p>Best regards,<br>The GroceryHub Team</p>
                </div>
            `
        });

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'New OTP sent successfully.',
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.userLogin = async (req, res) => {
    try {
        let { email, password } = req.body;

        let checkEmailIsExist = await User.findOne({ email });

        if (!checkEmailIsExist) {
            return res.status(404).json({ status: 404, message: "Email Not found" });
        }

        if (!checkEmailIsExist.isVerified) {
            return res.status(400).json({ status: false, message: "Please verify your email first" });
        }

        let comparePassword = await bcrypt.compare(password, checkEmailIsExist.password);

        if (!comparePassword) {
            return res.status(404).json({ status: 404, message: "Password Not Match" });
        }

        if (checkEmailIsExist.role === 'seller') {
            if (checkEmailIsExist.status === 'pending') {
                return res.status(403).json({ status: 403, message: "Your seller account is currently pending approval. Please wait for admin confirmation." });
            }
            if (checkEmailIsExist.status === 'rejected') {
                return res.status(403).json({ status: 403, message: "Your seller account application was rejected. Please contact support." });
            }
        }

        // Access Token
        let accessToken = await jwt.sign(
            { _id: checkEmailIsExist._id },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

        // let refreshToken;
        // if (rememberMe) {
        //     refreshToken = jwt.sign(
        //         { _id: checkEmailIsExist._id },
        //         process.env.REFRESH_SECRET_KEY,
        //         { expiresIn: '7d' }
        //     );

        //     checkEmailIsExist.refreshToken = refreshToken;
        //     await checkEmailIsExist.save();
        // }

        return res.status(200)
            // .cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 24 * 60 * 60 * 1000 })
            // .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 7 * 24 * 60 * 60 * 1000 })
            .json({
                status: 200,
                message: "Login Successfully...",
                data: checkEmailIsExist,
                token: accessToken
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

// exports.refreshAccessToken = async (req, res) => {
//     try {
//         const { refreshToken } = req.cookies;

//         if (!refreshToken) return res.status(404).json({ message: 'No Refresh Token' });

//         const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
//         const existingUser = await User.findById(decoded._id);

//         if (!existingUser) return res.status(404).json({ message: 'User not found' });

//         const accessToken = await jwt.sign(
//             { _id: existingUser._id },
//             process.env.SECRET_KEY,
//             { expiresIn: '1d' }
//         );

//         const refreshToken1 = await jwt.sign(
//             { _id: existingUser._id },
//             process.env.REFRESH_SECRET_KEY,
//             { expiresIn: '7d' }
//         );

//         existingUser.refreshToken = refreshToken1;
//         await existingUser.save({ validateBeforeSave: false });

//         return res.status(200)
//             .cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 24 * 60 * 60 * 1000 })
//             .cookie("refreshToken", refreshToken1, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 7 * 24 * 60 * 60 * 1000 })
//             .json({
//                 status: 200,
//                 message: "Token refreshed successfully",
//                 data: existingUser,
//                 token: accessToken
//             });
//     } catch (err) {
//         return res.status(403).json({ message: 'Refresh Failed', error: err.message });
//     }
// };

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 400, message: "Email is required" });
        }

        const checkUser = await User.findOne({ email });

        if (!checkUser) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
        }

        let otp = Math.floor(100000 + Math.random() * 900000);
        checkUser.otp = otp;
        checkUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await checkUser.save();

        await sendEmail({
            email: checkUser.email,
            subject: "GroceryHub - Forgot Password OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">GroceryHub Password Reset</h2>
                    <p>Hi ${checkUser.firstname} ${checkUser.lastname},</p>
                    <p>You requested a password reset. Your One-Time Password (OTP) is:</p>
                    <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>The GroceryHub Team</p>
                </div>
            `
        });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "OTP sent via email successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.forgotVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: 400, message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found.' });
        }

        if (user.otp !== Number(otp)) {
            return res.status(400).json({ status: 400, message: 'Invalid OTP.' });
        }

        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ status: 400, message: 'OTP has expired.' });
        }


        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'OTP verified successfully.',
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Email is required",
            });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Password fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Passwords do not match",
            });
        }

        const getUser = await User.findOne({ email });

        if (!getUser) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User Not Found",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        getUser.password = hashedPassword;
        await getUser.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Password Reset Successfully..!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

exports.logout = async (req, res) => {
    try {

        return res.status(200).json({ status: 200, message: "Logout successfully..!" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};


