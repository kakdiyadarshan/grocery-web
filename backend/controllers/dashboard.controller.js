const Order = require('../models/order.model');
const Payment = require('../models/payment.model');

exports.getOrderMonthlyAnalytics = async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        const analytics = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfYear,
                        $lte: endOfYear
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const allMonths = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ].map(month => ({
            month,
            totalOrders: 0
        }));

        analytics.forEach(item => {
            if (item._id >= 1 && item._id <= 12) {
                allMonths[item._id - 1].totalOrders = item.totalOrders;
            }
        });

        res.status(200).json({ success: true, data: allMonths });
    } catch (error) {
        console.error("getOrderMonthlyAnalytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRevenueAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();

        // 1. Weekly (Mon - Sun of current week)
        const currentDay = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Previous week for growth %
        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
        const endOfPrevWeek = new Date(endOfWeek);
        endOfPrevWeek.setDate(endOfWeek.getDate() - 7);

        // 2. Monthly (Jan - Dec of current year)
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        const startOfPrevYear = new Date(currentYear - 1, 0, 1);
        const endOfPrevYear = new Date(currentYear - 1, 11, 31, 23, 59, 59, 999);

        // 3. Yearly (Past 5 years)
        const startOf5Years = new Date(currentYear - 4, 0, 1);
        const startOfPrev5Years = new Date(currentYear - 9, 0, 1);
        const endOfPrev5Years = new Date(currentYear - 5, 11, 31, 23, 59, 59, 999);

        // Aggregation for Weekly
        const weeklyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfWeek, $lte: endOfWeek }, status: 'paid' } },
            { $group: { _id: { day: { $dayOfWeek: "$createdAt" }, method: "$paymentMethod" }, totalAmount: { $sum: "$amount" }, earnings: { $sum: "$adminCommission" } } }
        ]);
        const prevWeeklyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfPrevWeek, $lte: endOfPrevWeek }, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$adminCommission" } } }
        ]);

        const weeklyTotalAmtValues = Array(7).fill(0);
        const weeklyEarningValues = Array(7).fill(0);
        const weeklyCodValues = Array(7).fill(0);
        const weeklyStripeValues = Array(7).fill(0);
        let totalWeeklyEarning = 0;

        weeklyData.forEach(item => {
            const dayIndex = item._id.day === 1 ? 6 : item._id.day - 2;
            if (dayIndex >= 0 && dayIndex < 7) {
                weeklyTotalAmtValues[dayIndex] += item.totalAmount;
                weeklyEarningValues[dayIndex] += item.earnings;
                if (item._id.method === 'COD') weeklyCodValues[dayIndex] = item.earnings;
                else if (item._id.method === 'Stripe') weeklyStripeValues[dayIndex] = item.earnings;
            }
            totalWeeklyEarning += item.earnings;
        });
        const prevWeeklyEarning = prevWeeklyData.length ? prevWeeklyData[0].total : 0;
        const weeklyGrowth = prevWeeklyEarning ? ((totalWeeklyEarning - prevWeeklyEarning) / prevWeeklyEarning) * 100 : (totalWeeklyEarning > 0 ? 100 : 0);

        // Aggregation for Monthly
        const monthlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear }, status: 'paid' } },
            { $group: { _id: { month: { $month: "$createdAt" }, method: "$paymentMethod" }, totalAmount: { $sum: "$amount" }, earnings: { $sum: "$adminCommission" } } }
        ]);
        const prevMonthlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfPrevYear, $lte: endOfPrevYear }, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$adminCommission" } } }
        ]);

        const monthlyTotalAmtValues = Array(12).fill(0);
        const monthlyEarningValues = Array(12).fill(0);
        const monthlyCodValues = Array(12).fill(0);
        const monthlyStripeValues = Array(12).fill(0);
        let totalMonthlyEarning = 0;
        monthlyData.forEach(item => {
            if (item._id.month >= 1 && item._id.month <= 12) {
                monthlyTotalAmtValues[item._id.month - 1] += item.totalAmount;
                monthlyEarningValues[item._id.month - 1] += item.earnings;
                if (item._id.method === 'COD') monthlyCodValues[item._id.month - 1] = item.earnings;
                else if (item._id.method === 'Stripe') monthlyStripeValues[item._id.month - 1] = item.earnings;
            }
            totalMonthlyEarning += item.earnings;
        });
        const prevMonthlyEarning = prevMonthlyData.length ? prevMonthlyData[0].total : 0;
        const monthlyGrowth = prevMonthlyEarning ? ((totalMonthlyEarning - prevMonthlyEarning) / prevMonthlyEarning) * 100 : (totalMonthlyEarning > 0 ? 100 : 0);

        // Aggregation for Yearly
        const yearlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOf5Years, $lte: endOfYear }, status: 'paid' } },
            { $group: { _id: { year: { $year: "$createdAt" }, method: "$paymentMethod" }, totalAmount: { $sum: "$amount" }, earnings: { $sum: "$adminCommission" } } }
        ]);
        const prevYearlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfPrev5Years, $lte: endOfPrev5Years }, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$adminCommission" } } }
        ]);

        const yearlyCategories = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
        const yearlyTotalAmtValues = Array(5).fill(0);
        const yearlyEarningValues = Array(5).fill(0);
        const yearlyCodValues = Array(5).fill(0);
        const yearlyStripeValues = Array(5).fill(0);
        let totalYearlyEarning = 0;
        yearlyData.forEach(item => {
            const index = yearlyCategories.indexOf(item._id.year);
            if (index !== -1) {
                yearlyTotalAmtValues[index] += item.totalAmount;
                yearlyEarningValues[index] += item.earnings;
                if (item._id.method === 'COD') yearlyCodValues[index] = item.earnings;
                else if (item._id.method === 'Stripe') yearlyStripeValues[index] = item.earnings;
            }
            totalYearlyEarning += item.earnings;
        });
        const prevYearlyEarning = prevYearlyData.length ? prevYearlyData[0].total : 0;
        const yearlyGrowth = prevYearlyEarning ? ((totalYearlyEarning - prevYearlyEarning) / prevYearlyEarning) * 100 : (totalYearlyEarning > 0 ? 100 : 0);

        // Seller wise revenue distribution
        const sellerRevenueData = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
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
                        { paymentMethod: 'Stripe' }, 
                        { $and: [{ paymentMethod: 'COD' }, { "paymentInfo.status": 'paid' }] }
                    ]
                }
            },
            { $unwind: "$items" },
            { $match: { "items.sellerId": { $ne: null } } },
            { 
                $group: { 
                    _id: "$items.sellerId", 
                    totalAmount: { 
                        $sum: { 
                            $multiply: [
                                { $multiply: ["$items.price", "$items.quantity"] },
                                0.9 // Assuming 10% commission
                            ]
                        } 
                    } 
                } 
            },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "seller" } },
            { $unwind: "$seller" },
            {
                $project: {
                    name: { 
                        $ifNull: [
                            "$seller.brandDetails.storeName", 
                            { $concat: ["$seller.firstname", " ", "$seller.lastname"] }
                        ]
                    },
                    value: "$totalAmount"
                }
            },
            { $sort: { value: -1 } },
            { $limit: 10 }
        ]);

        const responseData = {
            Weekly: {
                categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                totalAmountSeries: weeklyTotalAmtValues,
                earningSeries: weeklyEarningValues,
                codSeries: weeklyCodValues,
                stripeSeries: weeklyStripeValues,
                total: totalWeeklyEarning,
                growth: weeklyGrowth
            },
            Monthly: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                totalAmountSeries: monthlyTotalAmtValues,
                earningSeries: monthlyEarningValues,
                codSeries: monthlyCodValues,
                stripeSeries: monthlyStripeValues,
                total: totalMonthlyEarning,
                growth: monthlyGrowth
            },
            Yearly: {
                categories: yearlyCategories.map(String),
                totalAmountSeries: yearlyTotalAmtValues,
                earningSeries: yearlyEarningValues,
                codSeries: yearlyCodValues,
                stripeSeries: yearlyStripeValues,
                total: totalYearlyEarning,
                growth: yearlyGrowth
            },
            SellerDistribution: {
                names: sellerRevenueData.map(s => s.name || "Unknown Store"),
                counts: sellerRevenueData.map(s => s.value)
            }
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error("getRevenueAnalytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
