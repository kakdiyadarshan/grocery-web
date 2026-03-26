import React from 'react';
import { AiFillStar, AiOutlineHeart, AiOutlineShoppingCart, AiOutlineEye } from "react-icons/ai";

const ProductCard = ({ product }) => (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 hover:border-[#38b47e] hover:shadow-xl hover:shadow-green-50/50">
        {/* Discount Badge */}
        {product.discount && (
            <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#FF4F4F] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                {product.discount}
            </span>
        )}

        {/* Product Image */}
        <div className="h-36 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden relative">
            <img
                src={product.image}
                alt={product.title}
                className={`max-w-full max-h-full object-contain transition-all duration-500 ${product.hoverImage ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-110'}`}
            />
            {product.hoverImage && (
                <img
                    src={product.hoverImage}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                />
            )}

            {/* Icons Overlay */}
            <div className="absolute top-0 right-0 flex flex-col gap-2 transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                <button
                    title="Add to Wishlist"
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:bg-[#38b47e] hover:text-white transition-all transform active:scale-90"
                    onClick={(e) => { e.stopPropagation(); console.log('Wishlist'); }}
                >
                    <AiOutlineHeart size={18} />
                </button>
                <button
                    title="Add to Cart"
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:bg-[#38b47e] hover:text-white transition-all transform active:scale-90"
                    onClick={(e) => { e.stopPropagation(); console.log('Cart'); }}
                >
                    <AiOutlineShoppingCart size={18} />
                </button>
                <button
                    title="Quick View"
                    className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:bg-[#38b47e] hover:text-white transition-all transform active:scale-90"
                    onClick={(e) => { e.stopPropagation(); console.log('Quick View'); }}
                >
                    <AiOutlineEye size={18} />
                </button>
            </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-grow space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-sm text-[#8D949C] uppercase tracking-wider font-medium">
                {product.brand}
            </span>

            <h3 className="text-sm sm:text-base font-semibold text-[#31353C] leading-tight line-clamp-1 group-hover:text-[#38b47e] transition-colors">
                {product.title}
            </h3>

            <div className="flex items-center gap-0.5 sm:gap-1">
                {[...Array(5)].map((_, i) => (
                    <AiFillStar
                        key={i}
                        className={`text-[10px] sm:text-base ${i < product.rating ? "text-[#FFB81C]" : "text-[#E6E8EA]"}`}
                    />
                ))}
            </div>

            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto">
                <span className="text-sm sm:text-base font-semibold text-[#00B880]">
                    {product.price}
                </span>
                {product.originalPrice && (
                    <span className="text-xs sm:text-base text-[#A2A9B1] line-through font-medium">
                        {product.originalPrice}
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default ProductCard;
