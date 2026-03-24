const Product = require("../models/product.model");
const { uploadToS3, updateS3, deleteFromS3, deleteManyFromS3 } = require("../utils/s3Service");

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, weighstWise } = req.body;

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

        const product = await Product.create({
            name,
            category,
            description,
            weighstWise: parsedWeights,
            images
        });

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

// Get All Products (with populated category)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category", "categoryName");
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "categoryName");
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { name, category, description, weighstWise, oldImages } = req.body;
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let currentImages = product.images;

            if (req.files && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const result = await uploadToS3(file, "products");
                newImages.push({
                    url: result.url,
                    public_id: result.public_id
                });
            }
            currentImages = [...currentImages, ...newImages];
        }

        if (oldImages) {
            let imagesToKeep = [];
            try {
                imagesToKeep = JSON.parse(oldImages);
                const imagesToDelete = product.images.filter(img => !imagesToKeep.includes(img.public_id));

                if (imagesToDelete.length > 0) {
                    await deleteManyFromS3(imagesToDelete.map(img => img.public_id));
                }

                currentImages = product.images.filter(img => imagesToKeep.includes(img.public_id));
            } catch (e) {
                console.error("Error parsing oldImages:", e);
            }
        }
        product.name = name || product.name;
        product.category = category || product.category;
        product.description = description || product.description;
        if (weighstWise) {
            try {
                product.weighstWise = typeof weighstWise === 'string' ? JSON.parse(weighstWise) : weighstWise;
            } catch (e) { }
        }
        product.images = currentImages;

        await product.save();

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
