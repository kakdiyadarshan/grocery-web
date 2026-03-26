import React, { useState, useEffect } from 'react';
import { MdKeyboardArrowRight, MdVisibility, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { AiOutlineHeart, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoIosGitCompare } from "react-icons/io";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, getAllProducts } from '../redux/slice/product.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { addToWishlist } from '../redux/slice/wishlist.slice';

import NewsletterImage from '../Image/newsletter.png';

function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, products, loading } = useSelector(state => state.product);

    useEffect(() => {
        if (id) {
            dispatch(getProductById(id));
        }
        if (products.length === 0) {
            dispatch(getAllProducts());
        }
    }, [id, dispatch]);

    const images = product?.images?.map(img => img.url) || [];
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [startIndex, setStartIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        if (product?.images?.length > 0) {
            setSelectedImage(product.images[0].url);
        }
    }, [product]);

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (product) {
            dispatch(addToCart({ productId: product._id, quantity }));
        }
    };

    const handleAddToWishlist = () => {
        if (product) {
            dispatch(addToWishlist(product._id));
        }
    };

    if (loading && !product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* ===== Breadcrumbs ===== */}
            <div className="bg-[#f0f5f3] shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8 flex items-center flex-wrap gap-1 text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                    <span className="cursor-pointer hover:text-green-600 transition">Home</span>
                    <MdKeyboardArrowRight className="text-xl" />
                    <span className="cursor-pointer hover:text-green-600 transition">{product.category?.categoryName || 'Category'}</span>
                    <MdKeyboardArrowRight className="text-xl" />
                    <span className="text-gray-400 truncate max-w-[150px] xs:max-w-none">
                        {product.name}
                    </span>
                </div>
            </div>

            {/* ===== Main Container ===== */}
            <div className="max-w-[1440px] mx-auto px-4 py-8">

                {/* Product Details */}
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* LEFT: Gallery Section */}
                    <div className="flex flex-col-reverse md:flex-row gap-6 lg:w-3/5">
                        {/* Vertical Thumbnails */}
                        <div className="flex md:flex-col items-center gap-3 py-2">
                            <button
                                onClick={() => setStartIndex(prev => Math.max(0, prev - 1))}
                                disabled={startIndex === 0}
                                className={`hidden md:flex items-center justify-center w-full px-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition ${startIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <MdKeyboardArrowUp className="text-2xl" />
                            </button>

                            <div className="hidden md:block overflow-hidden h-[420px]">
                                <div
                                    className="flex flex-col gap-3 transition-transform duration-300 ease-in-out"
                                    style={{ transform: `translateY(-${startIndex * 108}px)` }}
                                >
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImage(img)}
                                            className={`w-24 h-24 p-1 rounded-lg border cursor-pointer transition-all flex-shrink-0 flex items-center justify-center bg-gray-50 overflow-hidden ${selectedImage === img ? 'border-[#00B880]' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <img src={img} alt={`Product ${index}`} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Thumbnails (Horizontal Scroll) */}
                            <div className="flex md:hidden gap-3 overflow-x-auto py-2 w-full">
                                {images.map((img, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-20 h-20 p-1 rounded-lg border cursor-pointer transition-all flex-shrink-0 flex items-center justify-center bg-gray-50 overflow-hidden ${selectedImage === img ? 'border-[#00B880]' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt={`Product ${index}`} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStartIndex(prev => Math.min(images.length - 4, prev + 1))}
                                disabled={startIndex >= images.length - 4}
                                className={`hidden md:flex items-center justify-center w-full px-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition ${startIndex >= images.length - 4 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <MdKeyboardArrowDown className="text-2xl" />
                            </button>
                        </div>

                        {/* Main Product Image */}
                        <div className="flex-1 flex items-center justify-center bg-transparent p-4 min-h-[400px] border rounded-lg border-gray-200">
                            <img src={selectedImage} alt="Main Product" className="max-w-full max-h-[500px] object-contain transition-all duration-300" />
                        </div>
                    </div>

                    {/* RIGHT: Product Details Section */}
                    <div className="lg:w-2/5 space-y-3">
                        {/* Title */}
                        <h1 className="text-xl md:text-2xl font-semibold text-[#1F2937]">
                            {product.name}
                        </h1>

                        {/* Star Rating */}
                        <div className="flex items-center gap-3">
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <AiFillStar
                                        key={i}
                                        className={`text-base sm:text-lg ${i < (product.reviews?.length > 0 ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 4) ? "text-[#FFB81C]" : "text-[#D3D3D3]"}`}
                                    />
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="w-px h-4 bg-gray-300"></div>

                            {/* Rating Count */}
                            <span className="text-xs sm:text-sm text-gray-500">
                                {product.reviews?.length || 0} Ratings
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {/* Discounted Price */}
                                <span className="text-2xl md:text-3xl font-bold text-[#00B880]">
                                    ₹{product.discountPrice || (product.weighstWise?.[0]?.price || 0)}
                                </span>

                                {/* Original Price */}
                                {product.discountPrice && (
                                    <span className="text-sm md:text-base text-gray-400 line-through">
                                        ₹{product.weighstWise?.[0]?.price}
                                    </span>
                                )}

                                {/* Discount Badge */}
                                {product.discountPrice && (
                                    <span className="text-xs md:text-sm font-medium text-red-500 bg-[#FFF1F1] px-2 py-1 rounded-md border border-[#FFE4E4]">
                                        {Math.round(((product.weighstWise[0].price - product.discountPrice) / product.weighstWise[0].price) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Wishlist & Compare Section */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAddToWishlist}
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-white hover:border-[#00B880] hover:text-[#00B880] transition-all duration-300 shadow-sm group"
                                >
                                    <AiOutlineHeart className="text-xl text-gray-400 group-hover:text-[#00B880]" />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-[#6B7280] leading-relaxed text-sm md:text-base mt-4">
                            {product.description}
                        </p>

                        {/* Metadata */}
                        <div className="mt-8 space-y-3 pt-4 border-t border-gray-100">
                            <p className="text-base font-semibold text-[#333333]">SKU: <span className="font-normal text-gray-500 ml-2">AF-001-{product._id?.slice(-4)}</span></p>
                            <p className="text-base font-semibold text-[#333333]">Category: <span className="font-normal text-gray-500 ml-2">{product.category?.categoryName}</span></p>
                        </div>

                        {/* Quantity & Stock Status */}
                        <div className="flex items-center gap-4 mt-6">
                            <span className="text-base font-semibold text-[#333333]">Quantity:</span>
                            <span className="bg-[#2E7D32] text-white px-3 py-1 rounded text-sm font-semibold">
                                In Stock
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center bg-[#F3F4F6] rounded-md w-32 h-10 mt-4 overflow-hidden">
                            <button onClick={decrementQuantity} className="flex-1 flex items-center justify-center text-gray-500 hover:text-black transition">
                                <FiMinus className="text-xl" />
                            </button>
                            <span className="flex-1 flex items-center justify-center font-semibold text-gray-800 text-lg">
                                {quantity}
                            </span>
                            <button onClick={incrementQuantity} className="flex-1 flex items-center justify-center text-gray-500 hover:text-black transition">
                                <FiPlus className="text-xl" />
                            </button>
                        </div>

                        {/* Subtotal */}
                        <div className="flex items-center gap-2 mt-6">
                            <span className="text-base font-semibold text-[#333333]">Subtotal:</span>
                            <span className="text-gray-500 text-base">₹{(quantity * (product.discountPrice || (product.weighstWise?.[0]?.price || 0))).toFixed(2)}</span>
                        </div>

                        {/* Size Selection */}
                        <div className="flex items-center gap-4 mt-6">
                            <span className="text-base font-semibold text-[#333333]">Size:</span>
                            <div className="flex gap-3">
                                {['500g', '01 Kg', '02 Kg'].map((size) => (
                                    <button
                                        key={size}
                                        className={`px-4 py-1 border rounded-md text-sm sm:text-base font-semibold transition ${size === '500g' ? 'border-black text-black bg-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                            <button
                                onClick={handleAddToCart}
                                className="w-full sm:flex-1 h-12 bg-[#EEEEEE] hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded text-[#333333] font-semibold text-lg"
                            >
                                <FiShoppingCart className="text-xl" />
                                Add to cart
                            </button>
                            <button className="w-full sm:flex-1 h-12 bg-[#333333] hover:bg-black transition-colors flex items-center justify-center text-white font-semibold text-lg rounded">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-16 pt-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200 pb-7">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${activeTab === 'description' ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${activeTab === 'reviews' ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}
                        >
                            Reviews
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl">
                        {activeTab === 'description' ? (
                            // Description Content
                            <div className="space-y-5 animate-fadeIn">
                                <div className='space-y-4'>
                                    <h3 className="text-2xl font-semibold text-[#333333] mb-4">About This Product</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        Dragon fruit needs full sun, so choose a sunny area in your garden or a sunny windowsill that gets at least six hours of sunlight a day. For the soil, choose potting soil that is well-draining (dragon fruits are sensitive to “wet feet,” or consistently wet roots) and rich in organic matter.
                                    </p>
                                    <p className="text-gray-500 leading-relaxed">
                                        Dragon fruits are oval to oblong in shape and size, with pink peel and green scale-like leaves. It is named after its resemblance to dragon scales. White flesh is dotted with black, tiny edible seeds. It has juicy and spongy flesh with sweet flavour and a hint of sourness. Fresho dragon fruits are sourced from Thailand.
                                    </p>
                                </div>

                                <div className='space-y-2'>
                                    <h4 className="text-2xl font-semibold text-[#333333] mb-4">Benefits</h4>

                                    <ul className="list-disc pl-5 space-y-2 text-gray-500 leading-relaxed">
                                        <li>
                                            Carrots provide the highest content of vitamin A of all the vegetables.
                                        </li>
                                        <li>
                                            Brightly orange colored carrots have pigments like carotenoids and flavonoids, that provide several antioxidants and act as a defense against cancer.
                                        </li>
                                    </ul>
                                </div>

                                <div className='space-y-2'>
                                    <h4 className="text-2xl font-semibold text-[#333333] mb-4">Storage Tips</h4>

                                    <ul className="list-disc pl-5 space-y-2 text-gray-500 leading-relaxed">
                                        <li>
                                            Refrigerate carrots in a mesh bag.
                                        </li>
                                        <li>
                                            Alternatively, trim off the greens and store carrots in water to keep them fresh and crunchy for longer.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            // Reviews Content
                            <div className="animate-fadeIn">
                                <div className="space-y-10 mb-2">
                                    {[
                                        {
                                            name: "Mariya Lykra",
                                            rating: 4,
                                            comment: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen.",
                                            avatar: "https://ui-avatars.com/api/?name=Mariya+Lykra&background=random"
                                        },
                                        {
                                            name: "Moris Willson",
                                            rating: 3,
                                            comment: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen.",
                                            avatar: "https://ui-avatars.com/api/?name=Moris+Willson&background=random"
                                        }
                                    ].map((review, i) => (
                                        <div key={i} className="flex gap-4 pb-8 border-b border-gray-100 last:border-0">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-[#1F2937] text-base">{review.name}</h4>
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
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add a Review Form */}
                                <div className="pt-4 border-t border-gray-200 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-semibold text-[#333333]">Add a Review</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500">Your rating:</span>
                                            <div className="flex items-center gap-1 text-orange-400 text-base sm:text-lg">
                                                <AiFillStar className="" />
                                                <AiFillStar className="" />
                                                <AiOutlineStar className=" text-gray-200" />
                                                <AiOutlineStar className=" text-gray-200" />
                                                <AiOutlineStar className=" text-gray-200" />
                                            </div>
                                        </div>
                                    </div>

                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:border-[#00B880] text-gray-600 placeholder:text-gray-400 transition"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email*"
                                                className="w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-none focus:border-[#00B880] text-gray-600 placeholder:text-gray-400 transition"
                                            />
                                            <textarea
                                                placeholder="Enter Your Comment"
                                                rows="6"
                                                className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-[#00B880] text-gray-600 placeholder:text-gray-400 transition resize-none"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-8 h-10 bg-[#00B880] hover:bg-[#009A6A] text-white font-semibold rounded-md transition-colors shadow-sm"
                                        >
                                            Submit
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <div className='mt-8 pt-4'>
                    <h2 className="text-3xl font-semibold text-[#31353C] mb-8 border-b border-gray-200 pb-5">Related Products</h2>

                    <div className="grid grid-cols-1 min-[425px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                        {products
                            .filter(p => p._id !== id && p.category?._id === product.category?._id)
                            .slice(0, 5)
                            .map((p) => (
                                <div key={p._id} className="group relative bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 hover:border-[#38b47e] hover:shadow-xl hover:shadow-green-50/50">
                                    {/* Discount Badge */}
                                    {p.discountPrice && (
                                        <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#FF4F4F] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                            -{Math.round(((p.weighstWise[0].price - p.discountPrice) / p.weighstWise[0].price) * 100)}%
                                        </span>
                                    )}

                                    {/* Product Image */}
                                    <div className="h-28 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                                        <img
                                            src={p.images?.[0]?.url || 'https://via.placeholder.com/400'}
                                            alt={p.name}
                                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex flex-col flex-grow space-y-1 sm:space-y-2">
                                        <span className="text-[10px] sm:text-sm text-[#8D949C] uppercase tracking-wider font-medium">
                                            {p.category?.categoryName}
                                        </span>

                                        <Link to={`/product-details/${p._id}`} onClick={() => window.scrollTo(0, 0)}>
                                            <h3 className="text-sm sm:text-base font-semibold text-[#31353C] leading-tight line-clamp-1 group-hover:text-[#38b47e] transition-colors">
                                                {p.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <AiFillStar
                                                    key={i}
                                                    className={`text-[10px] sm:text-base ${i < 4 ? "text-[#FFB81C]" : "text-[#E6E8EA]"}`}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto">
                                            <span className="text-sm sm:text-base font-semibold text-[#00B880]">
                                                ₹{p.discountPrice || p.weighstWise?.[0]?.price}
                                            </span>
                                            {p.discountPrice && (
                                                <span className="text-xs sm:text-base text-[#A2A9B1] line-through font-medium">
                                                    ₹{p.weighstWise?.[0]?.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vertical Action Buttons (Hover) */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); dispatch(addToWishlist(p._id)); }}
                                            className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#38b47e] hover:text-white transition-all shadow-sm"
                                        >
                                            <AiOutlineHeart size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); dispatch(addToCart({ productId: p._id, quantity: 1 })); }}
                                            className="w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#38b47e] hover:text-white transition-all shadow-sm"
                                        >
                                            <FiShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Newsletter */}
                <div className="w-full py-6 mt-10">
                    <div
                        className="relative overflow-hidden rounded-md bg-[#DDEEE5] bg-no-repeat bg-cover bg-center sm:bg-right min-h-[380px] flex items-center"
                        style={{ backgroundImage: `url(${NewsletterImage})` }}
                    >
                        <div className="relative z-10 p-6 md:p-10 lg:p-20 w-full lg:w-1/2">
                            {/* LEFT CONTENT */}
                            <div className="text-left">
                                {/* Title */}
                                <h2 className="text-[#253D4E] text-2xl sm:text-3xl font-medium leading-tight">
                                    Stay Home & Get Your Daily <br className="hidden sm:block" />
                                    Needs From Our Shop
                                </h2>

                                {/* Description */}
                                <p className="text-[#7E7E7E] mt-4 text-sm">
                                    Subscribe to our latest newsletter to get news about special discounts.
                                </p>

                                {/* Input + Button */}
                                <form className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-0 w-full max-w-md mx-auto md:mx-0 " onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="flex-grow px-5 py-3 sm:py-4 rounded-md sm:rounded-none sm:rounded-l-md focus:outline-none text-[var(--text-secondary)] w-full border-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className=" cursor-pointer  bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition duration-300 text-[var(--btn-text)] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-md sm:rounded-none sm:rounded-r-md whitespace-nowrap"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProductDetail;
