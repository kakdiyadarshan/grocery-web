const Banner = require('../models/banner.model');
const { deleteFromS3, uploadToS3 } = require('../utils/s3Service');

exports.createBanner = async (req, res) => {
    try {
        const { title, subtitle, description, buttonText, bgColor, link, isActive, order } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Banner title is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Banner image is required" });
        }

        const uploadedImage = await uploadToS3(req.file, "banners");

        const newBanner = await Banner.create({
            title,
            subtitle,
            description,
            buttonText,
            bgColor,
            link,
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0,
            titleStyle: {
                color: req.body.titleColor || '#1b1b1b',
                fontSize: req.body.titleSize || '48px'
            },
            subtitleStyle: {
                color: req.body.subtitleColor || '#555555',
                fontSize: req.body.subtitleSize || '16px'
            },
            textPosition: req.body.textPosition || 'left',
            image: {
                url: uploadedImage.url,
                public_id: uploadedImage.public_id
            }
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: newBanner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, description, buttonText, bgColor, link, isActive, order } = req.body;

        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        let updatedImage = banner.image;

        if (req.file) {
            await deleteFromS3(banner.image.public_id);
            const uploadedImage = await uploadToS3(req.file, "banners");
            updatedImage = {
                url: uploadedImage.url,
                public_id: uploadedImage.public_id
            };
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            {
                title: title || banner.title,
                subtitle: subtitle || banner.subtitle,
                description: description || banner.description,
                buttonText: buttonText || banner.buttonText,
                bgColor: bgColor || banner.bgColor,
                link: link || banner.link,
                isActive: isActive !== undefined ? isActive : banner.isActive,
                order: order !== undefined ? order : banner.order,
                titleStyle: {
                    color: req.body.titleColor || banner.titleStyle?.color || '#1b1b1b',
                    fontSize: req.body.titleSize || banner.titleStyle?.fontSize || '48px'
                },
                subtitleStyle: {
                    color: req.body.subtitleColor || banner.subtitleStyle?.color || '#555555',
                    fontSize: req.body.subtitleSize || banner.subtitleStyle?.fontSize || '16px'
                },
                textPosition: req.body.textPosition || banner.textPosition || 'left',
                image: updatedImage
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: updatedBanner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        await deleteFromS3(banner.image.public_id);

        await Banner.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
