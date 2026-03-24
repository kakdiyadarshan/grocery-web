const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const { createUser, verifyOtp, resendOtp, userLogin, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');
const { getAllUsers, getUserById, updateUser, changePassword } = require('../controllers/user.controller');
const { auth, authorizeRoles } = require('../middleware/auth.middleware');

// Auth routes
indexRoutes.post('/register', createUser);
indexRoutes.post('/verify-otp', verifyOtp);
indexRoutes.post('/resend-otp', resendOtp);
indexRoutes.post('/userlogin', userLogin);
// indexRoutes.get('/refresh-token', refreshAccessToken);
indexRoutes.post('/forgot-password', forgotPassword);
indexRoutes.post('/forgotverifyotp', forgotVerifyOtp);
indexRoutes.post('/reset-password', resetPassword);
indexRoutes.get('/logout', logout);

// User routes
indexRoutes.get('/users', auth, authorizeRoles('admin'), getAllUsers);
indexRoutes.get('/getusersById', auth, getUserById);
indexRoutes.put('/update-profile', auth, upload.single('photo'), updateUser);
indexRoutes.put('/users/:id', auth, upload.single('image'), updateUser);
indexRoutes.put('/change-password', auth, changePassword);

module.exports = indexRoutes;
