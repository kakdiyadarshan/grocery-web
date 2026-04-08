const Order = require('../models/order.model');

exports.getSellerOrderMonthlyAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        const analytics = await Order.aggregate([
            { 
                $match: { 
                    sellerId: sellerId,
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
        console.error("getSellerOrderMonthlyAnalytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerRevenueAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const now = new Date();
        const currentYear = now.getFullYear();

        // 1. Weekly (Mon - Sun of current week)
        const currentDay = now.getDay() || 7;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
        const endOfPrevWeek = new Date(endOfWeek);
        endOfPrevWeek.setDate(endOfWeek.getDate() - 7);

        // 2. Monthly
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        const startOfPrevYear = new Date(currentYear - 1, 0, 1);
        const endOfPrevYear = new Date(currentYear - 1, 11, 31, 23, 59, 59, 999);

        // 3. Yearly
        const startOf5Years = new Date(currentYear - 4, 0, 1);
        const startOfPrev5Years = new Date(currentYear - 9, 0, 1);
        const endOfPrev5Years = new Date(currentYear - 5, 11, 31, 23, 59, 59, 999);

        const buildPipeline = (start, end) => [
            { $match: { sellerId: sellerId, createdAt: { $gte: start, $lte: end }, status: { $nin: ['cancelled'] } } },
        ];

        // Weekly
        const weeklyTotalData = await Order.aggregate([
            ...buildPipeline(startOfWeek, endOfWeek),
            { $group: { _id: { day: { $dayOfWeek: "$createdAt" }, method: "$paymentMethod" }, totalAmount: { $sum: "$totalAmount" }, earning: { $sum: "$sellerAmount" } } }
        ]);
        const prevWeeklyData = await Order.aggregate([
            ...buildPipeline(startOfPrevWeek, endOfPrevWeek),
            { $group: { _id: null, total: { $sum: "$sellerAmount" } } }
        ]);

        const weeklyValues = Array(7).fill(0);
        const weeklyTotalAmtValues = Array(7).fill(0);
        const weeklyEarningValues = Array(7).fill(0);
        const weeklyCodValues = Array(7).fill(0);
        const weeklyStripeValues = Array(7).fill(0);
        let totalWeeklyEarning = 0;

        weeklyTotalData.forEach(item => {
            const dayIndex = item._id.day === 1 ? 6 : item._id.day - 2; 
            if(dayIndex >= 0 && dayIndex < 7) {
                weeklyTotalAmtValues[dayIndex] += item.totalAmount;
                weeklyEarningValues[dayIndex] += item.earning;
                weeklyValues[dayIndex] += item.earning;
                if (item._id.method === 'COD') {
                    weeklyCodValues[dayIndex] += item.earning; // or totalAmount? The user's stack bar originally was revenue from COD vs Stripe. Let's use earning or totalAmount. Let's use earning since it says "Earnings Trend".
                } else {
                    weeklyStripeValues[dayIndex] += item.earning;
                }
            }
            totalWeeklyEarning += item.earning;
        });
        const prevWeeklyEarning = prevWeeklyData.length ? prevWeeklyData[0].total : 0;
        const weeklyGrowth = prevWeeklyEarning ? ((totalWeeklyEarning - prevWeeklyEarning) / prevWeeklyEarning) * 100 : (totalWeeklyEarning > 0 ? 100 : 0);

        // Monthly
        const monthlyTotalData = await Order.aggregate([
            ...buildPipeline(startOfYear, endOfYear),
            { $group: { _id: { month: { $month: "$createdAt" }, method: "$paymentMethod" }, totalAmount: { $sum: "$totalAmount" }, earning: { $sum: "$sellerAmount" } } }
        ]);
        const prevMonthlyData = await Order.aggregate([
            ...buildPipeline(startOfPrevYear, endOfPrevYear),
            { $group: { _id: null, total: { $sum: "$sellerAmount" } } }
        ]);

        const monthlyValues = Array(12).fill(0);
        const monthlyTotalAmtValues = Array(12).fill(0);
        const monthlyEarningValues = Array(12).fill(0);
        const monthlyCodValues = Array(12).fill(0);
        const monthlyStripeValues = Array(12).fill(0);
        let totalMonthlyEarning = 0;

        monthlyTotalData.forEach(item => {
            if(item._id.month >= 1 && item._id.month <= 12) {
                monthlyTotalAmtValues[item._id.month - 1] += item.totalAmount;
                monthlyEarningValues[item._id.month - 1] += item.earning;
                monthlyValues[item._id.month - 1] += item.earning;
                if (item._id.method === 'COD') {
                    monthlyCodValues[item._id.month - 1] += item.earning;
                } else {
                    monthlyStripeValues[item._id.month - 1] += item.earning;
                }
            }
            totalMonthlyEarning += item.earning;
        });
        const prevMonthlyEarning = prevMonthlyData.length ? prevMonthlyData[0].total : 0;
        const monthlyGrowth = prevMonthlyEarning ? ((totalMonthlyEarning - prevMonthlyEarning) / prevMonthlyEarning) * 100 : (totalMonthlyEarning > 0 ? 100 : 0);

        // Yearly
        const yearlyTotalData = await Order.aggregate([
            ...buildPipeline(startOf5Years, endOfYear),
            { $group: { _id: { year: { $year: "$createdAt" }, method: "$paymentMethod" }, totalAmount: { $sum: "$totalAmount" }, earning: { $sum: "$sellerAmount" } } }
        ]);
        const prevYearlyData = await Order.aggregate([
            ...buildPipeline(startOfPrev5Years, endOfPrev5Years),
            { $group: { _id: null, total: { $sum: "$sellerAmount" } } }
        ]);

        const yearlyCategories = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
        const yearlyValues = Array(5).fill(0);
        const yearlyTotalAmtValues = Array(5).fill(0);
        const yearlyEarningValues = Array(5).fill(0);
        const yearlyCodValues = Array(5).fill(0);
        const yearlyStripeValues = Array(5).fill(0);
        let totalYearlyEarning = 0;
        
        yearlyTotalData.forEach(item => {
            const index = yearlyCategories.indexOf(item._id.year);
            if (index !== -1) {
                yearlyTotalAmtValues[index] += item.totalAmount;
                yearlyEarningValues[index] += item.earning;
                yearlyValues[index] += item.earning;
                if (item._id.method === 'COD') {
                    yearlyCodValues[index] += item.earning;
                } else {
                    yearlyStripeValues[index] += item.earning;
                }
            }
            totalYearlyEarning += item.earning;
        });
        const prevYearlyEarning = prevYearlyData.length ? prevYearlyData[0].total : 0;
        const yearlyGrowth = prevYearlyEarning ? ((totalYearlyEarning - prevYearlyEarning) / prevYearlyEarning) * 100 : (totalYearlyEarning > 0 ? 100 : 0);

        const responseData = {
            Weekly: {
                categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                series: weeklyValues,
                totalAmountSeries: weeklyTotalAmtValues,
                earningSeries: weeklyEarningValues,
                codSeries: weeklyCodValues,
                stripeSeries: weeklyStripeValues,
                total: totalWeeklyEarning,
                growth: weeklyGrowth
            },
            Monthly: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                series: monthlyValues,
                totalAmountSeries: monthlyTotalAmtValues,
                earningSeries: monthlyEarningValues,
                codSeries: monthlyCodValues,
                stripeSeries: monthlyStripeValues,
                total: totalMonthlyEarning,
                growth: monthlyGrowth
            },
            Yearly: {
                categories: yearlyCategories.map(String),
                series: yearlyValues,
                totalAmountSeries: yearlyTotalAmtValues,
                earningSeries: yearlyEarningValues,
                codSeries: yearlyCodValues,
                stripeSeries: yearlyStripeValues,
                total: totalYearlyEarning,
                growth: yearlyGrowth
            }
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error("getSellerRevenueAnalytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
