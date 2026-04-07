const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/imageUpload');
const s3Service = require('../utils/s3Service');
const { createUser, verifyOtp, resendOtp, userLogin, forgotPassword, forgotVerifyOtp, resetPassword, logout } = require('../controllers/auth.controller');
const { getAllUsers, getUserById, updateUser, changePassword, verifyGst, sendOnboardingOtp, verifyOnboardingOtp, updateBrandDetails, updateBankDetails, updatePickupAddress, submitOnboarding, approveOrRejectSeller, getAllSellers } = require('../controllers/user.controller');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require('../controllers/cart.controller');

const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getFeaturedProducts, importProducts, getBestSellingProducts, approveRejectProduct } = require('../controllers/product.controller');
const { auth, authorizeRoles } = require('../middleware/auth.middleware');
const { uploadPrivacyImage, saveAllPrivacyPolicies, getAllPrivacyPolicies, getPrivacyPolicyById } = require('../controllers/privacy.controller');
const { addNewBlogCategoryController, getAllBlogCategoryController, getBlogCategoryByIdController, updateBlogCategoryController, deleteBlogCategoryController } = require('../controllers/blog.category.controller');
const { getBlogWithCategoryController, getLatestBlogController, addNewBlogController, getAllBlogsController, getBlogByIdController, updateBlogController, deleteBlogController } = require('../controllers/blog.controller');
const { createContact, getAllContacts, deleteContact } = require('../controllers/contact.controller');
const { addSubscriber, getAllSubscribers, deleteSubscriber, sendOfferEmail } = require('../controllers/subscribe.controller');
const { getTermConditionById, getAllTermConditions, saveAllTermConditions, uploadTermImage } = require('../controllers/termscondition.controller');
const { uploadShippingImage, saveAllShippingPolicies, getAllShippingPolicies, getShippingPolicyById } = require('../controllers/shippingpolicy.controller');
const { createOffer, getAllOffers, getOfferById, updateOffer, deleteOffer } = require('../controllers/offerController');
const { createFAQ, getAllFAQs, getFAQById, updateFAQ, deleteFAQ } = require('../controllers/faq.controller');
const { createReview, getReviewById, getAllReviews, deleteReview, getSellerReviews } = require('../controllers/review.controller');

const { createCoupon, getAllCoupons, deleteCoupon, getCouponById, updateCoupon, applyCoupon } = require('../controllers/coupon.controller');
const { createOrder, getAllOrders, getOrderById, getOrdersByIds, updateOrderStatus, deleteOrder, getUserOrders, cancelOrder, trackOrder, handleStripeWebhook, verifyStripeSession, getSellerOrders, getSellerOrderById } = require('../controllers/order.controller');
const { getOrderMonthlyAnalytics, getRevenueAnalytics } = require('../controllers/dashboard.controller');
const { createPayment, getPaymentById, getAllPayments, updatePaymentStatus, deletePayment, getPaymentByUserId, getPaymentByOrderId } = require('../controllers/payment.controller');
const { addAddress, getAddresses, updateAddress, deleteAddress, setDefaultAddress } = require('../controllers/address.controller');
const { createOfferBanner, getAllOfferBanners, updateOfferBanner, deleteOfferBanner } = require('../controllers/offerbanner.controller');
const { createBanner, getAllBanners, updateBanner, deleteBanner } = require('../controllers/banner.controller');
const { getMyNotifications, markSeen, clearAll } = require('../controllers/notification.controller');

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

// Sellet routes
indexRoutes.post('/seller/verify-gst', verifyGst);
indexRoutes.post('/seller/send-otp', sendOnboardingOtp);
indexRoutes.post('/seller/verify-otp', verifyOnboardingOtp);
indexRoutes.put('/seller/brand-details', updateBrandDetails);
indexRoutes.put('/seller/bank-details', updateBankDetails);
indexRoutes.put('/seller/pickup-address', updatePickupAddress);
indexRoutes.post('/seller/submit-agreement', submitOnboarding);
indexRoutes.post('/seller/approve-reject', auth, authorizeRoles('admin'), approveOrRejectSeller);
indexRoutes.get('/seller/all', auth, authorizeRoles('admin'), getAllSellers);

// Category routes
indexRoutes.post('/createCategory', auth, authorizeRoles('admin'), upload.single('categoryImage'), createCategory);
indexRoutes.get('/getAllCategories', getAllCategories);
indexRoutes.get('/getCategoryById/:id', getCategoryById);
indexRoutes.put('/updateCategory/:id', auth, authorizeRoles('admin'), upload.single('categoryImage'), updateCategory);
indexRoutes.delete('/deleteCategory/:id', auth, authorizeRoles('admin'), deleteCategory);

