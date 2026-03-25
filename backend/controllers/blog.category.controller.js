const blogCatgoryModel = require("../models/blog.category.model.js");
const { sendBadRequestResponse, sendErrorResponse, sendNotFoundResponse, sendSuccessResponse } = require("../utils/Response.utils.js");

const addNewBlogCategoryController = async (req, res) => {
    try {
        const { blogCategoryName } = req?.body;

        if (!blogCategoryName) {
            return sendBadRequestResponse(res, "blogCategoryName Not Found!");
        }

        const existingCategory = await blogCatgoryModel.findOne({
            blogCategoryName: blogCategoryName
        });

        if (existingCategory) {
            return sendBadRequestResponse(res, "Blog category already exists!");
        }

        const newBlogCategory = await blogCatgoryModel.create({
            blogCategoryName: blogCategoryName
        });

        return sendSuccessResponse(res, "Blog Category created Successfully", newBlogCategory);

    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, "Error during Add new blog Category", error);
    }
}

const getAllBlogCategoryController = async (req, res) => {
    try {
        const blogCategory = await blogCatgoryModel.find({});

        if (!blogCategory || blogCategory.length === 0) {
            return sendNotFoundResponse(res, "Blog Category Not Found!");
        }

        return sendSuccessResponse(res, "Blog Category fetched Successfully", {
            total: blogCategory.length,
            blogsCategory: blogCategory
        });

    } catch (error) {
        console.log(error.message);
        return sendErrorResponse(res, 500, "Error During Get all Blog Categories", error);
    }
}

const getBlogCategoryByIdController = async (req, res) => {
    try {
        const { categoryId } = req?.params;

        if (!categoryId) {
            return sendBadRequestResponse(res, "CategoryId not Found")
        }

        const blogCategory = await blogCatgoryModel.findById(categoryId);

        if (!blogCategory) {
            return sendNotFoundResponse(res, "Blog category not found");
        }

        return sendSuccessResponse(res, "Blog category by Id Fetched Successfully", blogCategory)
    } catch (error) {
        console.log(error.message);
        return sendErrorResponse(res, 500, "Error During Get Blog Category By id", error);
    }
}

const updateBlogCategoryController = async (req, res) => {
    try {
        const { blogCategoryName } = req?.body;
        const { categoryId } = req?.params;

        if (!blogCategoryName) {
            return sendBadRequestResponse(res, "blogCategoryName Not Found!");
        }

        const existingCategory = await blogCatgoryModel.findOne({
            $and: [
                { _id: { $ne: categoryId } },
                { blogCategoryName: blogCategoryName }
            ]
        });

        if (existingCategory) {
            return sendBadRequestResponse(res, "Blog category name already exists!");
        }

        const updateBlogCategory = await blogCatgoryModel.findByIdAndUpdate(
            { _id: categoryId },
            { blogCategoryName: blogCategoryName },
            { new: true }
        );

        if (!updateBlogCategory) {
            return sendNotFoundResponse(res, "Blog category not found");
        }

        return sendSuccessResponse(res, "Blog Category updated Successfully", updateBlogCategory);

    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, "Error during update blog Category", error);
    }
}

const deleteBlogCategoryController = async (req, res) => {
    try {
        const { categoryId } = req?.params;

        if (!categoryId) return sendNotFoundResponse(res, "categoryId Not Found");

        const deleteBlogCategory = await blogCatgoryModel.findByIdAndDelete(categoryId);

        if (!deleteBlogCategory) {
            return sendNotFoundResponse(res, "Blog category not found");
        }

        return sendSuccessResponse(res, "Blog category Delete Successfully", deleteBlogCategory);

    } catch (error) {
        console.log(error)
        return sendErrorResponse(res, 500, "Error During Delete Blog category", error);
    }
}

module.exports = {
    addNewBlogCategoryController,
    getAllBlogCategoryController,
    getBlogCategoryByIdController,
    updateBlogCategoryController,
    deleteBlogCategoryController
};