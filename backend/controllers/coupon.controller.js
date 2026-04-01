const Coupon = require('../models/coupon.model');

exports.createCoupon = async (req, res) => {
    try {
        const { code, discount, expiryDate } = req.body;
        if (!code || !discount || !expiryDate) {
            return res.status(400).json({ success: false, message: 'Code, discount, and expiry date are required.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);

        if (expiry <= today) {
            return res.status(400).json({ success: false, message: 'Expiry date must be in the future (after today).' });
        }

        const newCoupon = await Coupon.create({ code, discount, expiryDate });
        res.status(201).json({ success: true, message: 'Coupon created successfully', data: newCoupon });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating coupon', error: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const today = new Date();
        // Automatically deactivate expired coupons
        await Coupon.updateMany(
            { isActive: true, expiryDate: { $lt: today } },
            { $set: { isActive: false } }
        );

        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true,  message: 'Coupons fetched successfully',data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching coupons', error: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting coupon', error: error.message });
    }
};

exports.getCouponById = async(req,res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if(!coupon){
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        // Check if expired and update status on the fly
        const today = new Date();
        if (coupon.isActive && new Date(coupon.expiryDate) < today) {
            coupon.isActive = false;
            await coupon.save();
        }

        res.status(200).json({ success: true, message: 'Coupon fetched successfully', data: coupon });
    } catch (error) {
         res.status(500).json({ success: false, message: 'Error fetching coupon', error: error.message });
    }
}

exports.updateCoupon = async(req,res) => {
    try {
        const { expiryDate } = req.body;
        
        if (expiryDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(expiryDate);
            expiry.setHours(0, 0, 0, 0);

            if (expiry <= today) {
                return res.status(400).json({ success: false, message: 'Expiry date must be in the future (after today).' });
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if(!coupon){
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.status(200).json({ success: true, message: 'Coupon updated successfully', data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating coupon', error: error.message });
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        const userId = req.user?._id || req.body.userId;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase()
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!coupon.isActive || new Date(coupon.expiryDate) <= today) {
            return res.status(400).json({
                success: false,
                message: 'Coupon is expired or inactive'
            });
        }

        // No per-user usage restriction - allow repeated use even for same user.

        res.status(200).json({
            success: true,
            data: {
                couponId: coupon._id,
                code: coupon.code,
                discount: coupon.discount,
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error applying coupon',
            error: error.message
        });
    }
};