// Product routes
indexRoutes.post('/createProduct', auth, authorizeRoles('admin', 'seller'), upload.array('images', 10), createProduct);
indexRoutes.get('/getAllProducts', auth, getAllProducts);
indexRoutes.get('/getFeaturedProducts',  getFeaturedProducts);
indexRoutes.get('/getBestSellingProducts',getBestSellingProducts);
indexRoutes.get('/getProductById/:id',  getProductById);
indexRoutes.put('/updateProduct/:id', auth, authorizeRoles('admin', 'seller'), upload.array('images', 10), updateProduct);
indexRoutes.delete('/deleteProduct/:id', auth, authorizeRoles('admin', 'seller'), deleteProduct);
indexRoutes.post('/importProducts', auth, authorizeRoles('admin', 'seller'), upload.any(), importProducts);
indexRoutes.post('/product/approve-reject/:id', auth, authorizeRoles('admin'), approveRejectProduct);

// Cart routes
indexRoutes.get('/cart', auth, getCart);
indexRoutes.post('/cart/add', auth, addToCart);
indexRoutes.put('/cart/update', auth, updateCartQuantity);
indexRoutes.delete('/cart/remove/:productId', auth, removeFromCart);
indexRoutes.delete('/cart/clear', auth, clearCart);


// Wishlist routes
indexRoutes.get('/wishlist', auth, getWishlist);
indexRoutes.post('/wishlist/add', auth, addToWishlist);
indexRoutes.delete('/wishlist/remove/:productId', auth, removeFromWishlist);

// Privacy routes
indexRoutes.post('/privacy/upload-image', auth, authorizeRoles('admin'), upload.single('image'), uploadPrivacyImage);
indexRoutes.post('/saveallprivacy', auth, authorizeRoles('admin'), saveAllPrivacyPolicies);
indexRoutes.get('/getallprivacy', getAllPrivacyPolicies);
indexRoutes.get('/getprivacy/:id', getPrivacyPolicyById);

// Terms & Condition Routes
indexRoutes.post('/terms/upload-image', auth, authorizeRoles("admin"), upload.single('image'), uploadTermImage);
indexRoutes.post('/saveallterms', auth, authorizeRoles("admin"), saveAllTermConditions);
indexRoutes.get('/getallterms', getAllTermConditions);
indexRoutes.get('/getterms/:id', getTermConditionById);

// Shipping Policy Routes
indexRoutes.post('/shipping/upload-image', auth, authorizeRoles('admin'), upload.single('image'), uploadShippingImage);
indexRoutes.post('/saveallshipping', auth, authorizeRoles('admin'), saveAllShippingPolicies);
indexRoutes.get('/getallshipping', getAllShippingPolicies);
indexRoutes.get('/getshipping/:id', getShippingPolicyById);

// Offer routes
indexRoutes.post('/addoffer', auth, authorizeRoles('admin', 'seller'), createOffer);
indexRoutes.get('/getoffers', auth, authorizeRoles('admin', 'seller'), getAllOffers);
indexRoutes.get('/getoffer/:id', auth, authorizeRoles('admin', 'seller'), getOfferById);
indexRoutes.put('/updateoffer/:id', auth, authorizeRoles('admin', 'seller'), updateOffer);
indexRoutes.delete('/deleteoffer/:id', auth, authorizeRoles('admin', 'seller'), deleteOffer);

// FAQ routes
indexRoutes.post('/createFaq', auth, authorizeRoles("admin"), createFAQ);
indexRoutes.get('/getAllFaq', getAllFAQs);
indexRoutes.get('/getFaqById/:id', getFAQById);
indexRoutes.put('/updateFaq/:id', auth, authorizeRoles("admin"), updateFAQ);
indexRoutes.delete('/deleteFaq/:id', auth, authorizeRoles("admin"), deleteFAQ);

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

// Subscription routes
indexRoutes.post('/subscribe', addSubscriber);
indexRoutes.get('/all-subscribers', auth, authorizeRoles('admin'), getAllSubscribers);
indexRoutes.delete('/delete-subscriber/:id', auth, authorizeRoles('admin'), deleteSubscriber);
indexRoutes.post('/send-offer-email', auth, authorizeRoles('admin'), sendOfferEmail);

// Review routes (Rate and Review)
indexRoutes.post('/addReview', auth, upload.array('images', 5), createReview);
indexRoutes.get('/getReview/:id', getReviewById);
indexRoutes.get('/getAllReviews', getAllReviews); // Can take productId as query param
indexRoutes.get('/getSellerReviews', auth, authorizeRoles('seller'), getSellerReviews);
indexRoutes.delete('/deleteReview/:id', auth, deleteReview);

