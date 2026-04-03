import React, { useState, useEffect } from 'react';
import { X, Star, Camera, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview } from '../redux/slice/review.slice';

const ReviewModal = ({ isOpen, onClose, product: initialProduct }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.review);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (initialProduct && !Array.isArray(initialProduct)) {
                setSelectedProduct(initialProduct);
            } else {
                setSelectedProduct(null);
            }
            // Reset form when opening
            setRating(0);
            setHover(0);
            setComment('');
            setImages([]);
            setPreviews([]);
        }
    }, [initialProduct, isOpen]);

    if (!isOpen || !initialProduct) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        const formData = new FormData();
        formData.append('productId', selectedProduct._id || selectedProduct.id);
        formData.append('rating', rating);
        formData.append('comment', comment);
        images.forEach(image => {
            formData.append('images', image);
        });

        const resultAction = await dispatch(createReview(formData));
        if (createReview.fulfilled.match(resultAction)) {
            // If we came from a list, go back to the list
            if (Array.isArray(initialProduct) && initialProduct.length > 1) {
                setSelectedProduct(null);
                setRating(0);
                setComment('');
                setImages([]);
                setPreviews([]);
            } else {
                onClose();
            }
        }
    };

    // Selection View
    if (Array.isArray(initialProduct) && !selectedProduct) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div
                    className="bg-white rounded-md w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">Select Product to Rate</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {initialProduct.map((item, index) => {
                            const p = item.productId || {};
                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedProduct(p)}
                                    className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 cursor-pointer transition-colors group"
                                >
                                    <div className="w-14 h-14 rounded-md overflow-hidden border border-white shrink-0 shadow-sm">
                                        <img
                                            src={p.images?.[0]?.url || p.image || 'https://via.placeholder.com/150'}
                                            alt={p.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate text-sm">{p.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            {item.selectedVariant?.weight} {item.selectedVariant?.unit}
                                        </p>
                                    </div>
                                    <button className="px-4 py-1.5 bg-white text-[var(--primary)] border border-[var(--primary)] text-xs font-bold rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors">
                                        Rate
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedProduct) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="bg-white rounded-md w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {Array.isArray(initialProduct) && initialProduct.length > 1 && (
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 mr-1"
                                title="Back to product list"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                        )}
                        <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-md border border-gray-100">
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-white shrink-0">
                            <img
                                src={selectedProduct.images?.[0]?.url || selectedProduct.image || 'https://via.placeholder.com/150'}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{selectedProduct.name || selectedProduct.title}</h4>
                            <p className="text-xs text-gray-500">Rate this product</p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${(hover || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                            {rating === 0 ? 'Select Rating' :
                                rating === 1 ? 'Terrible' :
                                    rating === 2 ? 'Poor' :
                                        rating === 3 ? 'Fair' :
                                            rating === 4 ? 'Good' : 'Excellent'}
                        </span>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)] outline-none transition-all resize-none h-32 text-gray-600"
                            placeholder="Share your experience with this product..."
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Add Photos (Optional)
                        </label>

                        <div className="flex flex-wrap gap-3">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-100 group">
                                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3 text-red-500" />
                                    </button>
                                </div>
                            ))}

                            {previews.length < 5 && (
                                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all">
                                    <Camera className="w-6 h-6 text-gray-400" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-md border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-md font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
