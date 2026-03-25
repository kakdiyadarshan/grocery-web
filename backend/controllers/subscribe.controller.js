const Subscribe = require('../models/subscribe.model');

// @desc    Add new subscriber
// @route   POST /api/subscribe
// @access  Public
exports.addSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const existingSubscriber = await Subscribe.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: 'Email already subscribed' });
        }

        const subscriber = await Subscribe.create({ email });
        res.status(201).json({ success: true, data: subscriber, message: 'Successfully subscribed to newsletter' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all subscribers
// @route   GET /api/all-subscribers
// @access  Admin
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscribe.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: subscribers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a subscriber
// @route   DELETE /api/delete-subscriber/:id
// @access  Admin
exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Subscribe.findByIdAndDelete(req.params.id);
        if (!subscriber) {
            return res.status(404).json({ success: false, message: 'Subscriber not found' });
        }
        res.status(200).json({ success: true, message: 'Subscriber deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
