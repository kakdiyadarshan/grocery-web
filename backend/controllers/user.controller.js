const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { deleteFromS3, uploadToS3 } = require('../utils/s3Service');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" });

        return res.status(200).json({
            status: 200,
            message: "All users fetched successfully..!",
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "User fetched successfully..!",
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        let updateData = { ...req.body };
        // Prevent photo from being overwritten by req.body. 
        // Photo should ONLY be updated via req.file below.
        if (updateData.photo) delete updateData.photo;

        if (req.file) {
            // Delete old photo from S3 if it exists
            if (existingUser.photo && existingUser.photo.public_id) {
                await deleteFromS3(existingUser.photo.public_id);
            }

            // Upload new photo to S3
            const uploadedResult = await uploadToS3(req.file, "profiles");
            updateData.photo = {
                url: uploadedResult.url,
                public_id: uploadedResult.public_id
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            status: 200,
            message: "User updated successfully..!",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let userId = req.user._id;

        let { oldPassword, newPassword, confirmPassword } = req.body;

        let getUser = await User.findById(userId);

        if (!getUser) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
        }

        let correctPassword = await bcrypt.compare(oldPassword, getUser.password);

        if (!correctPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Old Password Not Match",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "New Password And ConfirmPassword Not Match",
            });
        }

        let salt = await bcrypt.genSalt(10);
        let hasPssword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password: hasPssword }, { new: true });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Password Change SuccessFully..!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

