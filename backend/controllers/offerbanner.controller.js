const OfferBanner = require('../models/offerbanner.model');
const { deleteFromS3, uploadToS3 } = require('../utils/s3Service');

exports.createOfferBanner = async (req, res) => {
    try {
        const { title, subtitle, link, isActive, order } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Banner title is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Banner image is required" });
        }

        const uploadedImage = await uploadToS3(req.file, "offerbanners");

        const newBanner = await OfferBanner.create({
            title,
            subtitle,
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

exports.getAllOfferBanners = async (req, res) => {
    try {
        const banners = await OfferBanner.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOfferBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, link, isActive, order } = req.body;

        const banner = await OfferBanner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        let updatedImage = banner.image;

        if (req.file) {
            await deleteFromS3(banner.image.public_id);
            const uploadedImage = await uploadToS3(req.file, "offerbanners");
            updatedImage = {
                url: uploadedImage.url,
                public_id: uploadedImage.public_id
            };
        }

        const updatedBanner = await OfferBanner.findByIdAndUpdate(
            id,
            {
                title: title || banner.title,
                subtitle: subtitle || banner.subtitle,
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

exports.deleteOfferBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await OfferBanner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        await deleteFromS3(banner.image.public_id);

        await OfferBanner.findByIdAndDelete(id);

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
