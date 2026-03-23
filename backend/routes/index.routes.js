const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const { createUser, verifyOtp, resendOtp, userLogin, refreshAccessToken, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');

// Auth routes
indexRoutes.post('/register', createUser);
indexRoutes.post('/verify-otp', verifyOtp);
indexRoutes.post('/resend-otp', resendOtp);
indexRoutes.post('/userlogin', userLogin);
indexRoutes.get('/refresh-token', refreshAccessToken);
indexRoutes.post('/forgot-password', forgotPassword);
indexRoutes.post('/forgotverifyotp', forgotVerifyOtp);
indexRoutes.post('/reset-password', resetPassword);
indexRoutes.get('/logout', logout);

module.exports = indexRoutes;
