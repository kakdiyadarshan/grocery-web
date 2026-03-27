import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ChevronRight, Eye, Grid, Heart, List, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getAllProducts } from '../redux/slice/product.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { addToWishlist } from '../redux/slice/wishlist.slice';

const Shop = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { products = [], loading = false } = useSelector((state) => state.product || {});
    const searchQuery = new URLSearchParams(location.search).get('search')?.trim().toLowerCase() || '';

    const [viewType, setViewType] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('alphabetical-az');

    // Filter states
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedWeights, setSelectedWeights] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    // Compute dynamic filter options from products
    const filterOptions = React.useMemo(() => {
        const weightsMap = new Map();
        const categoriesMap = new Map();
        let maxProductPrice = 0;
        let inStockCount = 0;
        let outOfStockCount = 0;

        products.forEach(product => {
            // Price
            if (product.weighstWise) {
                product.weighstWise.forEach(w => {
                    if (w.price > maxProductPrice) maxProductPrice = w.price;
                });
            }

            // Availability
            const isInStock = product.weighstWise?.some(w => w.stock > 0);
            if (isInStock) inStockCount++;
            else outOfStockCount++;

            // Weights
            const productWeights = new Set(product.weighstWise?.map(w => w.weight) || []);
            productWeights.forEach(weight => {
                weightsMap.set(weight, (weightsMap.get(weight) || 0) + 1);
            });

            // Categories
            const catName = product.category?.categoryName || 'General';
            categoriesMap.set(catName, (categoriesMap.get(catName) || 0) + 1);
        });

        return {
            weights: Array.from(weightsMap.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label)),
            categories: Array.from(categoriesMap.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label)),
            maxPrice: maxProductPrice,
            availability: [
                { id: 'in-stock', label: 'In stock', count: inStockCount },
                { id: 'out-of-stock', label: 'Out of stock', count: outOfStockCount }
            ]
        };
    }, [products]);

    // Filtering and Sorting Logic
    const filteredProducts = React.useMemo(() => {
        let result = [...products];

        // 1. Filter by search query from header
        if (searchQuery) {
            result = result.filter((product) => {
                const name = (product.name || '').toLowerCase();
                const description = (product.description || '').toLowerCase();
                const category = (product.category?.categoryName || '').toLowerCase();
                return name.includes(searchQuery) || description.includes(searchQuery) || category.includes(searchQuery);
            });
        }

        // 2. Filter by Availability
        if (selectedAvailability.length > 0) {
            result = result.filter(product => {
                const inStock = product.weighstWise?.some(w => w.stock > 0);
                if (selectedAvailability.includes('in-stock') && inStock) return true;
                if (selectedAvailability.includes('out-of-stock') && !inStock) return true;
                return false;
            });
        }

        // 3. Filter by Price
        if (priceRange.min !== '' || priceRange.max !== '') {
            result = result.filter(product => {
                const productMinPrice = product.weighstWise?.length > 0
                    ? Math.min(...product.weighstWise.map(w => w.price))
                    : 0;
                const min = priceRange.min === '' ? 0 : Number(priceRange.min);
                const max = priceRange.max === '' ? Infinity : Number(priceRange.max);
                return productMinPrice >= min && productMinPrice <= max;
            });
        }

        // 4. Filter by Weight
        if (selectedWeights.length > 0) {
            result = result.filter(product =>
                product.weighstWise?.some(w => selectedWeights.includes(w.weight))
            );
        }

        // 5. Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(product =>
                selectedCategories.includes(product.category?.categoryName)
            );
        }

        // 6. Sorting
        result.sort((a, b) => {
            const getMinPrice = (p) => p.weighstWise?.length > 0 ? Math.min(...p.weighstWise.map(w => w.price)) : 0;
            switch (sortBy) {
                case 'alphabetical-az':
                    return (a.name || '').localeCompare(b.name || '');
                case 'alphabetical-za':
                    return (b.name || '').localeCompare(a.name || '');
                case 'price-low-high':
                    return getMinPrice(a) - getMinPrice(b);
                case 'price-high-low':
                    return getMinPrice(b) - getMinPrice(a);
                default:
                    return 0;
            }
        });

        return result;
    }, [products, searchQuery, selectedAvailability, priceRange, selectedWeights, selectedCategories, sortBy]);

    const handleAvailabilityChange = (id) => {
        setSelectedAvailability(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleWeightChange = (weight) => {
        setSelectedWeights(prev =>
            prev.includes(weight) ? prev.filter(item => item !== weight) : [...prev, weight]
        );
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]
        );
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
                            {/* Availability Section */}
                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Availability <ChevronDown size={14} />
                                </h3>
                                <div className="space-y-3">
                                    {filterOptions.availability.map(item => (
                                        <label key={item.id} className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAvailability.includes(item.id)}
                                                    onChange={() => handleAvailabilityChange(item.id)}
                                                    className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-all"
                                                />
                                                <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none left-0.5 top-0.5">
                                                    <svg size={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            </div>
                                            <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] transition-colors">
                                                {item.label} ({item.count})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* Price Section */}
                            <section>
                                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                    Price <ChevronDown size={14} />
                                </h3>
                                <p className="text-[13px] text-gray-500 mb-4 font-medium italic">The highest price is ₹{filterOptions.maxPrice.toFixed(2)}</p>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            placeholder="From"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                            className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-[var(--primary)] transition-colors"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input
                                            type="number"
                                            placeholder="To"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                            className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-[var(--primary)] transition-colors"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Weight Section */}
                            {filterOptions.weights.length > 0 && (
                                <section>
                                    <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                        Weight <ChevronDown size={14} />
                                    </h3>
                                    <div className="space-y-3">
                                        {filterOptions.weights.map(item => (
                                            <label key={item.label} className="flex items-center group cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedWeights.includes(item.label)}
                                                    onChange={() => handleWeightChange(item.label)}
                                                    className="w-4 h-4 rounded border-gray-300 transition-all text-[var(--primary)] focus:ring-[var(--primary)]"
                                                />
                                                <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] font-medium">
                                                    {item.label} ({item.count})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Category Section */}
                            {filterOptions.categories.length > 0 && (
                                <section>
                                    <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4 flex items-center justify-between uppercase tracking-wider">
                                        Product type <ChevronDown size={14} />
                                    </h3>
                                    <div className="space-y-3">
                                        {filterOptions.categories.map(item => (
                                            <label key={item.label} className="flex items-center group cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(item.label)}
                                                    onChange={() => handleCategoryChange(item.label)}
                                                    className="w-4 h-4 rounded border-gray-300 transition-all text-[var(--primary)] focus:ring-[var(--primary)]"
                                                />
                                                <span className="ml-3 text-[14px] text-gray-600 group-hover:text-[var(--primary)] font-medium">
                                                    {item.label} ({item.count})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Clear All Filters Button */}
                            {(selectedAvailability.length > 0 || priceRange.min !== '' || priceRange.max !== '' || selectedWeights.length > 0 || selectedCategories.length > 0) && (
                                <button
                                    onClick={() => {
                                        setSelectedAvailability([]);
                                        setPriceRange({ min: '', max: '' });
                                        setSelectedWeights([]);
                                        setSelectedCategories([]);
                                    }}
                                    className="w-full py-2.5 text-sm font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                >
                                    Clear All Filters
                                </button>
                            )}
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
                                <span className="text-sm font-bold text-[#1a1a1a]">{filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}</span>
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
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <span className="text-lg font-medium text-gray-400">No products found matching your filters.</span>
                                <button
                                    onClick={() => {
                                        setSelectedAvailability([]);
                                        setPriceRange({ min: '', max: '' });
                                        setSelectedWeights([]);
                                        setSelectedCategories([]);
                                    }}
                                    className="mt-4 block mx-auto text-[var(--primary)] font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewType === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                : "flex flex-col gap-6"
                            }>
                                {filteredProducts.map((product) => {
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
                        {!loading && filteredProducts.length > 0 && (
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