// Banner routes
indexRoutes.post('/createbanner', auth, authorizeRoles('admin'), upload.single('image'), createBanner);
indexRoutes.get('/getbanners', getAllBanners);
indexRoutes.put('/updatebanner/:id', auth, authorizeRoles('admin'), upload.single('image'), updateBanner);
indexRoutes.delete('/deletebanner/:id', auth, authorizeRoles('admin'), deleteBanner);

// Offer Banner routes
indexRoutes.post('/createofferbanner', auth, authorizeRoles('admin'), upload.single('image'), createOfferBanner);
indexRoutes.get('/getofferbanners', getAllOfferBanners);
indexRoutes.put('/updateofferbanner/:id', auth, authorizeRoles('admin'), upload.single('image'), updateOfferBanner);
indexRoutes.delete('/deleteofferbanner/:id', auth, authorizeRoles('admin'), deleteOfferBanner);



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

// Coupon Routes
indexRoutes.post('/createCoupon', auth, authorizeRoles('admin'), createCoupon);
indexRoutes.get('/getAllCoupons', auth, authorizeRoles('admin', 'user'), getAllCoupons);
indexRoutes.delete('/deleteCoupon/:id', auth, authorizeRoles('admin'), deleteCoupon);
indexRoutes.get('/getCoupon/:id', auth, authorizeRoles('admin', 'user'), getCouponById);
indexRoutes.put('/updateCoupon/:id', auth, authorizeRoles('admin'), updateCoupon);
indexRoutes.post('/applyCoupon', auth, authorizeRoles('admin', 'user'), applyCoupon);

// Order Routes
indexRoutes.post('/createOrder', auth, createOrder);
indexRoutes.get('/getAllOrders', auth, authorizeRoles('admin'), getAllOrders);
indexRoutes.get('/getOrder/:id', auth, authorizeRoles('admin', 'user'), getOrderById);
indexRoutes.get('/getOrdersByIds', auth, authorizeRoles('admin', 'user'), getOrdersByIds);
indexRoutes.put('/updateOrderStatus/:id', auth, authorizeRoles('admin'), updateOrderStatus);
indexRoutes.delete('/deleteOrder/:id', auth, authorizeRoles('admin'), deleteOrder);
indexRoutes.get('/getUserOrders', auth, getUserOrders);
indexRoutes.get('/getSellerOrders', auth, authorizeRoles('seller'), getSellerOrders);
indexRoutes.get('/getSellerOrderById/:id', auth, authorizeRoles('seller'), getSellerOrderById);
indexRoutes.put('/cancelOrder/:id', auth, cancelOrder);
indexRoutes.get('/trackOrder/:id', auth, trackOrder);
indexRoutes.get('/order-monthly-analytics', auth, authorizeRoles('admin'), getOrderMonthlyAnalytics);
indexRoutes.get('/revenue-analytics', auth, authorizeRoles('admin'), getRevenueAnalytics);

// Payment Routes
indexRoutes.post('/createPayment', auth, createPayment);
indexRoutes.get('/getPayment/:id', auth, authorizeRoles('admin'), getPaymentById);
indexRoutes.get('/getAllPayments', auth, authorizeRoles('admin'), getAllPayments);
indexRoutes.put('/updatePaymentStatus/:id', auth, authorizeRoles('admin'), updatePaymentStatus);
indexRoutes.delete('/deletePayment/:id', auth, authorizeRoles('admin'), deletePayment);
indexRoutes.get('/getPaymentByUserId/:userId', auth, authorizeRoles('admin'), getPaymentByUserId);
indexRoutes.get('/getPaymentByOrderId/:orderId', auth, authorizeRoles('admin'), getPaymentByOrderId);

// Address Management
indexRoutes.post('/address', auth, addAddress);
indexRoutes.get('/addresses', auth, getAddresses);
indexRoutes.put('/address/:addressId', auth, updateAddress);
indexRoutes.delete('/address/:addressId', auth, deleteAddress);
indexRoutes.put('/address-default/:addressId', auth, setDefaultAddress);

// Notifications routes
indexRoutes.get('/notifications', auth, authorizeRoles('admin','seller'), getMyNotifications);
indexRoutes.put('/notifications/:id/seen', auth, authorizeRoles('admin','seller'), markSeen);
indexRoutes.put('/notifications', auth, authorizeRoles('admin','seller'), clearAll);

// Stripe Webhook
indexRoutes.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
indexRoutes.post('/verifyStripeSession', auth, verifyStripeSession);

module.exports = indexRoutes;

