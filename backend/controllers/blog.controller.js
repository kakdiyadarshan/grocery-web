const mongoose = require("mongoose");
const blogModel = require("../models/blog.model.js");
const { sendErrorResponse, sendNotFoundResponse, sendBadRequestResponse, sendSuccessResponse } = require("../utils/Response.utils.js");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service.js");

const addNewBlogController = async (req, res) => {
    try {
        const { blogCategoryId, blogTitle, blogDesc, section, conclusion } = req.body;

        if (!blogCategoryId || !blogTitle || !blogDesc) {
            return sendBadRequestResponse(res, "blogCategoryId, blogTitle and blogDesc are required!");
        }

        let heroImageUrl = null;

        if (req.files && Array.isArray(req.files)) {
            const heroFile = req.files.find(f => f.fieldname === "heroImage");
            if (heroFile) {
                const result = await uploadToS3(heroFile, "blogs");
                heroImageUrl = result ? result.url : null;
            }
        }

        let parsedSections = [];
        if (section) {
            parsedSections = JSON.parse(section);

            for (let i = 0; i < parsedSections.length; i++) {
                const sectionFiles = req.files.filter(
                    (f) => f.fieldname === `sectionImg_${i}`
                );

                let sectionImgs = [];
                if (sectionFiles && sectionFiles.length > 0) {
                    sectionImgs = await Promise.all(
                        sectionFiles.map(async (file) => {
                            const res = await uploadToS3(file, "blogs");
                            return res ? res.url : null;
                        })
                    );
                    // filter out any nullish values
                    sectionImgs = sectionImgs.filter(Boolean);
                }

                parsedSections[i].sectionImg = sectionImgs;
            }
        }

        const blog = new blogModel({
            blogCategoryId,
            blogTitle,
            blogDesc: blogDesc,
            heroImage: heroImageUrl,
            section: parsedSections,
            conclusion: conclusion
        });

        await blog.save();

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog,
        });
    } catch (error) {
        console.error("CREATE BLOG ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllBlogsController = async (req, res) => {
    try {
        const hasPagination =
            typeof req.query.page !== "undefined" || typeof req.query.limit !== "undefined";

        if (hasPagination) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const blogs = await blogModel
                .find()
                .populate({
                    path: "blogCategoryId"
                })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await blogModel.countDocuments();

            return res.status(200).json({
                success: true,
                message: "All blogs fetched successfully",
                total,
                page,
                limit,
                blogs,
            });
        }

        const blogs = await blogModel
            .find()
            .populate({
                path: "blogCategoryId"
            })
            .sort({ createdAt: -1 });

        const total = await blogModel.countDocuments();

        return res.status(200).json({
            success: true,
            message: "All blogs fetched successfully",
            total,
            blogs,
        });
    } catch (error) {
        console.error("GET ALL BLOGS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBlogByIdController = async (req, res) => {
    try {
        const { blogId: id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Blog ID" });
        }

        const blog = await blogModel
            .findById(id)
            .populate("blogCategoryId");

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Blog fetched successfully",
            blog,
        });
    } catch (error) {
        console.error("GET BLOG BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateBlogController = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { blogCategoryId, blogTitle, blogDesc, conclusion, removeHeroImage } = req.body;
        const sectionData = req.body?.section ? JSON.parse(req.body.section) : null;

        if (!mongoose.Types.ObjectId.isValid(blogId))
            return res.status(400).json({ success: false, message: "Invalid Blog ID" });

        const blog = await blogModel.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        // 1. Hero Image handling
        if (removeHeroImage === 'true' && blog.heroImage) {
            const key = blog.heroImage.split(".amazonaws.com/").pop();
            await deleteFromS3(key);
            blog.heroImage = null;
        }

        if (req.files && Array.isArray(req.files)) {
            const heroFile = req.files.find(f => f.fieldname === "heroImage");
            if (heroFile) {
                if (blog.heroImage) {
                    const key = blog.heroImage.split(".amazonaws.com/").pop();
                    await deleteFromS3(key);
                }
                const result = await uploadToS3(heroFile, "blogs");
                if (result) blog.heroImage = result.url;
            }
        }

        // 2. Text fields
        if (blogTitle) blog.blogTitle = blogTitle;
        if (blogCategoryId) blog.blogCategoryId = blogCategoryId;
        if (blogDesc) blog.blogDesc = blogDesc;
        if (conclusion !== undefined) blog.conclusion = conclusion;

        // 3. Section handling
        if (sectionData && Array.isArray(sectionData)) {
            // Global cleanup of deleted images from S3
            const currentSectionImgs = (blog.section || []).flatMap(s => s.sectionImg || []);
            const keepSectionImgs = sectionData.flatMap(s => s.sectionImg || []);

            const toDelete = currentSectionImgs.filter(img => !keepSectionImgs.includes(img));
            for (const img of toDelete) {
                if (img && img.includes('.amazonaws.com/')) {
                    const key = img.split(".amazonaws.com/").pop();
                    await deleteFromS3(key);
                }
            }

            // Build new sections with new uploads
            const newSections = [];
            for (let i = 0; i < sectionData.length; i++) {
                const incomingSec = sectionData[i];
                let finalImgs = incomingSec.sectionImg || [];

                // Handle new file uploads for this section
                if (req.files && Array.isArray(req.files)) {
                    const sectionFiles = req.files.filter(f => f.fieldname === `sectionImg_${i}`);
                    if (sectionFiles.length > 0) {
                        const uploadedUrls = await Promise.all(
                            sectionFiles.map(async (file) => {
                                const res = await uploadToS3(file, "blogs");
                                return res ? res.url : null;
                            })
                        );
                        finalImgs = [...finalImgs, ...uploadedUrls.filter(Boolean)];
                    }
                }

                newSections.push({
                    sectionTitle: incomingSec.sectionTitle || "",
                    sectionDesc: Array.isArray(incomingSec.sectionDesc) ? incomingSec.sectionDesc : [],
                    sectionPoints: Array.isArray(incomingSec.sectionPoints) ? incomingSec.sectionPoints : [],
                    sectionOtherInfo: Array.isArray(incomingSec.sectionOtherInfo) ? incomingSec.sectionOtherInfo : [],
                    sectionImg: finalImgs
                });
            }
            blog.section = newSections;
        }

        await blog.save();
        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog
        });
    } catch (error) {
        console.error("UPDATE BLOG ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBlogController = async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({ success: false, message: "Invalid Blog ID" });
        }

        const blog = await blogModel.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        if (blog.heroImage) {
            const key = blog.heroImage.split(".amazonaws.com/").pop();
            await deleteFromS3(key);
        }

        if (blog.section?.length) {
            for (const sec of blog.section) {
                if (sec.sectionImg?.length) {
                    for (const img of sec.sectionImg) {
                        const key = img.split(".amazonaws.com/").pop();
                        await deleteFromS3(key);
                    }
                }
            }
        }

        await blogModel.findByIdAndDelete(blogId);

        return res.status(200).json({ success: true, message: "Blog and all images deleted successfully" });

    } catch (error) {
        console.error("DELETE BLOG ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBlogWithCategoryController = async (req, res) => {
    try {
        const { categoryId } = req.query;

        const filter = categoryId && mongoose.Types.ObjectId.isValid(categoryId)
            ? { blogCategoryId: categoryId }
            : {};

        if (categoryId === "68dba9693f29e2eef1ceee93") {
            const products = await blogModel.find({})
                .populate({
                    path: "blogCategoryId",
                    select: "blogCategoryName slug isFeatureBlog"
                })
                .sort({ createdAt: -1 });

            return sendSuccessResponse(res, "All blogs fetched successfully", products);
        }

        const blogs = await blogModel.find(filter)
            .populate({
                path: "blogCategoryId",
                select: "blogCategoryName slug isFeatureBlog"
            })
            .sort({ createdAt: -1 });

        return sendSuccessResponse(res, "Blogs with category fetched Successfully", blogs);

    } catch (error) {
        console.error("Error fetching blogs with category:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

const getLatestBlogController = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 6;

        const blogs = await blogModel
            .find({})
            .sort({ createdAt: -1 })
            .populate({
                path: "blogCategoryId"
            })
            .limit(limit);

        if (!blogs || blogs.length === 0) {
            return sendNotFoundResponse(res, "No blogs found.");
        }

        return sendSuccessResponse(res, "Latest blogs fetched successfully.", blogs);
    } catch (error) {
        console.log(error.message);
        return sendErrorResponse(res, 500, "Error During Fetch latest Blog", error)
    }
}

module.exports = {
    addNewBlogController,
    getAllBlogsController,
    getBlogByIdController,
    updateBlogController,
    deleteBlogController,
    getBlogWithCategoryController,
    getLatestBlogController
};