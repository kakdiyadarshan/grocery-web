const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const { createUser, verifyOtp, resendOtp, userLogin, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');
const { getAllUsers, getUserById, updateUser, changePassword } = require('../controllers/user.controller');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { auth, authorizeRoles } = require('../middleware/auth.middleware');
const { uploadPrivacyImage, saveAllPrivacyPolicies, getAllPrivacyPolicies, getPrivacyPolicyById } = require('../controllers/privacy.controller');

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

// Category routes
indexRoutes.post('/createCategory', upload.single('categoryImage'), createCategory);
indexRoutes.get('/getAllCategories', getAllCategories);
indexRoutes.get('/getCategoryById/:id', getCategoryById);
indexRoutes.put('/updateCategory/:id', upload.single('categoryImage'), updateCategory);
indexRoutes.delete('/deleteCategory/:id', deleteCategory);

// Privacy routes
indexRoutes.post('/privacy/upload-image', auth, authorizeRoles('admin'), upload.single('image'), uploadPrivacyImage);
indexRoutes.post('/saveallprivacy', auth, authorizeRoles('admin'), saveAllPrivacyPolicies);
indexRoutes.get('/getallprivacy', getAllPrivacyPolicies);
indexRoutes.get('/getprivacy/:id', getPrivacyPolicyById);


module.exports = indexRoutes;
