import React from 'react';
import { AiFillStar } from "react-icons/ai";

const ReviewChart = ({ reviews = [] }) => {
    // Calculate totals and averages
    const totalReviews = reviews.length;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatingSum = 0;

    reviews.forEach(review => {
        const r = Number(review.rating);
        if (ratingCounts[r] !== undefined) {
            ratingCounts[r]++;
            totalRatingSum += r;
        }
    });

    const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews) : 0;
    const displayAverage = averageRating.toFixed(1);

    // Helper to calculate percentage for bars
    const getPercentage = (count) => {
        if (totalReviews === 0) return 0;
        return Math.round((count / totalReviews) * 100);
    };

    // Helper to render stars with partial fill
    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                    const fillAmount = Math.max(0, Math.min(100, (rating - (starIndex - 1)) * 100));

                    return (
                        <div key={starIndex} className="relative inline-block text-2xl">
                            {/* Background (Empty) Star */}
                            <AiFillStar className="text-gray-200" />

                            {/* Foreground (Filled) Star with Clipping */}
                            <div
                                className="absolute top-0 left-0 overflow-hidden h-full"
                                style={{ width: `${fillAmount}%` }}
                            >
                                <AiFillStar className="text-[#FFB81C]" />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const ratingRows = [5, 4, 3, 2, 1];

    return (
        <div className="w-full bg-white rounded-2xl border border-emerald-50 shadow-sm animate-fadeIn pb-6">
            <div className="">
                {/* Header: Average Rating */}
                <div className="flex gap-3 mb-3">
                    {renderStars(averageRating)}
                    <h2 className="text-md font-bold ">
                        <span className="text-green-600">{displayAverage}</span><span className="text-lighter text-gray-400">({totalReviews})</span>
                    </h2>
                </div>

                {/* <p className="text-gray-500 text-sm mb-6 font-medium">{totalReviews} global ratings</p> */}

                {/* Distribution Rows */}
                <div className="space-y-4">
                    {ratingRows.map((star) => {
                        const count = ratingCounts[star];
                        const percentage = getPercentage(count);

                        return (
                            <div key={star} className="flex items-center gap-1 sm:gap-3 md:gap-4 group">
                                {/* Label */}
                                <button className="text-[#2E7D32] hover:text-[#00B880] hover:underline text-sm font-semibold w-12 text-left whitespace-nowrap transition-colors">
                                    {star} star
                                </button>

                                {/* Progress Bar Container */}
                                <div className="flex-1 h-6 bg-emerald-50/30 border border-emerald-100 rounded-lg overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#00B880] to-[#2E7D32] transition-all duration-700 ease-out rounded-[5px]"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                {/* Percentage */}
                                <button className="text-[#2E7D32] hover:text-[#00B880] hover:underline text-sm font-semibold w-10 text-right transition-colors">
                                    {percentage}%
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReviewChart;
