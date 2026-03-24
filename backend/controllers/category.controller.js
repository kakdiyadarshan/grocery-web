const Category = require("../models/category.model");
const { uploadToS3, updateS3, deleteFromS3 } = require("../utils/s3Service");

// Create Category
exports.createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body || {};

        if (!categoryName) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        let categoryImage = { url: "", public_id: "" };
        console.log("reeeee req.file", req.file);
        console.log("reeeee req.files", req.files);
        console.log("reeeee req.body", req.body);

        const uploadedFile = req.file ||
            (req.files && req.files.categoryImage && req.files.categoryImage[0]) ||
            (req.files && req.files.file && req.files.file[0]);

        if (uploadedFile) {
            try {
                const uploadResult = await uploadToS3(uploadedFile, "categories");
                console.log("uploadResult", uploadResult);
                if (uploadResult) {
                    categoryImage.url = uploadResult.url;
                    categoryImage.public_id = uploadResult.public_id;
                }
            } catch (err) {
                console.error("S3 Upload Failed:", err.message);
                return res.status(500).json({ success: false, message: "Failed to upload image to S3: " + err.message });
            }
        } else if (req.body.categoryImage) {
            let parsedImage = req.body.categoryImage;
            if (typeof parsedImage === 'string') {
                try { parsedImage = JSON.parse(parsedImage); } catch (e) { }
            }
            if (parsedImage.url) {
                categoryImage.url = parsedImage.url;
                categoryImage.public_id = parsedImage.public_id || "";
            } else {
                return res.status(400).json({ success: false, message: "Category image url is required" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Category image is required" });
        }

        const category = await Category.create({
            categoryName,
            description,
            categoryImage
        });

        res.status(201).json({ success: true, message: "Category created successfully", category });
    } catch (error) {
        console.error("Create Category Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Category By ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;

        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        let categoryImage = category.categoryImage;
        console.log("Current Category Image:", categoryImage);

        if (req.file) {
            try {
                const oldKey = category.categoryImage?.public_id || null;
                const uploadResult = await updateS3(oldKey, req.file, "categories");
                if (uploadResult) {
                    categoryImage.url = uploadResult.url;
                    categoryImage.public_id = uploadResult.public_id;
                }
            } catch (err) {
                console.error("S3 Update Failed:", err.message);
                return res.status(500).json({ success: false, message: "Failed to update image on S3: " + err.message });
            }
        } else if (req.body.categoryImage) {
            let parsedImage = req.body.categoryImage;
            if (typeof parsedImage === 'string') {
                try { parsedImage = JSON.parse(parsedImage); } catch (e) { }
            }
            if (parsedImage.url) {
                categoryImage.url = parsedImage.url;
                categoryImage.public_id = parsedImage.public_id || "";
            }
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            { categoryName, description, categoryImage },
            { new: true, runValidators: true }
        );

        console.log("Updated Category:", category);

        res.status(200).json({ success: true, message: "Category updated successfully", category });
    } catch (error) {
        console.error("Update Category Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const oldKey = category.categoryImage?.public_id;
        if (oldKey) {
            try {
                await deleteFromS3(oldKey);
            } catch (err) {
                console.warn("S3 Delete failed but proceeding with DB deletion:", err.message);
            }
        }

        await category.deleteOne();

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Delete Category Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
