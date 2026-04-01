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
            { $match: { createdAt: { $gte: startOfWeek, $lte: endOfWeek }, status: 'completed' } },
            { $group: { _id: { $dayOfWeek: "$createdAt" }, revenue: { $sum: "$amount" } } }
        ]);
        const prevWeeklyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfPrevWeek, $lte: endOfPrevWeek }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const weeklyValues = Array(7).fill(0);
        let totalWeeklyRevenue = 0;
        weeklyData.forEach(item => {
            const dayIndex = item._id === 1 ? 6 : item._id - 2; 
            if(dayIndex >= 0 && dayIndex < 7) {
                weeklyValues[dayIndex] = item.revenue;
            }
            totalWeeklyRevenue += item.revenue;
        });
        const prevWeeklyRevenue = prevWeeklyData.length ? prevWeeklyData[0].total : 0;
        const weeklyGrowth = prevWeeklyRevenue ? ((totalWeeklyRevenue - prevWeeklyRevenue) / prevWeeklyRevenue) * 100 : 100;

        // Aggregation for Monthly
        const monthlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear }, status: 'completed' } },
            { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$amount" } } }
        ]);
        const prevMonthlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfPrevYear, $lte: endOfPrevYear }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const monthlyValues = Array(12).fill(0);
        let totalMonthlyRevenue = 0;
        monthlyData.forEach(item => {
            if(item._id >= 1 && item._id <= 12) {
                monthlyValues[item._id - 1] = item.revenue;
            }
            totalMonthlyRevenue += item.revenue;
        });
        const prevMonthlyRevenue = prevMonthlyData.length ? prevMonthlyData[0].total : 0;
        const monthlyGrowth = prevMonthlyRevenue ? ((totalMonthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100 : 100;

        // Aggregation for Yearly
        const yearlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOf5Years, $lte: endOfYear }, status: 'completed' } },
            { $group: { _id: { $year: "$createdAt" }, revenue: { $sum: "$amount" } } }
        ]);
        const prevYearlyData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfPrev5Years, $lte: endOfPrev5Years }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const yearlyCategories = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
        const yearlyValues = Array(5).fill(0);
        let totalYearlyRevenue = 0;
        yearlyData.forEach(item => {
            const index = yearlyCategories.indexOf(item._id);
            if (index !== -1) {
                yearlyValues[index] = item.revenue;
            }
            totalYearlyRevenue += item.revenue;
        });
        const prevYearlyRevenue = prevYearlyData.length ? prevYearlyData[0].total : 0;
        const yearlyGrowth = prevYearlyRevenue ? ((totalYearlyRevenue - prevYearlyRevenue) / prevYearlyRevenue) * 100 : 100;

        const responseData = {
            Weekly: {
                categories: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                series: weeklyValues,
                total: totalWeeklyRevenue,
                growth: weeklyGrowth
            },
            Monthly: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                series: monthlyValues,
                total: totalMonthlyRevenue,
                growth: monthlyGrowth
            },
            Yearly: {
                categories: yearlyCategories.map(String),
                series: yearlyValues,
                total: totalYearlyRevenue,
                growth: yearlyGrowth
            }
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error("getRevenueAnalytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
