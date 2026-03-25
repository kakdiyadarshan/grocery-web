const FAQ = require('../models/faq.model');

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({});
        res.status(200).json({
            status: 200,
            data: faqs,
            message: 'All FAQs retrieved successfully..!'
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

// Get FAQ by ID
exports.getFAQById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) { return res.status(404).json({ status: 404, message: 'FAQ not found' }); }
        res.status(200).json({ status: 200, data: faq, message: 'FAQ retrieved successfully..!' });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

// Create new FAQ
exports.createFAQ = async (req, res) => {
    try {
        const { title, faqs } = req.body;

        const newFAQ = new FAQ({
            title,
            faqs
        });

        const savedFAQ = await newFAQ.save();
        res.status(201).json({ status: 201, data: savedFAQ, message: 'FAQ created successfully..!' });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
    try {
        const { title, faqs } = req.body;

        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { title, faqs },
            { new: true, runValidators: true }
        );

        if (!updatedFAQ) { return res.status(404).json({ status: 404, message: 'FAQ not found' }); }
        res.status(200).json({ status: 200, data: updatedFAQ, message: 'FAQ updated successfully..!' });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
};

// Delete FAQ (soft delete)
exports.deleteFAQ = async (req, res) => {
    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(
            req.params.id
        );

        if (!deletedFAQ) {
            return res.status(404).json({ status: 404, message: 'FAQ not found' });
        }

        res.status(200).json({ status: 200, message: 'FAQ deleted successfully..!' });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};