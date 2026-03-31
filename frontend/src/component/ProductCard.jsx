import React from 'react';
import { AiFillStar, AiOutlineHeart, AiOutlineShoppingCart, AiOutlineEye, AiFillHeart } from "react-icons/ai";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';
import { addToCart } from '../redux/slice/cart.slice';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { wishlist } = useSelector((state) => state.wishlist);
    const wishlistItems = wishlist?.items || [];

    const isInWishlist = wishlistItems.some(wish => {
        const wishProductId = typeof wish.productId === 'object' ? wish.productId?._id : wish.productId;
        return wishProductId === product._id;
    });

    const handleWishlistToggle = (e) => {
        e.stopPropagation();
        if (isInWishlist) {
            dispatch(removeFromWishlist(product._id));
        } else {
            dispatch(addToWishlist(product._id));
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        dispatch(addToCart({
            productId: product._id,
            variantId: variant?._id,
            quantity: 1
        }));
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        navigate(`/product-details/${product._id}`);
    };

    const image = product.images?.[0]?.url || product.image;
    const hoverImage = product.images?.[1]?.url || product.hoverImage;
    const title = product.name || product.title;
    const variant = product.weighstWise?.find(v => v.stock > 0) || product.weighstWise?.[0];
    const isOutOfStock = variant?.stock === 0;
    const initialPrice = variant?.price || 0;
    const currentPrice = variant?.discountPrice || initialPrice;

    const brand = product.category?.categoryName || product.brand || 'Grocery';
    const rating = product.avgRating || product.rating || 0;
    const discount = product.offer?.offer_value || null;

    // Condition to show original price: only if currentPrice is different from initialPrice
    const hasDiscount = currentPrice < initialPrice;
    const originalPriceDisplay = `$${initialPrice}`;
    const currentPriceDisplay = `$${currentPrice}`;

    return (
        <div
            onClick={() => navigate(`/product-details/${product._id}`)}
            className="group relative bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 hover:border-[var(--primary)] hover:shadow-xl hover:shadow-green-50/50"
        >
            {/* Badges */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-2">
                {discount && !isOutOfStock && (
                    <span className="bg-[#FF4F4F] text-white text-[9px] sm:text-[12px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        -{product.offer?.offer_type === "Fixed" ? `$${discount}` : `${discount}%`}
                    </span>
                )}
                {isOutOfStock && (
                    <span className="bg-red-500 text-white text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                        Out of Stock
                    </span>
                )}
            </div>

            {/* Product Image */}
            <div className="h-36 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden relative">
                <img
                    src={image}
                    alt={title}
                    className={`max-w-full max-h-full object-contain transition-all duration-500 ${isOutOfStock ? '' : ''} ${hoverImage && !isOutOfStock ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-110'}`}
                />
                {hoverImage && !isOutOfStock && (
                    <img
                        src={hoverImage}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-contain transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                    />
                )}

                {/* Icons Overlay */}
                <div className="absolute top-0 right-0 flex flex-col gap-2 transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                    <button
                        title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all transform active:scale-90 ${isInWishlist
                            ? 'text-red-500 hover:bg-red-500 hover:text-white'
                            : 'text-gray-500 hover:bg-[var(--primary)] hover:text-white'
                            }`}
                        onClick={handleWishlistToggle}
                    >
                        {isInWishlist ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                    </button>
                    <button
                        title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        disabled={isOutOfStock}
                        className={`w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all transform active:scale-90 ${isOutOfStock
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-[var(--primary)] hover:text-white'
                            }`}
                        onClick={handleAddToCart}
                    >
                        <AiOutlineShoppingCart size={18} />
                    </button>
                    <button
                        title="Quick View"
                        className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition-all transform active:scale-90"
                        onClick={handleQuickView}
                    >
                        <AiOutlineEye size={18} />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-grow space-y-1 sm:space-y-2">
                <span className="text-[10px] sm:text-sm text-[#8D949C] capitalize tracking-wider font-medium">
                    {brand}
                </span>

                <h3 className="text-sm sm:text-base font-semibold text-[#31353C] leading-tight line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                    {title}
                </h3>

                <div className="flex items-center gap-0.5 sm:gap-1">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <AiFillStar
                                key={i}
                                className={`text-[10px] sm:text-base ${i < Math.round(rating) ? "text-[#FFB81C]" : "text-[#E6E8EA]"}`}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
                </div>

                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto">
                    <span className="text-sm sm:text-base font-semibold text-[var(--primary)]">
                        {currentPriceDisplay}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs sm:text-base text-[#A2A9B1] line-through font-medium">
                            {originalPriceDisplay}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
