const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const { createUser, verifyOtp, resendOtp, userLogin, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');
const { getAllUsers, getUserById, updateUser, changePassword } = require('../controllers/user.controller');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { getCart, addToCart, updateCartQuantity, removeFromCart } = require('../controllers/cart.controller');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/product.controller');
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

// Category routes
indexRoutes.post('/createCategory', auth, authorizeRoles('admin'), upload.single('categoryImage'), createCategory);
indexRoutes.get('/getAllCategories', getAllCategories);
indexRoutes.get('/getCategoryById/:id', getCategoryById);
indexRoutes.put('/updateCategory/:id', auth, authorizeRoles('admin'), upload.single('categoryImage'), updateCategory);
indexRoutes.delete('/deleteCategory/:id', auth, authorizeRoles('admin'), deleteCategory);

// Product routes
indexRoutes.post('/createProduct', auth, authorizeRoles('admin'), upload.array('images', 10), createProduct);
indexRoutes.get('/getAllProducts', getAllProducts);
indexRoutes.get('/getProductById/:id', getProductById);
indexRoutes.put('/updateProduct/:id', auth, authorizeRoles('admin'), upload.array('images', 10), updateProduct);
indexRoutes.delete('/deleteProduct/:id', auth, authorizeRoles('admin'), deleteProduct);

// Cart routes
indexRoutes.get('/cart', auth, getCart);
indexRoutes.post('/cart/add', auth, addToCart);
indexRoutes.put('/cart/update', auth, updateCartQuantity);
indexRoutes.delete('/cart/remove/:productId', auth, removeFromCart);

// Wishlist routes
indexRoutes.get('/wishlist', auth, getWishlist);
indexRoutes.post('/wishlist/add', auth, addToWishlist);
indexRoutes.delete('/wishlist/remove/:productId', auth, removeFromWishlist);

module.exports = indexRoutes;
