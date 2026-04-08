const mongoose = require('mongoose');
const Order = require('../models/order.model');

exports.getSellerOrderMonthlyAnalytics = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user._id);
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        const analytics = await Order.aggregate([
            { 
                $match: { 
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: startOfYear, $lte: endOfYear }
                } 
            },
            { $unwind: "$items" },
            { $match: { "items.sellerId": sellerId } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, orderId: "$_id" }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const allMonths = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ].map(month => ({ name: month, orders: 0 }));

        analytics.forEach(item => {
            if (item._id >= 1 && item._id <= 12) {
                allMonths[item._id - 1].orders = item.totalOrders;
            }
        });

        res.status(200).json({ success: true, data: allMonths });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerRevenueAnalytics = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user._id);
        const now = new Date();
        const currentYear = now.getFullYear();

        // 1. Weekly range
        const currentDay = now.getDay() || 7;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // 2. Monthly range
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        // 3. Yearly range (past 5 years)
        const startOf5Years = new Date(currentYear - 4, 0, 1);

        const buildMatch = (start, end) => ({
            sellerId: sellerId,
            status: { $ne: 'cancelled' },
            createdAt: { $gte: start, $lte: end }
        });

        const aggregateData = async (start, end) => {
            return await Order.aggregate([
                { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: start, $lte: end } } },
                { $unwind: "$items" },
                { $match: { "items.sellerId": sellerId } },
                {
                    $lookup: {
                        from: 'payments',
                        localField: '_id',
                        foreignField: 'orderId',
                        as: 'paymentInfo'
                    }
                },
                { $unwind: { path: "$paymentInfo", preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        $or: [
                            { paymentMethod: 'Stripe' }, // Stripe is always counted (pre-paid)
                            { $and: [{ paymentMethod: 'COD' }, { "paymentInfo.status": 'paid' }] } // COD only when paid
                        ]
                    }
                },
                {
                    $group: {
                        _id: { 
                            day: { $dayOfWeek: "$createdAt" },
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" },
                            method: "$paymentMethod"
                        },
                        totalRevenue: { 
                            $sum: { 
                                $multiply: [
                                    { $multiply: ["$items.price", "$items.quantity"] },
                                    0.9 // Assuming 10% commission
                                ]
                            } 
                        },
                        totalSales: { 
                            $sum: { 
                                $add: [
                                    { $multiply: ["$items.price", "$items.quantity"] },
                                    { $multiply: [{ $multiply: ["$items.price", "$items.quantity"] }, 0.08] } // + 8% Tax
                                ]
                            } 
                        }
                    }
                }
            ]);
        };

        const weeklyData = await aggregateData(startOfWeek, endOfWeek);
        const monthlyData = await aggregateData(startOfYear, endOfYear);
        const yearlyData = await aggregateData(startOf5Years, endOfYear);

        // Process Weekly
        const weeklyTotalAmtValues = Array(7).fill(0);
        const weeklyEarningValues = Array(7).fill(0);
        const weeklyCodValues = Array(7).fill(0);
        const weeklyStripeValues = Array(7).fill(0);
        let totalWeeklyEarning = 0;

        weeklyData.forEach(item => {
            const dayIndex = item._id.day === 1 ? 6 : item._id.day - 2;
            if (dayIndex >= 0 && dayIndex < 7) {
                weeklyTotalAmtValues[dayIndex] += item.totalSales;
                weeklyEarningValues[dayIndex] += item.totalRevenue;
                if (item._id.method === 'COD') weeklyCodValues[dayIndex] += item.totalRevenue;
                else weeklyStripeValues[dayIndex] += item.totalRevenue;
                totalWeeklyEarning += item.totalRevenue;
            }
        });

        // Process Monthly
        const monthlyTotalAmtValues = Array(12).fill(0);
        const monthlyEarningValues = Array(12).fill(0);
        const monthlyCodValues = Array(12).fill(0);
        const monthlyStripeValues = Array(12).fill(0);
        let totalMonthlyEarning = 0;

        monthlyData.forEach(item => {
            if (item._id.month >= 1 && item._id.month <= 12) {
                monthlyTotalAmtValues[item._id.month - 1] += item.totalSales;
                monthlyEarningValues[item._id.month - 1] += item.totalRevenue;
                if (item._id.method === 'COD') monthlyCodValues[item._id.month - 1] += item.totalRevenue;
                else monthlyStripeValues[item._id.month - 1] += item.totalRevenue;
                totalMonthlyEarning += item.totalRevenue;
            }
        });

        // Process Yearly
        const yearlyCategories = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
        const yearlyTotalAmtValues = Array(5).fill(0);
        const yearlyEarningValues = Array(5).fill(0);
        const yearlyCodValues = Array(5).fill(0);
        const yearlyStripeValues = Array(5).fill(0);
        let totalYearlyEarning = 0;

        yearlyData.forEach(item => {
            const index = yearlyCategories.indexOf(item._id.year);
            if (index !== -1) {
                yearlyTotalAmtValues[index] += item.totalSales;
                yearlyEarningValues[index] += item.totalRevenue;
                if (item._id.method === 'COD') yearlyCodValues[index] += item.totalRevenue;
                else yearlyStripeValues[index] += item.totalRevenue;
                totalYearlyEarning += item.totalRevenue;
            }
        });

        const responseData = {
            Weekly: {
                categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                totalAmountSeries: weeklyTotalAmtValues,
                earningSeries: weeklyEarningValues,
                codSeries: weeklyCodValues,
                stripeSeries: weeklyStripeValues,
                total: totalWeeklyEarning,
                growth: 0 // Can be calculated if needed
            },
            Monthly: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                totalAmountSeries: monthlyTotalAmtValues,
                earningSeries: monthlyEarningValues,
                codSeries: monthlyCodValues,
                stripeSeries: monthlyStripeValues,
                total: totalMonthlyEarning,
                growth: 0
            },
            Yearly: {
                categories: yearlyCategories.map(String),
                totalAmountSeries: yearlyTotalAmtValues,
                earningSeries: yearlyEarningValues,
                codSeries: yearlyCodValues,
                stripeSeries: yearlyStripeValues,
                total: totalYearlyEarning,
                growth: 0
            }
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
