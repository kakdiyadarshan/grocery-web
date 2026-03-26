import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ChevronRight, Eye, Grid, Heart, List, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../redux/slice/product.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { addToWishlist } from '../redux/slice/wishlist.slice';

const Shop = () => {
    const dispatch = useDispatch();
    const { products = [], loading = false } = useSelector((state) => state.product || {});

    const [viewType, setViewType] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('alphabetical-az');

    useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);


    // Placeholder data for filters based on image
    const filters = {
        availability: [
            { id: 'in-stock', label: 'In stock', count: 17 },
            { id: 'out-of-stock', label: 'Out of stock', count: 1 }
        ],
        colors: [
            { id: 'green', color: '#4ade80' },
            { id: 'yellow', color: '#facc15' },
            { id: 'red', color: '#ef4444' }
        ],
        weights: [
            { id: '250gm', label: '250gm', count: 8 },
            { id: '500gm', label: '500gm', count: 4 },
            { id: '750gm', label: '750gm', count: 1 },
            { id: '1kg', label: '1kg', count: 2 }
        ],
        productTypes: [
            { id: 'dry-fruits', label: 'Dry Fruits', count: 4 },
            { id: 'grocery', label: 'Grocery', count: 2 },
            { id: 'nuts', label: 'Nuts', count: 1 },
            { id: 'organics', label: 'Organics', count: 2 },
            { id: 'vegies', label: 'Vegies', count: 4 }
        ],
        brands: [
            { id: 'bright-fruit', label: 'Bright Fruit', count: 4 },
            { id: 'fruity-liscious', label: 'Fruity-Liscious', count: 8 },
            { id: 'fruitvilla', label: 'Fruitvilla', count: 2 },
            { id: 'omni-sort', label: 'Omni-Sort', count: 5 },
            { id: 'patagonia', label: 'Patagonia', count: 2 }
        ]
    };

    return (
        <div className="font-['Inter',sans-serif]">
            <div className="bg-white">
                <div className="container mx-auto px-4 py-8 lg:py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl lg:text-2xl font-[600] text-[#1a1a1a] tracking-tight">Products</h1>
                        </div>
                        <nav className="flex items-center text-sm font-medium">
                            <Link to="/" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Home</Link>
                            <ChevronRight size={14} className="mx-2 text-gray-300" />
                            <span className="text-[#1a1a1a]">Grocery</span>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className={`lg:w-1/4 xl:w-1/5 shrink-0 ${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto lg:relative lg:inset-auto lg:z-0 lg:p-0 lg:bg-transparent' : 'hidden lg:block'}`}>
                        <div className="flex items-center justify-between mb-8 lg:hidden">
                            <h2 className="text-xl font-bold text-[#1a1a1a]">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                        </div>

                        <div className="space-y-8 sticky top-6">
                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Availability <ChevronDown size={14} />
                                </h3>
                                <div className="space-y-3">
                                    {filters.availability.map(item => (
                                        <label key={item.id} className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-all" />
                                                <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none left-0.5 top-0.5">
                                                    <svg size={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            </div>
                                            <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] transition-colors">{item.label} ({item.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Price <ChevronDown size={14} />
                                </h3>
                                <p className="text-[13px] text-gray-500 mb-4 font-medium italic">The highest price is $50.00</p>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input type="number" placeholder="From" className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-[var(--primary)] transition-colors" />
                                    </div>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input type="number" placeholder="To" className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-[var(--primary)] transition-colors" />
                                    </div>
                                </div>
                            </section>

                            {/* <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Color <ChevronDown size={14} />
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {filters.colors.map(c => (
                                        <button key={c.id} className="w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 active:scale-90 ring-offset-2 hover:ring-1 hover:ring-gray-300" style={{ backgroundColor: c.color }} />
                                    ))}
                                </div>
                            </section> */}

                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Weight <ChevronDown size={14} />
                                </h3>
                                <div className="space-y-3">
                                    {filters.weights.map(item => (
                                        <label key={item.id} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 transition-all text-[var(--primary)] focus:ring-[var(--primary)]" />
                                            <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] font-medium">{item.label} ({item.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Product type <ChevronDown size={14} />
                                </h3>
                                <div className="space-y-3">
                                    {filters.productTypes.map(item => (
                                        <label key={item.id} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 transition-all text-[var(--primary)] focus:ring-[var(--primary)]" />
                                            <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] font-medium">{item.label} ({item.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Brand <ChevronDown size={14} />
                                </h3>
                                <div className="space-y-3">
                                    {filters.brands.map(item => (
                                        <label key={item.id} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 transition-all text-[var(--primary)] focus:ring-[var(--primary)]" />
                                            <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] font-medium">{item.label} ({item.count})</span>
                                        </label>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>

                    <main className="flex-1">
                        <div className="bg-white p-4 rounded-md border border-gray-100 mb-8 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="lg:hidden flex items-center gap-2 text-sm font-bold text-[#1a1a1a] bg-gray-50 px-4 py-2 rounded border border-gray-200"
                                >
                                    <SlidersHorizontal size={16} /> Filters
                                </button>
                                <div className="hidden lg:flex items-center gap-2 text-sm">
                                    <span className="text-gray-400 font-medium">Sort by:</span>
                                    <div className="relative group">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-transparent pr-8 pl-1 font-bold text-[#1a1a1a] outline-none cursor-pointer"
                                        >
                                            <option value="alphabetical-az">Alphabetically, A-Z</option>
                                            <option value="alphabetical-za">Alphabetically, Z-A</option>
                                            <option value="price-low-high">Price, low to high</option>
                                            <option value="price-high-low">Price, high to low</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 lg:gap-8">
                                <span className="text-sm font-bold text-[#1a1a1a]">18 Products</span>
                                <div className="flex items-center gap-1.5 border-l border-gray-100 pl-6 lg:pl-8">
                                    <button
                                        onClick={() => setViewType('grid')}
                                        className={`p-2 rounded transition-colors ${viewType === 'grid' ? 'text-[var(--primary)] bg-[var(--primary-light)]' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Grid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewType('list')}
                                        className={`p-2 rounded transition-colors ${viewType === 'list' ? 'text-[var(--primary)] bg-[var(--primary-light)]' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <List size={22} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 space-y-4 animate-pulse">
                                        <div className="aspect-square bg-gray-100 rounded-lg" />
                                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                                        <div className="h-6 bg-gray-100 rounded w-3/4" />
                                        <div className="h-6 bg-gray-100 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={viewType === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                : "flex flex-col gap-6"
                            }>
                                {products.map((product) => {
                                    const minPrice = product.weighstWise?.length > 0
                                        ? Math.min(...product.weighstWise.map(w => Number(w.price) || 0))
                                        : 0;
                                    const hasDiscount = product.discountPrice > 0 && product.discountPrice < minPrice;
                                    const outOfStock = product.weighstWise?.every(w => w.stock <= 0);
                                    const avgRating = product.reviews?.length > 0
                                        ? product.reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / product.reviews.length
                                        : 0;

                                    return (
                                        <div key={product._id} className={`group relative bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 hover:border-[#38b47e] hover:shadow-xl hover:shadow-green-50/50 ${viewType === 'list' ? 'flex flex-col md:flex-row md:items-center' : ''}`}>

                                            {/* Discount Badge */}
                                            {hasDiscount && (
                                                <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#FF4F4F] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                    -{Math.round(((minPrice - product.discountPrice) / minPrice) * 100)}%
                                                </span>
                                            )}

                                            {/* Product Image */}
                                            <div className={`relative h-28 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden ${viewType === 'list' ? 'w-full md:w-[220px] aspect-square shrink-0' : ''}`}>
                                                <Link to={`/product-details/${product._id}`} className="w-full h-full flex items-center justify-center">
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image'}
                                                        alt={product.name}
                                                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </Link>

                                                {/* Vertical Action Buttons (Hover) */}
                                                <div className="absolute top-0 right-0 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                                    <button
                                                        onClick={() => dispatch(addToWishlist(product._id))}
                                                        className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-[#38b47e] hover:text-white transition-all transform hover:scale-110"
                                                        title="Add to Wishlist"
                                                    >
                                                        <Heart size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
                                                        className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-[#38b47e] hover:text-white transition-all transform hover:scale-110"
                                                        title="Add to Cart"
                                                    >
                                                        <ShoppingCart size={14} />
                                                    </button>
                                                    <Link
                                                        to={`/product-details/${product._id}`}
                                                        className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-[#38b47e] hover:text-white transition-all transform hover:scale-110"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex flex-col flex-grow space-y-1 sm:space-y-2">
                                                <span className="text-[10px] sm:text-xs text-[#8D949C] uppercase tracking-wider font-semibold">
                                                    {product.category?.categoryName || 'GENERAL'}
                                                </span>

                                                <h3 className="text-sm sm:text-base font-bold text-[#31353C] leading-tight line-clamp-1 group-hover:text-[#38b47e] transition-colors">
                                                    <Link to={`/product-details/${product._id}`}>{product.name}</Link>
                                                </h3>

                                                <div className="flex items-center gap-0.5 sm:gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            fill={i < Math.round(avgRating || 4) ? "#FFB81C" : "none"}
                                                            className={i < Math.round(avgRating || 4) ? "text-[#FFB81C]" : "text-[#E6E8EA]"}
                                                        />
                                                    ))}
                                                    <span className="text-[10px] text-gray-400 ml-1">({product.reviews?.length || 0})</span>
                                                </div>

                                                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto">
                                                    <span className="text-sm sm:text-lg font-bold text-[#38b47e]">
                                                        ₹{(Number(product.discountPrice || minPrice) || 0).toFixed(2)}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="text-xs sm:text-sm text-[#A2A9B1] line-through font-medium">
                                                            ₹{minPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination Placeholder */}
                        {!loading && products.length > 0 && (
                            <div className="mt-12 flex justify-center items-center gap-2">
                                <button className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center text-sm font-bold text-[#1a1a1a] hover:bg-[var(--primary)] hover:text-white transition-all">1</button>
                                <button className="w-10 h-10 rounded border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-[var(--primary)] transition-all">2</button>
                                <button className="px-4 h-10 rounded border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-[var(--primary)] transition-all">Next</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Shop;
