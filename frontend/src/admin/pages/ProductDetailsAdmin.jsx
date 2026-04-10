import React, { useState, useEffect, useRef } from 'react';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import { FiArrowRight, FiShoppingCart, FiX } from "react-icons/fi";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, getAllProducts } from '../../redux/slice/product.slice';
import ReviewChart from '../component/reviewChart';
import Breadcrumb from '../component/Breadcrumb';
import ReviewDrawer from '../component/ReviewDrawer';
import AdminLoader from '../component/AdminLoader';

function ProductDetailsAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { product, products, loading } = useSelector(state => state.product);

    useEffect(() => {
        if (id) {
            dispatch(getProductById(id));
        }
        if (products.length === 0) {
            dispatch(getAllProducts());
        }
    }, [id, dispatch, products.length]);

    const images = product?.images?.map(img => img.url) || [];
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const tabsRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('no-scrollbar');
        return () => {
            document.body.classList.remove('no-scrollbar');
        };
    }, []);

    useEffect(() => {
        if (isReviewDrawerOpen || modalImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isReviewDrawerOpen, modalImage]);

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
            setSelectedVariant(product.weighstWise[0]);
        }
    }, [product]);

    if (loading) {
        return <AdminLoader message="Loading Product Details..." icon={FiShoppingCart} />;
    }
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    return (
        <div className="bg-white min-h-screen no-scrollbar">
            <div className="mx-auto md:mt-6 mt-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">{product.name}</h2>
                    <Breadcrumb />
                </div>
            </div>

            <div className="mx-auto py-8 no-scrollbar">

                {/* Product Details */}
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* LEFT: Gallery Section */}
                    <div className="flex flex-col-reverse md:flex-row gap-6 lg:w-3/5">
                        {/* Vertical Thumbnails */}
                        <div className="flex md:flex-col items-center gap-3 py-2">
                            {startIndex > 0 && (
                                <button
                                    onClick={() => setStartIndex(prev => Math.max(0, prev - 1))}
                                    className="hidden md:flex items-center justify-center w-full px-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                                >
                                    <MdKeyboardArrowUp className="text-2xl" />
                                </button>
                            )}

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

                            {images.length > 4 && startIndex < images.length - 4 && (
                                <button
                                    onClick={() => setStartIndex(prev => Math.min(images.length - 4, prev + 1))}
                                    className="hidden md:flex items-center justify-center w-full px-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                                >
                                    <MdKeyboardArrowDown className="text-2xl" />
                                </button>
                            )}
                        </div>

                        {/* Main Product Image */}
                        <div className="flex-1 flex items-center justify-center bg-transparent p-4 min-h-[400px] border rounded-lg border-gray-200">
                            <img src={selectedImage} alt="Main Product" className="max-w-full max-h-[500px] object-contain transition-all duration-300" />
                        </div>
                    </div>

                    {/* RIGHT: Product Details Section */}
                    <div className="lg:w-2/5 space-y-3">
                        <h1 className="text-xl md:text-2xl font-semibold text-[#1F2937]">
                            {product.name}
                        </h1>

                        {/* Star Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <AiFillStar
                                        key={i}
                                        className={`text-base sm:text-lg ${i < (product.reviews?.length > 0 ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 0) ? "text-[#FFB81C]" : "text-[#D3D3D3]"}`}
                                    />
                                ))}
                            </div>
                            <div className="w-px h-4 bg-gray-300"></div>

                            {/* Rating Count */}
                            <span className="text-xs sm:text-sm text-gray-500">
                                {product.reviews?.length || 0} Ratings
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl md:text-3xl font-bold text-primary">
                                    ${selectedVariant?.discountPrice || selectedVariant?.price || 0}
                                </span>
                                {selectedVariant?.discountPrice < selectedVariant?.price && (
                                    <span className="text-sm md:text-base text-gray-400 line-through">
                                        ${selectedVariant?.price}
                                    </span>
                                )}
                                {product.offer && (
                                    <span className="text-xs md:text-sm font-medium text-red-500 bg-[#FFF1F1] px-2 py-1 rounded-md border border-[#FFE4E4]">
                                        {product.offer.offer_type === 'Discount'
                                            ? `${product.offer.offer_value}%`
                                            : `$${product.offer.offer_value}`} OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Short Description with Read More */}
                        <div className="mt-4">
                            <div
                                className="text-[#6B7280] leading-relaxed text-sm md:text-base line-clamp-2 ql-content"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                            <button
                                onClick={scrollToDescription}
                                className="text-primary font-bold text-sm mt-1 hover:underline flex items-center gap-1 group"
                            >
                                Read more <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>

                        {/* Metadata */}
                        <div className="mt-8 space-y-3 pt-4 border-t border-gray-100">
                            <p className="text-base font-semibold text-[#333333]">SKU: <span className="font-normal text-gray-500 ml-2">AF-001-{product._id?.slice(-4)}</span></p>
                            <p className="text-base font-semibold text-[#333333]">Category: <span className="font-normal text-gray-500 ml-2">{product.category?.categoryName}</span></p>

                            {/* Seller Details */}
                            {product.sellerId && (
                                <div className="pt-2 border-t border-gray-50 mt-4 space-y-2">
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Seller Information</p>
                                    <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 space-y-1">
                                        <p className="text-sm font-semibold text-[#333333]">Store: <span className="font-normal text-gray-600 ml-2">{product.sellerId.brandDetails?.storeName || 'N/A'}</span></p>
                                        <p className="text-sm font-semibold text-[#333333]">Vendor: <span className="font-normal text-gray-600 ml-2">{`${product.sellerId.firstname || ''} ${product.sellerId.lastname || ''}`.trim() || 'N/A'}</span></p>
                                        <p className="text-sm font-semibold text-[#333333]">Email: <span className="font-normal text-gray-600 ml-2">{product.sellerId.email}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity & Stock Status - Static in Admin */}
                        <div className="flex items-center gap-4 mt-6">
                            <span className="text-base font-semibold text-[#333333]">Stock status:</span>
                            {selectedVariant?.stock > 10 ? (
                                <span className="bg-[#2E7D32] text-white px-3 py-1 rounded text-sm font-semibold">
                                    In Stock ({selectedVariant.stock})
                                </span>
                            ) : selectedVariant?.stock > 0 ? (
                                <span className="bg-[#ed9323] text-white px-3 py-1 rounded text-sm font-semibold">
                                    Low Stock ({selectedVariant.stock})
                                </span>
                            ) : (
                                <span className="bg-[#D32F2F] text-white px-3 py-1 rounded text-sm font-semibold">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Note for Admin: Interactive parts removed */}
                        <div className="bg-amber-50 p-4 border border-amber-100 rounded-md mt-6">
                            <p className="text-xs text-amber-700 font-medium">
                                <strong>Preview Only:</strong> In this administrative view, shopping interactions (Quantity, Cart, Wishlist) are hidden to prevent accidental actions.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            {/* <span className="text-base font-semibold text-[#333333]">Size:</span> */}
                            <div className="flex gap-3">
                                {product.weighstWise?.map((variant) => (
                                    <button
                                        key={variant._id}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-1 border rounded-md text-sm sm:text-base font-semibold transition ${selectedVariant?._id === variant._id ? 'border-black text-black bg-white shadow-sm' : variant.stock === 0 ? 'border-gray-100 text-gray-300 opacity-60' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {variant.weight} {variant.unit}
                                        {variant.stock === 0 && <span className="ml-1 text-[10px] uppercase font-bold text-red-400">(OOS)</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-6 sm:mt-10 md:mt-12 pt-6" ref={tabsRef}>
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
                            // Full Description Content
                            <div className="animate-fadeIn">
                                <div className="ql-content prose prose-sm sm:prose-base max-w-none text-gray-500 leading-relaxed"
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
                                                                    <div
                                                                        key={idx}
                                                                        className="w-16 h-16 rounded-md overflow-hidden border border-gray-100 flex-shrink-0 cursor-pointer hover:border-[var(--primary)] transition-all"
                                                                        onClick={() => setModalImage(img.url || img)}
                                                                    >
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

                <div className="mt-10 flex justify-end gap-4 border-t pt-8">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="px-8 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md transition-colors shadow-sm"
                    >
                        Back to Inventory
                    </button>
                </div>
            </div>

            <ReviewDrawer
                isOpen={isReviewDrawerOpen}
                onClose={() => setIsReviewDrawerOpen(false)}
                reviews={product.reviews}
                productName={product.name}
                onImageClick={(img) => setModalImage(img)}
            />

            {/* Image Modal */}
            {modalImage && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
                        onClick={() => setModalImage(null)}
                    ></div>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center animate-zoomIn">
                        <button
                            className="absolute -top-12 right-0 sm:-right-12 text-white hover:text-gray-300 transition-colors p-2"
                            onClick={() => setModalImage(null)}
                        >
                            <FiX className="text-3xl" />
                        </button>
                        <img
                            src={modalImage}
                            alt="Full Screen"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetailsAdmin;


