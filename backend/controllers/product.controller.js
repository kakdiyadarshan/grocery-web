const { default: mongoose } = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Order = require("../models/order.model");
const xlsx = require("xlsx");
const { uploadToS3, uploadUrlToS3, updateS3, deleteFromS3, deleteManyFromS3 } = require("../utils/s3Service");

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
        const { page = 1, limit = 10, paginate = 'false', search, category, minPrice, maxPrice, weights, availability } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit) || 0;
        const pageLimit = parseInt(limit);
        const paginateBool = paginate === 'true';

        let matchStage = {};
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        // Multiple categories support (comma separated)
        if (category) {
            const categories = category.split(',');
            if (categories.length > 1) {
                // If multiple, we handle it after lookup/unwind for convenience or here if we want performance
                // For now, let's stick to the existing pipeline structure but allow array match
            }
        }

        let pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
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
            }
        );

        // Add category filter after unwind
        if (category) {
            const categoryArray = category.split(',');
            pipeline.push({ $match: { 'category.categoryName': { $in: categoryArray } } });
        }

        pipeline.push(
            {
                $addFields: {
                    avgRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' },
                    offer: { $arrayElemAt: ['$offer', 0] }
                }
            },
            {
                $addFields: {
                    weighstWise: {
                        $map: {
                            input: '$weighstWise',
                            as: 'w',
                            in: {
                                $mergeObjects: [
                                    '$$w',
                                    {
                                        discountPrice: {
                                            $cond: {
                                                if: { $ifNull: ['$offer', false] },
                                                then: {
                                                    $cond: {
                                                        if: { $eq: ['$offer.offer_type', 'Discount'] },
                                                        then: {
                                                            $subtract: [
                                                                '$$w.price',
                                                                { $divide: [{ $multiply: ['$$w.price', '$offer.offer_value'] }, 100] }
                                                            ]
                                                        },
                                                        else: {
                                                            $max: [0, { $subtract: ['$$w.price', '$offer.offer_value'] }]
                                                        }
                                                    }
                                                },
                                                else: '$$w.price'
                                            }
                                        },
                                        weightLabel: {
                                            $concat: [
                                                { $toString: '$$w.weight' },
                                                { $cond: [{ $ifNull: ['$$w.unit', false] }, { $concat: [' ', '$$w.unit'] }, ''] }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    minPrice: { $min: '$weighstWise.price' },
                    minDiscountPrice: { $min: '$weighstWise.discountPrice' },
                    totalStock: { $sum: '$weighstWise.stock' }
                }
            }
        );

        // Price Range Filter
        if (minPrice || maxPrice) {
            let priceMatch = {};
            if (minPrice) priceMatch.$gte = parseFloat(minPrice);
            if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);
            pipeline.push({ $match: { minPrice: priceMatch } });
        }

        // Weight Filter (e.g., "500 Gram,1 Kilogram")
        if (weights) {
            const weightArray = weights.split(',');
            pipeline.push({ $match: { 'weighstWise.weightLabel': { $in: weightArray } } });
        }

        // Availability Filter
        if (availability) {
            if (availability === 'in-stock') pipeline.push({ $match: { totalStock: { $gt: 0 } } });
            if (availability === 'out-of-stock') pipeline.push({ $match: { totalStock: { $lte: 0 } } });
        }

        // Sorting
        const { sort } = req.query;
        if (sort) {
            switch (sort) {
                case 'alphabetical-az': pipeline.push({ $sort: { name: 1 } }); break;
                case 'alphabetical-za': pipeline.push({ $sort: { name: -1 } }); break;
                case 'price-low-high': pipeline.push({ $sort: { minPrice: 1 } }); break;
                case 'price-high-low': pipeline.push({ $sort: { minPrice: -1 } }); break;
                default: pipeline.push({ $sort: { createdAt: -1 } });
            }
        } else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        if (paginateBool) {
            pipeline.push({
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: pageLimit }]
                }
            });

            const result = await Product.aggregate(pipeline);
            const products = result[0].data;
            const totalProducts = result[0].metadata[0]?.total || 0;

            res.status(200).json({
                success: true,
                products,
                totalProducts,
                totalPages: Math.ceil(totalProducts / pageLimit),
                currentPage: parseInt(page) || 1
            });
        } else {
            const products = await Product.aggregate(pipeline);
            res.status(200).json({ success: true, products });
        }

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
                    reviewCount: { $size: '$reviews' },
                    offer: { $arrayElemAt: ['$offer', 0] }
                }
            },
            {
                $addFields: {
                    weighstWise: {
                        $map: {
                            input: '$weighstWise',
                            as: 'w',
                            in: {
                                $mergeObjects: [
                                    '$$w',
                                    {
                                        discountPrice: {
                                            $cond: {
                                                if: { $ifNull: ['$offer', false] },
                                                then: {
                                                    $cond: {
                                                        if: { $eq: ['$offer.offer_type', 'Discount'] },
                                                        then: {
                                                            $subtract: [
                                                                '$$w.price',
                                                                { $divide: [{ $multiply: ['$$w.price', '$offer.offer_value'] }, 100] }
                                                            ]
                                                        },
                                                        else: {
                                                            $max: [0, { $subtract: ['$$w.price', '$offer.offer_value'] }]
                                                        }
                                                    }
                                                },
                                                else: '$$w.price'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    discountPrice: { $min: '$weighstWise.discountPrice' }
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
                    reviewCount: { $size: '$reviews' },
                    offer: { $arrayElemAt: ['$offer', 0] }
                }
            },
            {
                $addFields: {
                    weighstWise: {
                        $map: {
                            input: '$weighstWise',
                            as: 'w',
                            in: {
                                $mergeObjects: [
                                    '$$w',
                                    {
                                        discountPrice: {
                                            $cond: {
                                                if: { $ifNull: ['$offer', false] },
                                                then: {
                                                    $cond: {
                                                        if: { $eq: ['$offer.offer_type', 'Discount'] },
                                                        then: {
                                                            $subtract: [
                                                                '$$w.price',
                                                                { $divide: [{ $multiply: ['$$w.price', '$offer.offer_value'] }, 100] }
                                                            ]
                                                        },
                                                        else: {
                                                            $max: [0, { $subtract: ['$$w.price', '$offer.offer_value'] }]
                                                        }
                                                    }
                                                },
                                                else: '$$w.price'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    discountPrice: { $min: '$weighstWise.discountPrice' }
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

exports.importProducts = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const excelFile = req.files.find(f => f.fieldname === "excel");
        const imageFiles = req.files.filter(f => f.fieldname === "images");

        if (!excelFile) {
            return res.status(400).json({ success: false, message: "Please upload an Excel file" });
        }

        const imageFileMap = new Map();
        imageFiles.forEach(file => {
            imageFileMap.set(file.originalname.toLowerCase(), file);
        });

        let workbook;
        if (excelFile.buffer) {
            workbook = xlsx.read(excelFile.buffer, { type: 'buffer' });
        } else if (excelFile.path) {
            workbook = xlsx.readFile(excelFile.path);
        } else {
            return res.status(400).json({ success: false, message: "Invalid Excel file payload" });
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const normalizedData = data.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
                newRow[key.toLowerCase()] = row[key];
            });
            return newRow;
        });

        let importedCount = 0;
        let errors = [];

        const productsToProcess = new Map();

        // Group rows by product name
        for (const [index, row] of normalizedData.entries()) {
            const productName = (row.name || "").trim();
            if (!productName) {
                errors.push(`Row ${index + 2}: Missing product name. Skipped.`);
                continue;
            }

            if (!productsToProcess.has(productName)) {
                productsToProcess.set(productName, {
                    name: productName,
                    category: row.category,
                    description: row.description || "",
                    images: row.images || "",
                    variants: [],
                    rowIndex: index + 2
                });
            }

            // Extract variant from this row
            let rowVariants = [];
            const variantsData = row.variants || row.weighstwise;

            if (variantsData) {
                try {
                    let parsed;
                    if (typeof variantsData === 'string') {
                        // Handle potential single quotes from Excel or manual entry
                        const sanitizedJson = variantsData.trim().replace(/'/g, '"');
                        parsed = JSON.parse(sanitizedJson);
                    } else {
                        parsed = variantsData;
                    }

                    rowVariants = (Array.isArray(parsed) ? parsed : [parsed]).map(w => ({
                        weight: String(w.weight || "1"),
                        unit: w.unit || 'Kilogram',
                        price: Number(w.price) || 0,
                        stock: Number(w.stock) || 0
                    }));
                } catch (e) {
                    errors.push(`Row ${index + 2}: Invalid variants format for '${productName}'. Error: ${e.message}`);
                }
            } else if (row.weight || row.price || row.stock) {
                rowVariants = [{
                    weight: String(row.weight || "1"),
                    unit: row.unit || "Kilogram",
                    price: Number(row.price) || 0,
                    stock: Number(row.stock) || 0
                }];
            }

            if (rowVariants.length > 0) {
                productsToProcess.get(productName).variants.push(...rowVariants);
            }

            // Merge details if they are provided in subsequent rows but missing in the first
            const current = productsToProcess.get(productName);
            if (!current.description && row.description) current.description = row.description;
            if (!current.category && row.category) current.category = row.category;
            if (!current.images && row.images) current.images = row.images;
        }

        // Process unique products
        for (const [name, productInfo] of productsToProcess.entries()) {
            try {
                // Parse Category
                let categoryId = null;
                if (productInfo.category) {
                    if (mongoose.Types.ObjectId.isValid(productInfo.category)) {
                        categoryId = productInfo.category;
                    } else {
                        // Look up by categoryName (ignore case)
                        const categoryName = typeof productInfo.category === 'string'
                            ? productInfo.category
                            : (productInfo.category.name || String(productInfo.category));
                        const category = await Category.findOne({
                            categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') }
                        });
                        if (category) {
                            categoryId = category._id;
                        }
                    }
                }

                if (!categoryId) {
                    errors.push(`Product '${name}': Category '${productInfo.category}' not found. Skipped.`);
                    continue;
                }

                // Parse images
                let images = [];
                if (productInfo.images && typeof productInfo.images === 'string') {
                    const imageList = productInfo.images.split(',').map(img => img.trim()).filter(img => img);
                    const uniqueImages = [...new Set(imageList)];

                    for (const imgIdentifier of uniqueImages) {
                        try {
                            if (imgIdentifier.startsWith('http')) {
                                // Case A: External URL
                                const uploaded = await uploadUrlToS3(imgIdentifier, "products");
                                if (uploaded) images.push(uploaded);
                            } else {
                                // Case B: Filename - Look for matched uploaded file
                                const matchedFile = imageFileMap.get(imgIdentifier.toLowerCase());
                                if (matchedFile) {
                                    const uploaded = await uploadToS3(matchedFile, "products");
                                    if (uploaded) images.push(uploaded);
                                } else {
                                    console.log(`Image not found in batch: ${imgIdentifier}`);
                                }
                            }
                        } catch (imgErr) {
                            console.error(`Error uploading image ${imgIdentifier}:`, imgErr.message);
                        }
                    }
                }

                // Create Product
                const productToCreate = {
                    name: name,
                    category: categoryId,
                    description: productInfo.description,
                    weighstWise: productInfo.variants,
                    images
                };

                await Product.create(productToCreate);
                importedCount++;

            } catch (err) {
                errors.push(`Product '${name}': ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully imported ${importedCount} products.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Import Products Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get Best Selling Products
exports.getBestSellingProducts = async (req, res) => {
    try {
        const today = new Date();
        const limit = parseInt(req.query.limit) || 100;

        // Step 1: Identify best selling product IDs from the Order collection
        const bestSellingStage = await Order.aggregate([
            { $match: { status: { $nin: ['pending', 'cancelled'] } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    soldCount: { $sum: '$items.quantity' }
                }
            },
            { $sort: { soldCount: -1 } },
            { $limit: limit }
        ]);

        if (bestSellingStage.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const productIds = bestSellingStage.map(item => item._id);

        // Step 2: Fetch detailed product information using the same lookups as getAllProducts
        const pipeline = [
            { $match: { _id: { $in: productIds } } },
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
                    reviewCount: { $size: '$reviews' },
                    offer: { $arrayElemAt: ['$offer', 0] }
                }
            },
            {
                $addFields: {
                    weighstWise: {
                        $map: {
                            input: '$weighstWise',
                            as: 'w',
                            in: {
                                $mergeObjects: [
                                    '$$w',
                                    {
                                        discountPrice: {
                                            $cond: {
                                                if: { $ifNull: ['$offer', false] },
                                                then: {
                                                    $cond: {
                                                        if: { $eq: ['$offer.offer_type', 'Discount'] },
                                                        then: {
                                                            $subtract: [
                                                                '$$w.price',
                                                                { $divide: [{ $multiply: ['$$w.price', '$offer.offer_value'] }, 100] }
                                                            ]
                                                        },
                                                        else: {
                                                            $max: [0, { $subtract: ['$$w.price', '$offer.offer_value'] }]
                                                        }
                                                    }
                                                },
                                                else: '$$w.price'
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ];

        const products = await Product.aggregate(pipeline);

        // Sort the results back based on soldCount order
        const sortedProducts = productIds.map(id => {
            const product = products.find(p => p._id.toString() === id.toString());
            const soldStats = bestSellingStage.find(item => item._id.toString() === id.toString());
            return product ? { ...product, totalSold: soldStats.soldCount } : null;
        }).filter(p => p !== null);

        res.status(200).json({ success: true, data: sortedProducts });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
