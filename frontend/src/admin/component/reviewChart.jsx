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
                        <div key={starIndex} className="relative inline-block text-xl md:text-2xl">
                            {/* Background (Empty) Star */}
                            <AiFillStar className="text-gray-200" />

                            {/* Foreground (Filled) Star with Clipping */}
                            <div
                                className="absolute top-0 left-0 overflow-hidden h-full"
                                style={{ width: `${fillAmount}%` }}
                            >
                                <AiFillStar className="text-orange-400" />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const ratingRows = [5, 4, 3, 2, 1];

    return (
        <div className="w-full bg-white rounded-xl border border-emerald-50 p-6 md:p-8 shadow-sm animate-fadeIn">
            {/* Header: Average Rating */}
            <div className="flex items-center gap-3 mb-8">
                {renderStars(averageRating)}
                <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-xl font-bold text-[#2E7D32]">{displayAverage}</span>
                    <span className="text-gray-400 font-medium">({totalReviews})</span>
                </div>
            </div>

            {/* Distribution Rows */}
            <div className="space-y-4">
                {ratingRows.map((star) => {
                    const count = ratingCounts[star];
                    const percentage = getPercentage(count);

                    return (
                        <div key={star} className="flex items-center gap-4 group">
                            {/* Label */}
                            <div className="text-sm font-semibold text-gray-600 w-12 flex-shrink-0">
                                {star} star
                            </div>

                            {/* Progress Bar Container */}
                            <div className="flex-1 h-5 bg-emerald-50/20 border border-emerald-100/50 rounded-lg overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00B880] to-[#2E7D32] transition-all duration-1000 ease-out rounded-sm"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>

                            {/* Percentage */}
                            <div className="text-sm font-bold text-gray-500 w-10 text-right flex-shrink-0">
                                {percentage}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewChart;

