import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ChevronRight, Eye, Grid, Heart, List, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getAllProducts } from '../redux/slice/product.slice';
import { getAllCategories } from '../redux/slice/category.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { getWishlist, addToWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';


const Shop = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { products = [], loading = false } = useSelector((state) => state.product || {});
    const { categories: apiCategories = [] } = useSelector((state) => state.category || {});
    const { wishlist } = useSelector((state) => state.wishlist || {});
    const wishlistItems = wishlist?.items || [];
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [viewType, setViewType] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('alphabetical-az');

    // Filter states
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedWeights, setSelectedWeights] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : []);

    // Toggle state for filter sections
    const [expandedFilters, setExpandedFilters] = useState({
        categories: true,
        price: true,
        availability: true,
        weights: true
    });

    const toggleFilter = (section) => {
        setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        dispatch(getAllProducts());
        dispatch(getAllCategories());
        dispatch(getWishlist());
    }, [dispatch]);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        } else {
            setSelectedCategories([]);
        }
    }, [categoryParam]);

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
            const productWeights = new Set(product.weighstWise?.map(w => w.unit ? `${w.weight} ${w.unit}` : w.weight) || []);
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

        const searchQuery = searchParams.get('search')?.trim().toLowerCase() || '';
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
                product.weighstWise?.some(w => {
                    const weightLabel = w.unit ? `${w.weight} ${w.unit}` : w.weight;
                    return selectedWeights.includes(weightLabel);
                })
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
    }, [products, searchParams, selectedAvailability, priceRange, selectedWeights, selectedCategories, sortBy]);

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
                            <span className="text-[#1a1a1a]">{selectedCategories.length === 1 ? selectedCategories[0] : 'Shop'}</span>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className={`lg:w-1/4 xl:w-[22%] shrink-0 transition-opacity duration-300 ${isFilterOpen ? 'fixed inset-0 z-50 bg-white/95 backdrop-blur-md p-6 overflow-y-auto lg:relative lg:inset-auto lg:z-0 lg:p-0 lg:bg-transparent lg:backdrop-blur-none border-r border-gray-100/0' : 'hidden lg:block'}`}>
                        <div className="flex items-center justify-between mb-8 lg:hidden">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} className="text-gray-700" />
                            </button>
                        </div>

                        <div className="space-y-6 sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto pb-10 lg:pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pr-1 lg:pr-3">
                            {/* Active Filters Display */}
                            {(selectedAvailability.length > 0 || priceRange.min !== '' || priceRange.max !== '' || selectedWeights.length > 0 || selectedCategories.length > 0) && (
                                <div className="p-4 rounded-md border border-gray-200/80 mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></div>
                                        <span className="text-sm font-bold text-gray-700">Active Filters</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedAvailability([]);
                                            setPriceRange({ min: '', max: '' });
                                            setSelectedWeights([]);
                                            setSelectedCategories([]);
                                        }}
                                        className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors hover:underline underline-offset-2"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}

                            {/* Categories Section */}
                            {filterOptions.categories.length > 0 && (
                                <section className="bg-white p-5 lg:p-6 rounded-md border border-gray-100">
                                    <button
                                        onClick={() => toggleFilter('categories')}
                                        className="w-full flex items-center justify-between font-bold text-[14px] text-gray-900 tracking-wider transition-opacity hover:opacity-80"
                                    >
                                        CATEGORIES
                                        <span className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedFilters.categories ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={14} className="text-gray-500" />
                                        </span>
                                    </button>
                                    <div className={`space-y-3 transition-all duration-300 overflow-hidden ${expandedFilters.categories ? 'mt-4 opacity-100 max-h-[500px]' : 'max-h-0 opacity-0'}`}>
                                        {filterOptions.categories.map(item => (
                                            <label key={item.label} className="flex items-center justify-between group cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(item.label)}
                                                            onChange={() => handleCategoryChange(item.label)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-5 h-5 rounded-[4px] border border-gray-200 peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)] transition-all duration-200 flex items-center justify-center group-hover:border-[var(--primary)]/50">
                                                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 scale-50 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[14px] transition-colors duration-200 ${selectedCategories.includes(item.label) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                                    {item.count}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Price Section */}
                            <section className="bg-white p-5 lg:p-6 rounded-md border border-gray-100">
                                <button
                                    onClick={() => toggleFilter('price')}
                                    className="w-full flex items-center justify-between font-bold text-[14px] text-gray-900 tracking-wider transition-opacity hover:opacity-80"
                                >
                                    PRICE RANGE
                                    <span className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedFilters.price ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </span>
                                </button>
                                <div className={`transition-all duration-300 overflow-hidden ${expandedFilters.price ? 'mt-4 opacity-100 max-h-[300px]' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-[12px] text-gray-400 mb-4 font-medium flex items-center gap-1.5">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                                        Highest price is ${filterOptions.maxPrice.toFixed(2)}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1 group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-medium transition-colors">$</div>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Min"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                                className="w-full pl-7 pr-2 py-2.5 text-[13px] font-medium text-gray-900 border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div className="text-gray-300 font-medium">—</div>
                                        <div className="relative flex-1 group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-medium transition-colors">$</div>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                                className="w-full pl-7 pr-2 py-2.5 text-[13px] font-medium text-gray-900 border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200 placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Availability Section */}
                            <section className="bg-white p-5 lg:p-6 rounded-md border border-gray-100">
                                <button
                                    onClick={() => toggleFilter('availability')}
                                    className="w-full flex items-center justify-between font-bold text-[14px] text-gray-900 tracking-wider transition-opacity hover:opacity-80"
                                >
                                    AVAILABILITY
                                    <span className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedFilters.availability ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </span>
                                </button>
                                <div className={`space-y-3 transition-all duration-300 overflow-hidden ${expandedFilters.availability ? 'mt-4 opacity-100 max-h-[300px]' : 'max-h-0 opacity-0'}`}>
                                    {filterOptions.availability.map(item => {
                                        const isChecked = selectedAvailability.includes(item.id);
                                        return (
                                            <label key={item.id} className="flex items-center justify-between group cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleAvailabilityChange(item.id)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={`w-5 h-5 rounded-[4px] border transition-all duration-200 flex items-center justify-center
                                                            ${item.id === 'in-stock'
                                                                ? (isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-300/70 group-hover:border-emerald-400')
                                                                : (isChecked ? 'bg-rose-400 border-rose-400' : 'border-rose-200/80 group-hover:border-rose-300')}`}>
                                                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 scale-50 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[14px] transition-colors duration-200 ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                                    {item.count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Weight Section */}
                            {filterOptions.weights.length > 0 && (
                                <section className="bg-white p-5 lg:p-6 rounded-md border border-gray-100">
                                    <button
                                        onClick={() => toggleFilter('weights')}
                                        className="w-full flex items-center justify-between font-bold text-[14px] text-gray-900 tracking-wider transition-opacity hover:opacity-80"
                                    >
                                        WEIGHT
                                        <span className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedFilters.weights ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={14} className="text-gray-500" />
                                        </span>
                                    </button>
                                    <div className={`flex flex-wrap gap-2 transition-all duration-300 overflow-hidden ${expandedFilters.weights ? 'mt-4 opacity-100 max-h-[400px]' : 'max-h-0 opacity-0'}`}>
                                        {filterOptions.weights.map(item => {
                                            const isSelected = selectedWeights.includes(item.label);
                                            return (
                                                <label key={item.label} className="cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleWeightChange(item.label)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 border flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-[var(--primary)]/30
                                                        ${isSelected
                                                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'}`}>
                                                        {item.label}
                                                        <span className={`flex items-center justify-center text-[10px] font-bold h-[18px] min-w-[18px] px-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {item.count}
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>
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
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 animate-fadeIn">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                    <ShoppingCart size={40} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-2">No Products Found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm sm:text-base">
                                    We couldn't find any products matching your current filters. Try adjusting your selection.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedAvailability([]);
                                        setPriceRange({ min: '', max: '' });
                                        setSelectedWeights([]);
                                        setSelectedCategories([]);
                                        searchParams.delete('category');
                                        searchParams.delete('search');
                                        setSearchParams(searchParams);
                                    }}
                                    className="bg-[var(--primary)] text-white px-8 py-3 rounded-md font-bold hover:bg-[var(--primary-hover)] transition-all shadow-lg active:scale-95"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewType === 'grid'
                                ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
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
                                        <div
                                            key={product._id}
                                            className={`group relative bg-white border border-gray-200 hover:border-[var(--primary)] rounded-xl transition-all duration-300 cursor-pointer overflow-hidden
                                                ${viewType === 'list' ? 'flex flex-col sm:flex-row gap-0 sm:gap-6 items-center sm:items-stretch p-0 sm:p-4' : 'flex flex-col h-full'}`}
                                            onClick={() => document.getElementById(`link-${product._id}`).click()}
                                        >
                                            {/* Hidden Link for entire card click */}
                                            <Link id={`link-${product._id}`} to={`/product-details/${product._id}`} className="hidden">{product.name}</Link>

                                            {/* Top left badges */}
                                            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                                                {hasDiscount && (
                                                    <span className="bg-[#E73959] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wide uppercase">
                                                        {Math.round(((minPrice - product.discountPrice) / minPrice) * 100)}% OFF
                                                    </span>
                                                )}
                                                {outOfStock && (
                                                    <span className="bg-gray-900/90 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wide">
                                                        SOLD OUT
                                                    </span>
                                                )}
                                            </div>

                                            {/* Floating Actions - Top Right */}
                                            <div className={`absolute top-4 right-4 z-20 flex flex-col gap-2 transition-all duration-300 ${viewType === 'grid' ? 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0' : ''}`}>
                                                {/* Wishlist */}
                                                {(() => {
                                                    const isInWishlist = wishlistItems.some(wish => {
                                                        const wishProductId = typeof wish.productId === 'object' ? wish.productId?._id : wish.productId;
                                                        return wishProductId === product._id;
                                                    });
                                                    return (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (isInWishlist) {
                                                                    dispatch(removeFromWishlist(product._id));
                                                                } else {
                                                                    dispatch(addToWishlist(product._id));
                                                                }
                                                            }}
                                                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 bg-white border border-gray-100/50 ${isInWishlist
                                                                ? 'text-[var(--primary)]'
                                                                : 'text-[#62728f] hover:text-[var(--primary)]'
                                                                }`}
                                                            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                                        >
                                                            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} className={isInWishlist ? 'scale-110' : ''} />
                                                        </button>
                                                    );
                                                })()}
                                                {/* Add to Cart */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (!outOfStock) dispatch(addToCart({ productId: product._id, quantity: 1 }));
                                                    }}
                                                    disabled={outOfStock}
                                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 bg-white border border-gray-100/50 text-[#62728f] hover:text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    title="Add to Cart"
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                                {/* Quick View */}
                                                <Link
                                                    to={`/product-details/${product._id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 bg-white border border-gray-100/50 text-[#62728f] hover:text-[var(--primary)] hover:scale-105 active:scale-95`}
                                                    title="Quick View"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                            </div>

                                            {/* Product Image Section */}
                                            <div className={`relative shrink-0 overflow-hidden bg-white
                                                ${viewType === 'list' ? 'w-full sm:w-[260px] aspect-auto h-full sm:h-[200px]' : 'w-full aspect-[4/3] pt-6 pb-2 px-6'}`}>

                                                <div className="w-full h-full flex items-center justify-center relative">
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image'}
                                                        alt={product.name}
                                                        className={`max-w-full max-h-[160px] object-contain transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'grayscale opacity-70' : ''}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Product Info Section */}
                                            <div className={`flex flex-col flex-grow w-full ${viewType === 'list' ? 'p-4 sm:py-4 sm:px-0' : 'p-4 sm:p-5 pt-2'}`}>

                                                {/* Category */}
                                                <div className="text-[13px] text-[#8e9aab] mb-1.5 font-medium transition-colors">
                                                    {product.category?.categoryName || 'Vegetables'}
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-[16px] font-[700] text-[#112a46] leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                                                    {product.name}
                                                </h3>

                                                {/* Rating */}
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <div className="flex items-center text-[#e2e8f0]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < Math.round(avgRating) ? "#fbbf24" : "#e2e8f0"} className={i < Math.round(avgRating) ? "text-[#fbbf24]" : "text-[#e2e8f0]"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[13px] text-[#8e9aab] font-medium">({product.reviews?.length || 0})</span>
                                                </div>

                                                {/* Weight Push (Optional placeholder area) */}
                                                <div className="flex-grow"></div>

                                                {/* Bottom Row: Price & Add Button */}
                                                <div className={`flex items-center justify-between ${viewType === 'list' ? 'pt-2' : 'pt-1'}`}>
                                                    <div className="flex flex-col relative top-0.5">
                                                        {hasDiscount ? (
                                                            <>
                                                                <span className="text-[11px] sm:text-[12px] text-gray-400 line-through font-medium mb-0.5">
                                                                    ${minPrice.toFixed(2)}
                                                                </span>
                                                                <span className="text-[17px] sm:text-[18px] font-[600] text-gray-900 leading-none tracking-tight">
                                                                    ${(Number(product.discountPrice || minPrice) || 0).toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[18px] sm:text-[20px] font-bold text-[var(--primary)] leading-none tracking-tight">
                                                                ${(Number(minPrice) || 0).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Add Button for list view only (since grid has floating cart) */}
                                                    {viewType === 'list' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (!outOfStock) dispatch(addToCart({ productId: product._id, quantity: 1 }));
                                                            }}
                                                            disabled={outOfStock}
                                                            className="relative overflow-hidden flex items-center justify-center gap-2 font-[600] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed h-10 px-6 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] whitespace-nowrap"
                                                        >
                                                            <ShoppingCart size={16} />
                                                            <span className="text-[14px]">Add to Cart</span>
                                                        </button>
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
