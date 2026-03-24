import React, { useState } from 'react';
import { MdKeyboardArrowRight, MdVisibility, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { AiOutlineHeart, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoIosGitCompare } from "react-icons/io";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import image1 from '../Image/02_4f606a6b-57e8-4991-8605-fa3ba641c0c0.webp';
import image2 from '../Image/03_5f4ee6dc-f7e4-4a0a-b988-d9b893ead0a0.webp';
import image3 from '../Image/04_26183b2f-eb65-48de-b9c1-ac376c5b9e37.webp';
import image4 from '../Image/05_aa60bf65-3569-4105-8cd6-c4c0274d7dab.webp';
import image5 from '../Image/06.webp';
import image6 from '../Image/02_4f606a6b-57e8-4991-8605-fa3ba641c0c0.webp';
import NewsletterImage from '../Image/newsletter.png';

function ProductDetail() {
    const images = [image1, image2, image3, image4, image5, image6];
    const [selectedImage, setSelectedImage] = useState(image1);
    const [quantity, setQuantity] = useState(1);
    const [startIndex, setStartIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="bg-white min-h-screen">
            {/* ===== Breadcrumbs ===== */}
            <div className="bg-[#f0f5f3] shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8 flex items-center flex-wrap gap-1 text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                    <span className="cursor-pointer hover:text-green-600 transition">Home</span>
                    <MdKeyboardArrowRight className="text-xl" />
                    <span className="cursor-pointer hover:text-green-600 transition">Fruits</span>
                    <MdKeyboardArrowRight className="text-xl" />
                    <span className="text-gray-400 truncate max-w-[150px] xs:max-w-none">
                        Fully Juicy Yellow Organic Lemons
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
                            Fully Juicy Yellow Organic Lemons
                        </h1>

                        {/* Star Rating */}
                        <div className="flex items-center gap-3">
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <AiFillStar
                                        key={i}
                                        className="text-[#D3D3D3] text-base sm:text-lg"
                                    />
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="w-px h-4 bg-gray-300"></div>

                            {/* Rating Count */}
                            <span className="text-xs sm:text-sm text-gray-500">
                                992 Ratings
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {/* Discounted Price */}
                                <span className="text-2xl md:text-3xl font-bold text-[#00B880]">
                                    $9.00
                                </span>

                                {/* Original Price */}
                                <span className="text-sm md:text-base text-gray-400 line-through">
                                    $12.00
                                </span>

                                {/* Discount Badge */}
                                <span className="text-xs md:text-sm font-medium text-red-500 bg-[#FFF1F1] px-2 py-1 rounded-md border border-[#FFE4E4]">
                                    25% OFF
                                </span>
                            </div>

                            {/* Wishlist & Compare Section */}
                            <div className="flex items-center gap-3">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-white hover:border-[#00B880] hover:text-[#00B880] transition-all duration-300 shadow-sm group">
                                    <AiOutlineHeart className="text-xl text-gray-400 group-hover:text-[#00B880]" />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-[#6B7280] leading-relaxed text-sm md:text-base mt-4">
                            A popular sweet-tasting root vegetable, Carrots are narrow and cone shaped. They have thick, fleshy, deeply colored root, which grows underground, and feathery green leaves that emerge above the ground.
                        </p>

                        {/* Metadata */}
                        <div className="mt-8 space-y-3 pt-4 border-t border-gray-100">
                            <p className="text-base font-semibold text-[#333333]">SKU: <span className="font-normal text-gray-500 ml-2">AF-001-KT</span></p>
                            <p className="text-base font-semibold text-[#333333]">Category: <span className="font-normal text-gray-500 ml-2">Vegetables</span></p>
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
                            <span className="text-gray-500 text-base">${(quantity * 18).toFixed(2)}</span>
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
                            <button className="w-full sm:flex-1 h-12 bg-[#EEEEEE] hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded text-[#333333] font-semibold text-lg">
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
                <div className="mt-16 border-t border-gray-200 pt-10">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-8">
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

                {/* Related products */}
                <div className='mt-12 border-t border-gray-200 pt-8'>
                    <h2 className="text-3xl font-semibold text-[#31353C] mb-8">Related products</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-7">
                        {[
                            {
                                id: 1,
                                title: "Natural & Delicious Red Beetroot Slices",
                                brand: "Omnilert",
                                image: image1,
                                price: "$19.00",
                                originalPrice: null,
                                discount: null,
                                rating: 4
                            },
                            {
                                id: 2,
                                title: "Curate Mango Mallika Large Premium",
                                brand: "Fruity-Liscious",
                                image: image2,
                                price: "$32.00",
                                originalPrice: "$35.00",
                                discount: "-9%",
                                rating: 4
                            },
                            {
                                id: 3,
                                title: "Soft Drink 7 Up Lemon Flavour Can, 250 ml",
                                brand: "BrightFruit",
                                image: image3,
                                price: "$12.00",
                                originalPrice: null,
                                discount: null,
                                rating: 0
                            },
                            {
                                id: 4,
                                title: "Essence Of Malabar Raw Natural Coconut",
                                brand: "Fruity-Liscious",
                                image: image4,
                                price: "$15.00",
                                originalPrice: null,
                                discount: null,
                                rating: 3
                            },
                            {
                                id: 5,
                                title: "Fresh Standard Quality Babugosha /Nashpati",
                                brand: "Omnilert",
                                image: image5,
                                price: "$36.00",
                                originalPrice: "$40.00",
                                discount: "-10%",
                                rating: 4
                            }
                        ].map((product) => (
                            <div key={product.id} className="group relative bg-white border border-gray-200 rounded-lg p-4 flex flex-col cursor-pointer">
                                {/* Discount Badge */}
                                {product.discount && (
                                    <span className="absolute top-4 left-4 z-10 bg-[#FF4F4F] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                        {product.discount}
                                    </span>
                                )}

                                {/* Product Image */}
                                <div className="h-44 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                                    <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain" />
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-col flex-grow space-y-2">
                                    <span className="text-sm text-[#8D949C]">
                                        {product.brand}
                                    </span>

                                    <h3 className="text-base font-semibold text-[#31353C] leading-tight line-clamp-2">
                                        {product.title}
                                    </h3>

                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <AiFillStar
                                                key={i}
                                                className={`text-base ${i < product.rating ? "text-[#FFB81C]" : "text-[#E6E8EA]"}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-baseline gap-2 mt-auto">
                                        <span className="text-base font-bold text-[#00B880]">
                                            {product.price}
                                        </span>
                                        {product.originalPrice && (
                                            <span className="text-base text-[#A2A9B1] line-through font-medium">
                                                {product.originalPrice}
                                            </span>
                                        )}
                                    </div>
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
                                <div className="mt-8 flex flex-col sm:flex-row items-center w-full bg-white rounded-md overflow-hidden border border-gray-200">

                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full px-5 py-3 text-sm md:text-base outline-none text-gray-600 bg-transparent"
                                    />

                                    <button className="w-full sm:w-auto bg-[#3BB77E] text-white px-4 py-3 text-sm md:text-base">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default ProductDetail;
