const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const { createUser, verifyOtp, resendOtp, userLogin, refreshAccessToken, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { auth, authorizeRoles } = require('../middleware/auth.middleware');

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

// Category routes
indexRoutes.post('/createCategory', upload.single('categoryImage'), createCategory);
indexRoutes.get('/getAllCategories', getAllCategories);
indexRoutes.get('/getCategoryById/:id', getCategoryById);
indexRoutes.put('/updateCategory/:id', upload.single('categoryImage'), updateCategory);
indexRoutes.delete('/deleteCategory/:id', deleteCategory);

module.exports = indexRoutes;
