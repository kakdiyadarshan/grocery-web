const Offer = require('../models/offer.model');
const Product = require('../models/product.model');

// Create a new offer
exports.createOffer = async (req, res) => {
    try {
        const { product_id, offer_type, offer_value, offer_start_date, offer_end_date } = req.body;

        // Ensure product_id is an array (even if single product passed)
        const products = Array.isArray(product_id) ? product_id : [product_id];

        const newOffer = new Offer({
            product_id: products,
            offer_type,
            offer_value,
            offer_start_date,
            offer_end_date
        });

        await newOffer.save();

        return res.status(201).json({
            status: 201,
            success: true,
            message: 'Offer created successfully',
            data: newOffer
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
};

// Get all offers
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find().populate('product_id', 'name sku price images').sort({ createdAt: -1 });

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Offers fetched successfully',
            data: offers
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
};

// Get single offer by ID
exports.getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id).populate('product_id', 'name sku price images');

        if (!offer) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Offer not found'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Offer fetched successfully',
            data: offer
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
};

// Update an offer
exports.updateOffer = async (req, res) => {
    try {
        const { product_id, offer_type, offer_value, offer_start_date, offer_end_date } = req.body;

        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.id,
            {
                product_id: Array.isArray(product_id) ? product_id : [product_id],
                offer_type,
                offer_value,
                offer_start_date,
                offer_end_date
            },
            { new: true, runValidators: true }
        );

        if (!updatedOffer) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Offer not found'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Offer updated successfully',
            data: updatedOffer
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
};

// Delete an offer
exports.deleteOffer = async (req, res) => {
    try {
        const deletedOffer = await Offer.findByIdAndDelete(req.params.id);

        if (!deletedOffer) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Offer not found'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
};
