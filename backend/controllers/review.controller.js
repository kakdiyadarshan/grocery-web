const Review = require('../models/review.model');
const Product = require('../models/product.model');
const { uploadToS3, deleteManyFromS3 } = require('../utils/s3Service');

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
        const review = await Review.findById(req.params.id)
            .populate("userId", "firstname lastname photo email")
            .populate("productId", "name images");

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Reviews (Can filter by productId)
exports.getAllReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        const query = productId ? { product: productId } : {};

        const reviews = await Review.find(query)
            .populate("userId", "firstname lastname photo email")
            .populate("productId", "name images")
            .sort({ createdAt: -1 });

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
