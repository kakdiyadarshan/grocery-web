const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Product = require('../models/product.model');
const { uploadToS3, deleteManyFromS3 } = require('../utils/s3Service');
const { emitRoleNotification, emitUserNotification } = require('../socketManager/socketManager');

// Create Review
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;

        if (!productId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Required fields are missing: productId, rating, and comment" });
        }

        // Check if product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Handle Image Uploads (if any)
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToS3(file, "reviews");
                images.push({
                    url: result.url,
                    public_id: result.public_id
                });
            }
        }

        const review = await Review.create({
            productId,
            userId,
            rating: Number(rating),
            comment,
            images
        });

        // Add review ID to the product data
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: review._id }
        });

        // Notify admins about new review
        await emitRoleNotification({
            designations: ['admin'],
            event: 'notify',
            data: {
                type: 'new_review',
                message: `New Review for ${productExists.name}: ${rating} Stars`,
                payload: { reviewId: review._id, productId }
            }
        });

        // Notify seller about new review
        if (productExists.sellerId) {
            await emitUserNotification({
                userId: productExists.sellerId,
                event: 'notify',
                data: {
                    type: 'new_review',
                    message: `New Review for your product ${productExists.name}: ${rating} Stars`,
                    payload: { reviewId: review._id, productId }
                }
            });
        }

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        });
    } catch (error) {
        console.error("Create Review Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Review
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId"
                }
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "productId.sellerId",
                    foreignField: "_id",
                    as: "sellerId"
                }
            },
            { $unwind: { path: "$sellerId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    images: 1,
                    createdAt: 1,
                    "userId._id": 1,
                    "userId.firstname": 1,
                    "userId.lastname": 1,
                    "userId.email": 1,
                    "userId.photo": 1,
                    "productId._id": 1,
                    "productId.name": 1,
                    "productId.images": 1,
                    "productId.sellerId": 1,
                    "sellerId._id": 1,
                    "sellerId.firstname": 1,
                    "sellerId.lastname": 1,
                    "sellerId.email": 1,
                    "sellerId.brandDetails": 1,
                }
            }
        ]);

        if (!review || review.length === 0) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.status(200).json({ success: true, review: review[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Reviews (Can filter by productId)
exports.getAllReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        let matchQuery = {};
        if (productId) {
            matchQuery.productId = new mongoose.Types.ObjectId(productId);
        }

        const reviews = await Review.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId"
                }
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "productId.sellerId",
                    foreignField: "_id",
                    as: "sellerId"
                }
            },
            { $unwind: { path: "$sellerId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    images: 1,
                    createdAt: 1,
                    "userId._id": 1,
                    "userId.firstname": 1,
                    "userId.lastname": 1,
                    "userId.email": 1,
                    "userId.photo": 1,
                    "productId._id": 1,
                    "productId.name": 1,
                    "productId.images": 1,
                    "productId.sellerId": 1,
                    "sellerId._id": 1,
                    "sellerId.firstname": 1,
                    "sellerId.lastname": 1,
                    "sellerId.email": 1,
                    "sellerId.brandDetails": 1,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error("Get All Reviews Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Reviews for Seller's Products
exports.getSellerReviews = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const reviews = await Review.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId"
                }
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
            {
                $match: { "productId.sellerId": new mongoose.Types.ObjectId(sellerId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "productId.sellerId",
                    foreignField: "_id",
                    as: "sellerId"
                }
            },
            { $unwind: { path: "$sellerId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    images: 1,
                    createdAt: 1,
                    "userId._id": 1,
                    "userId.firstname": 1,
                    "userId.lastname": 1,
                    "userId.email": 1,
                    "userId.photo": 1,
                    "productId._id": 1,
                    "productId.name": 1,
                    "productId.images": 1,
                    "productId.sellerId": 1,
                    "sellerId._id": 1,
                    "sellerId.firstname": 1,
                    "sellerId.lastname": 1,
                    "sellerId.email": 1,
                    "sellerId.brandDetails": 1,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Only allow the reviewer or admin to delete (with safety check for undefined userId)
        const reviewerId = review.userId || review.user; // Support both current and old field names
        if (reviewerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this review" });
        }

        // Delete images from S3
        if (review.images && review.images.length > 0) {
            const publicIds = review.images.map(img => img.public_id).filter(id => id);
            if (publicIds.length > 0) {
                await deleteManyFromS3(publicIds);
            }
        }

        // Remove review reference from the product data (with safety check for productId)
        const targetProductId = review.productId || review.product;
        if (targetProductId) {
            await Product.findByIdAndUpdate(targetProductId, {
                $pull: { reviews: review._id }
            });
        }

        await review.deleteOne();
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete Review Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
