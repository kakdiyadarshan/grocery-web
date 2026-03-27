const { default: mongoose } = require("mongoose");
const Product = require("../models/product.model");
const { uploadToS3, updateS3, deleteFromS3, deleteManyFromS3 } = require("../utils/s3Service");

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, weighstWise, tags, sku } = req.body;

        // Check for images
        const uploadedFiles = req.files || [];
        if (!uploadedFiles || uploadedFiles.length < 4) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least 4 images for the product"
            });
        }

        // Upload images to S3
        const images = [];
        for (const file of uploadedFiles) {
            const result = await uploadToS3(file, "products");
            images.push({
                url: result.url,
                public_id: result.public_id
            });
        }

        // Parse weighstWise if string
        let parsedWeights = weighstWise;
        if (typeof weighstWise === 'string') {
            try {
                parsedWeights = JSON.parse(weighstWise);
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid weights data format" });
            }
        }

        // Robust tags parsing
        let parsedTags = [];
        if (tags) {
            if (Array.isArray(tags)) {
                parsedTags = tags;
            } else if (typeof tags === 'string') {
                try {
                    parsedTags = tags === '[]' ? [] : (tags.startsWith('[') ? JSON.parse(tags) : [tags]);
                } catch (e) {
                    parsedTags = [tags];
                }
            }
        }

        const product = await Product.create({
            name,
            category,
            description,
            weighstWise: parsedWeights,
            tags: parsedTags,
            sku: sku || "",
            images
        });

        await product.populate([
            { path: "category", select: "categoryName" },
            {
                path: "reviews",
                populate: { path: "userId", select: "name photo" }
            }
        ]);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Create Product Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const today = new Date();

        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'offers',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$$productId', '$product_id'] },
                                        { $lte: ['$offer_start_date', today] },
                                        { $gte: ['$offer_end_date', today] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'offer'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' }
                }
            }
        ]);

        res.status(200).json({ success: true, products });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const today = new Date();

        const product = await Product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'offers',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$$productId', '$product_id'] },
                                        { $lte: ['$offer_start_date', today] },
                                        { $gte: ['$offer_end_date', today] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'offer'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' }
                }
            }
        ]);

        if (!product || product.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product: product[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { name, category, description, weighstWise, oldImages, tags, sku } = req.body;
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let productsImages = [...product.images];
        let newImages = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToS3(file, "products");
                newImages.push({
                    url: result.url,
                    public_id: result.public_id
                });
            }
        }

        if (oldImages) {
            try {
                const imagesToKeep = JSON.parse(oldImages);
                const imagesToDelete = product.images.filter(img => !imagesToKeep.includes(img.public_id));

                if (imagesToDelete.length > 0) {
                    await deleteManyFromS3(imagesToDelete.map(img => img.public_id));
                }

                const keptImages = product.images.filter(img => imagesToKeep.includes(img.public_id));
                productsImages = [...keptImages, ...newImages];
            } catch (e) {
                console.error("Error parsing oldImages:", e);
                productsImages = [...productsImages, ...newImages];
            }
        } else {
            productsImages = [...productsImages, ...newImages];
        }

        product.name = name || product.name;
        product.category = category || product.category;
        product.description = description || product.description;
        product.sku = sku || product.sku;
        if (weighstWise) {
            try {
                product.weighstWise = typeof weighstWise === 'string' ? JSON.parse(weighstWise) : weighstWise;
            } catch (e) { }
        }
        product.images = productsImages;

        // Enhanced tag update logic
        if (tags !== undefined) {
            if (Array.isArray(tags)) {
                product.tags = tags;
            } else if (typeof tags === 'string') {
                try {
                    product.tags = tags === '[]' ? [] : (tags.startsWith('[') ? JSON.parse(tags) : [tags]);
                } catch (e) {
                    product.tags = tags ? [tags] : [];
                }
            }
        }

        await product.save();

        await product.populate([
            { path: "category", select: "categoryName" },
            {
                path: "reviews",
                populate: { path: "userId", select: "name photo" }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update Product Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Featured Products (only products with 'featured' tag)
exports.getFeaturedProducts = async (req, res) => {
    try {
        const today = new Date();

        const products = await Product.aggregate([
            {
                $match: { tags: { $in: ['featured'] } }
            },
            {
                $lookup: {
                    from: 'offers',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$$productId', '$product_id'] },
                                        { $lte: ['$offer_start_date', today] },
                                        { $gte: ['$offer_end_date', today] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'offer'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' }
                }
            }
        ]);

        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Delete all images from S3
        if (product.images && product.images.length > 0) {
            const publicIds = product.images.map(img => img.public_id).filter(id => id);
            if (publicIds.length > 0) {
                await deleteManyFromS3(publicIds);
            }
        }

        await product.deleteOne();
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
