import React from 'react';
import { FiX, FiMessageSquare } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';

const ReviewDrawer = ({ isOpen, onClose, reviews, productName, onImageClick }) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[1001] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
                        <p className="text-sm text-gray-500 truncate max-w-[280px]">{productName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <FiX className="text-2xl text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Reviews List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar no-scrollbar">
                    {reviews?.map((review, i) => (
                        <div key={i} className="flex gap-2 sm:gap-4 pb-3 border-b border-gray-100 last:border-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-emerald-100 bg-emerald-50 flex items-center justify-center text-[#2E7D32] font-bold text-lg shadow-sm">
                                {review.user?.photo?.url ? (
                                    <img src={review.user.photo.url} alt={review.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    review.user?.name ? (
                                        review.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                    ) : (
                                        'U'
                                    )
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold text-[#1F2937] text-base">{review.user?.name}</h4>
                                <div className="flex items-center gap-1 py-1 text-base sm:text-lg">
                                    {[...Array(5)].map((_, index) => (
                                        <AiFillStar
                                            key={index}
                                            className={index < review.rating ? "text-orange-400" : "text-gray-200"}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                                    {review.comment}
                                </p>
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                                        {review.images.map((img, idx) => (
                                            <div 
                                                key={idx} 
                                                className="w-10 h-10 sm:w-16 sm:h-16 rounded-md overflow-hidden border border-gray-100 flex-shrink-0 cursor-pointer hover:border-[var(--primary)] transition-all"
                                                onClick={() => onImageClick(img.url || img)}
                                            >
                                                <img src={img.url || img} alt="Review" className="w-full h-full object-cover shadow-sm" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!reviews || reviews.length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-60">
                            <FiMessageSquare size={48} />
                            <p className="font-medium">No reviews found</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-all active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
};

export default ReviewDrawer;
