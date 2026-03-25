const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const s3Service = require('../utils/s3Service');
const { createUser, verifyOtp, resendOtp, userLogin, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');
const { getAllUsers, getUserById, updateUser, changePassword } = require('../controllers/user.controller');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { getCart, addToCart, updateCartQuantity, removeFromCart } = require('../controllers/cart.controller');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { auth, authorizeRoles } = require('../middleware/auth.middleware');
const { uploadPrivacyImage, saveAllPrivacyPolicies, getAllPrivacyPolicies, getPrivacyPolicyById } = require('../controllers/privacy.controller');
const { addNewBlogCategoryController, getAllBlogCategoryController, getBlogCategoryByIdController, updateBlogCategoryController, deleteBlogCategoryController } = require('../controllers/blog.category.controller');
const { getBlogWithCategoryController, getLatestBlogController, addNewBlogController, getAllBlogsController, getBlogByIdController, updateBlogController, deleteBlogController } = require('../controllers/blog.controller');
const { createContact, getAllContacts, deleteContact } = require('../controllers/contact.controller');

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

// Privacy routes
indexRoutes.post('/privacy/upload-image', auth, authorizeRoles('admin'), upload.single('image'), uploadPrivacyImage);
indexRoutes.post('/saveallprivacy', auth, authorizeRoles('admin'), saveAllPrivacyPolicies);
indexRoutes.get('/getallprivacy', getAllPrivacyPolicies);
indexRoutes.get('/getprivacy/:id', getPrivacyPolicyById);

//blog section api's
// blog.category.routes.js
indexRoutes.post("/new/blogCategory", auth, addNewBlogCategoryController);
indexRoutes.get("/all/category", getAllBlogCategoryController);
indexRoutes.get("/categoryById/:categoryId", getBlogCategoryByIdController);
indexRoutes.patch("/update/blogCategory/:categoryId", auth, updateBlogCategoryController);
indexRoutes.delete("/delete/blogCategory/:categoryId", auth, deleteBlogCategoryController);

//find all blog with category Id
indexRoutes.get("/blogs/with-category", getBlogWithCategoryController)
indexRoutes.get("/latest/blog", getLatestBlogController)

//blog.content*.route.js

indexRoutes.post("/new/blog", auth, upload.any(), addNewBlogController);
indexRoutes.get("/all/blogs", getAllBlogsController);
indexRoutes.get("/blog/:blogId", getBlogByIdController);
indexRoutes.patch("/update/blog/:blogId", upload.any(), updateBlogController);
indexRoutes.delete("/delete/blog/:blogId", deleteBlogController);

indexRoutes.get("/listBucket", async (req, res) => {
    try {
        const files = await s3Service.listBucketObjects();
        return res.json({ success: true, Total: files.length, files });
    } catch (err) {
        console.error("Error listing bucket:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Contact routes
indexRoutes.post('/contact', createContact);
indexRoutes.get('/contacts', auth, authorizeRoles('admin'), getAllContacts);
indexRoutes.delete('/contacts/:id', auth, authorizeRoles('admin'), deleteContact);

module.exports = indexRoutes;
