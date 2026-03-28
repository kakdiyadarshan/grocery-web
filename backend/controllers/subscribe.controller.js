const Subscribe = require('../models/subscribe.model');
const sendEmail = require('../utils/sendEmail');

exports.addSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const existingSubscriber = await Subscribe.findOne({ email });
        if (existingSubscriber) {
            return res.status(409).json({ success: false, message: 'This email is already subscribed.' });
        }

        const subscriber = await Subscribe.create({ email });
        res.status(201).json({ success: true, data: subscriber, message: 'You have successfully subscribed to our newsletter!' });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors)[0]?.message || 'Please enter a valid email address.';
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
};

exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscribe.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: subscribers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sendOfferEmail = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Subject and message are required.' });
        }

        const subscribers = await Subscribe.find({ status: 'Active' });

        if (!subscribers.length) {
            return res.status(404).json({ success: false, message: 'No active subscribers found.' });
        }

        const htmlBody = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #2ecc71 0%, #1a8a4a 100%); padding: 40px 32px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">🛒 GroceryWeb</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Special Offer Just for You!</p>
                </div>
                <div style="padding: 36px 32px;">
                    <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 16px; font-weight: 700;">${subject}</h2>
                    <div style="color: #555; font-size: 15px; line-height: 1.8; white-space: pre-line;">${message}</div>
                    <div style="margin: 32px 0; text-align: center;">
                        <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: linear-gradient(135deg, #2ecc71, #1a8a4a); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px;">Shop Now</a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">You received this email because you subscribed to GroceryWeb newsletters.<br/>To unsubscribe, reply to this email.</p>
                </div>
            </div>
        `;

        const emailPromises = subscribers.map(sub =>
            sendEmail({ email: sub.email, subject, html: htmlBody })
        );

        await Promise.allSettled(emailPromises);

        res.status(200).json({
            success: true,
            message: `Offer email sent successfully to ${subscribers.length} subscriber(s).`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
};

exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Subscribe.findByIdAndDelete(req.params.id);
        if (!subscriber) {
            return res.status(404).json({ success: false, message: 'Subscriber not found.' });
        }
        res.status(200).json({ success: true, message: 'Subscriber Deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
};
