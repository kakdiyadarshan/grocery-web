import { useState, useEffect, useRef } from 'react';
import { MdKeyboardArrowRight, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { AiOutlineHeart, AiFillStar, AiFillHeart } from "react-icons/ai";
import { FiArrowRight, FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, getAllProducts } from '../redux/slice/product.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { addToWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';
import Newsletter from '../component/Newsletter';
import ProductSlider from '../component/ProductSlider';
import ReviewChart from '../admin/component/reviewChart';
import ReviewDrawer from '../admin/component/ReviewDrawer';

function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product, products, loading } = useSelector(state => state.product);
    const { wishlist } = useSelector((state) => state.wishlist);
    const { cart } = useSelector((state) => state.cart);
    const wishlistItems = wishlist?.items || [];

    const isInWishlist = wishlistItems.some(wish => {
        const wishProductId = typeof wish.productId === 'object' ? wish.productId?._id : wish.productId;
        return wishProductId === product?._id;
    });

    useEffect(() => {
        if (id) {
            dispatch(getProductById(id));
        }
        if (products.length === 0) {
            dispatch(getAllProducts());
        }
    }, [id, dispatch,products.length]);

    const images = product?.images?.map(img => img.url) || [];
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
    const tabsRef = useRef(null);
    const imgRefZoom = useRef(null);

    // ***** Product Image Hover Zoom  *****
    const handleMouseMove = (e) => {
        if (imgRefZoom.current) {
            const { left, top, width, height } = imgRefZoom.current.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            imgRefZoom.current.style.transformOrigin = `${x}% ${y}%`;
        }
    };

    const handleMouseEnter = () => {
        if (imgRefZoom.current) {
            imgRefZoom.current.style.transform = "scale(2)";
        }
    };

    const handleMouseLeave = () => {
        if (imgRefZoom.current) {
            imgRefZoom.current.style.transform = "scale(1)";
            imgRefZoom.current.style.transformOrigin = "center center";
        }
    };

    useEffect(() => {
        // Lock background scroll when drawer is open
        if (isReviewDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isReviewDrawerOpen]);

    const scrollToDescription = () => {
        setActiveTab('description');
        setTimeout(() => {
            tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    useEffect(() => {
        if (product?.images?.length > 0) {
            setSelectedImage(product.images[0].url);
        }
        if (product?.weighstWise?.length > 0) {
            const firstInStock = product.weighstWise.find(v => v.stock > 0);
            setSelectedVariant(firstInStock || product.weighstWise[0]);
            setQuantity(1);
        }
    }, [product]);

    const isOutOfStock = selectedVariant?.stock === 0;

    const incrementQuantity = () => setQuantity(prev => (prev < selectedVariant?.stock ? prev + 1 : prev));
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (product && !isOutOfStock) {
            dispatch(addToCart({
                productId: product._id,
                variantId: selectedVariant?._id,
                quantity
            }));
        }
    };

    const handleBuyNow = () => {
        if (product && !isOutOfStock) {
            const isInCart = cart?.items?.some(item =>
                (item.productId?._id || item.productId).toString() === product._id &&
                (item.variantId === selectedVariant?._id)
            );

            if (!isInCart) {
                dispatch(addToCart({
                    productId: product._id,
                    variantId: selectedVariant?._id,
                    quantity
                }));
            }
            navigate('/cart');
        }
    };


    const handleWishlistToggle = () => {
        if (product) {
            if (isInWishlist) {
                dispatch(removeFromWishlist(product._id));
            } else {
                dispatch(addToWishlist(product._id));
            }
        }
    };

    if (loading && !product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    const relatedProducts = products.filter(p => {
        if (p._id === id) return false;
        const cat1 = typeof p.category === 'object' ? p.category?.categoryName : p.category;
        const cat2 = typeof product.category === 'object' ? product.category?.categoryName : product.category;
        return cat1 && cat2 && cat1 === cat2;
    });

    return (
        <div className="bg-white min-h-screen">
            {/* ===== Breadcrumbs ===== */}
            <div className="bg-[#f0f5f3] shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8 flex items-center flex-wrap gap-1 text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                    <Link to="/" className="cursor-pointer hover:text-[var(--primary-hover)] transition">Home</Link>
                    <MdKeyboardArrowRight className="text-xl" />
                    <Link
                        to={`/shop?category=${encodeURIComponent(product.category?.categoryName || '')}`}
                        className="cursor-pointer hover:text-[var(--primary-hover)] transition"
                    >
                        {product.category?.categoryName || 'Category'}
                    </Link>
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
                                <MdKeyboardArrowUp className="text-2xl hover:text-[var(--primary)]" />
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
                                            className={`w-24 h-24 p-1 rounded-lg border cursor-pointer transition-all flex-shrink-0 flex items-center justify-center bg-gray-50 overflow-hidden ${selectedImage === img ? 'border-[var(--primary)]' : 'border-gray-200 hover:border-gray-300'}`}
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
                                        className={`w-20 h-20 p-1 rounded-lg border cursor-pointer transition-all flex-shrink-0 flex items-center justify-center bg-gray-50 overflow-hidden ${selectedImage === img ? 'border-[var(--primary)]' : 'border-gray-100 hover:border-gray-200'}`}
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
                                <MdKeyboardArrowDown className="text-2xl hover:text-[var(--primary)]" />
                            </button>
                        </div>

                        {/* Main Product Image */}
                        <div className="flex-1 flex items-center justify-center bg-transparent p-4 min-h-[400px] border rounded-lg border-gray-200 overflow-hidden cursor-zoom-in">
                            <img
                                ref={imgRefZoom}
                                src={selectedImage}
                                alt="Main Product"
                                className="max-w-full max-h-[500px] object-contain transition-transform duration-300 ease-out"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            />
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
                                        className={`text-base sm:text-lg ${i < Math.round(product.avgRating || 0) ? "text-[#FFB81C]" : "text-[#D3D3D3]"}`}
                                    />
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="w-px h-4 bg-gray-300"></div>

                            {/* Rating Count */}
                            <span className="text-xs sm:text-sm text-gray-500">
                                {product.reviewCount || 0} Ratings
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {/* Discounted Price */}
                                {/* <span className="text-2xl md:text-3xl font-bold text-[#00B880]"> */}
                                <span className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
                                    ${selectedVariant?.discountPrice || selectedVariant?.price || 0}
                                </span>

                                {/* Original Price */}
                                {selectedVariant?.discountPrice < selectedVariant?.price && (
                                    <span className="text-sm md:text-base text-gray-400 line-through">
                                        ${selectedVariant?.price}
                                    </span>
                                )}

                                {/* Discount Badge */}
                                {product.offer && (
                                    <span className="text-xs md:text-sm font-medium text-red-500 bg-[#FFF1F1] px-2 py-1 rounded-md border border-[#FFE4E4]">
                                        {product.offer.offer_type === 'Discount'
                                            ? `${product.offer.offer_value}%`
                                            : `$${product.offer.offer_value}`} OFF
                                    </span>
                                )}
                            </div>

                            {/* Wishlist & Compare Section */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleWishlistToggle}
                                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 shadow-sm group transform active:scale-95 
                                        ${isInWishlist
                                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
                                            : 'border-gray-200 text-gray-400 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)]'
                                        }`}
                                >
                                    {isInWishlist ? <AiFillHeart className="text-xl" /> : <AiOutlineHeart className="text-xl" />}
                                </button>
                            </div>
                        </div>

                        {/* Short Description with Read More */}
                        <div className="mt-4">
                            <div
                                className="text-[#6B7280] leading-relaxed text-sm md:text-base line-clamp-2 ql-content break-words"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                            <button
                                onClick={scrollToDescription}
                                className="text-[var(--primary)] font-bold text-sm mt-1 hover:underline flex items-center gap-1 group"
                            >
                                Read more <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>

                        {/* Metadata */}
                        <div className="mt-8 space-y-3 pt-4 border-t border-gray-100">
                            <p className="text-base font-semibold text-[#333333]">SKU: <span className="font-normal text-gray-500 ml-2">AF-001-{product._id?.slice(-4)}</span></p>
                            <p className="text-base font-semibold text-[#333333]">Category: <span className="font-normal text-gray-500 ml-2">{product.category?.categoryName}</span></p>
                        </div>

                        {/* Quantity & Stock Status */}
                        <div className="flex items-center gap-4 mt-6">
                            <span className="text-base font-semibold text-[#333333]">Status:</span>
                            <span className={`${isOutOfStock ? 'bg-red-600' : 'bg-[#2E7D32]'} text-white px-3 py-1 rounded text-sm font-semibold`}>
                                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center bg-[#F3F4F6] rounded-md w-32 h-10 mt-4 overflow-hidden">
                            <button
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                                className={`flex-1 flex items-center justify-center transition ${quantity <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}
                            >
                                <FiMinus className="text-xl" />
                            </button>
                            <span className="flex-1 flex items-center justify-center font-semibold text-gray-800 text-lg">
                                {quantity}
                            </span>
                            <button
                                onClick={incrementQuantity}
                                disabled={quantity >= selectedVariant?.stock}
                                className={`flex-1 flex items-center justify-center transition ${quantity >= selectedVariant?.stock ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}
                            >
                                <FiPlus className="text-xl" />
                            </button>
                        </div>

                        {quantity === selectedVariant?.stock && selectedVariant?.stock > 0 && (
                            <div className="mt-2 text-xs font-semibold text-red-500 animate-pulse">
                                Only {selectedVariant?.stock} units available in stock
                            </div>
                        )}

                        {/* Subtotal */}
                        <div className="flex items-center gap-2 mt-6">
                            <span className="text-base font-semibold text-[#333333]">Subtotal:</span>
                            <span className="text-gray-500 text-base">${(quantity * (selectedVariant?.discountPrice || selectedVariant?.price || 0)).toFixed(2)}</span>
                        </div>


                        <div className="flex items-center gap-4 mt-6">
                            {/* <span className="text-base font-semibold text-[#333333]">Size:</span> */}
                            <div className="flex gap-3">
                                {product.weighstWise?.map((variant) => (
                                    <button
                                        key={variant._id}
                                        onClick={() => {
                                            setSelectedVariant(variant);
                                            setQuantity(1);
                                        }}
                                        className={`px-4 py-1 border rounded-md text-sm sm:text-base font-medium transition ${selectedVariant?._id === variant._id ? 'border-[var(--primary)] text-[var(--primary)] bg-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                                    >
                                        {variant.weight} {variant.unit}
                                    </button>
                                ))}
                            </div>
                        </div>


                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`w-full sm:flex-1 h-12 transition-colors flex items-center justify-center gap-2 rounded font-semibold text-lg ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#EEEEEE] hover:bg-gray-200 text-[#333333]'}`}
                            >
                                <FiShoppingCart className="text-xl" />
                                Add to cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className={`w-full sm:flex-1 h-12 transition-colors flex items-center justify-center text-white font-semibold text-lg rounded ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#333333] hover:bg-black'}`}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-16 pt-6 scroll-mt-40" ref={tabsRef}>
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
                    <div className="bg-white overflow-hidden">
                        {activeTab === 'description' ? (
                            // Full Description Content
                            <div className="animate-fadeIn">
                                <div className="ql-content prose prose-sm sm:prose-base max-w-full text-gray-500 leading-relaxed break-words"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        ) : (
                            // Reviews Content - Read only for Admin
                            <div className="animate-fadeIn">
                                <div className="mb-8">
                                    <ReviewChart reviews={product.reviews || []} />
                                </div>
                                <div className="space-y-2 mb-2 p-3 relative">
                                    {product.reviews && product.reviews.length > 0 ? (
                                        <>
                                            {product.reviews.slice(0, 2).map((review, i) => (
                                                <div key={i} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
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
                                                                    <div key={idx} className="w-16 h-16 rounded-md overflow-hidden border border-gray-100 flex-shrink-0">
                                                                        <img src={img.url || img} alt="Review" className="w-full h-full object-cover shadow-sm" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {product.reviews.length > 2 && (
                                                <div className="pt-4">
                                                    <button
                                                        onClick={() => setIsReviewDrawerOpen(true)}
                                                        className="flex items-center gap-2 text-[#00B880] font-bold hover:underline transition-all group"
                                                    >
                                                        View all {product.reviews.length} reviews
                                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic pb-10">No reviews yet for this product.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <ProductSlider
                        title="Related Products"
                        products={relatedProducts}
                        className="mt-8 pt-4"
                    />
                )}

                {/* Newsletter */}
                <Newsletter className="w-full pt-6 mt-10" />

            </div>

            <ReviewDrawer
                isOpen={isReviewDrawerOpen}
                onClose={() => setIsReviewDrawerOpen(false)}
                reviews={product.reviews}
                productName={product.name}
            />
        </div>
    );
}

export default ProductDetail;