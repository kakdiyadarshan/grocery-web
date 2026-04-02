import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Eye, Grid, Heart, List, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getAllProducts } from '../redux/slice/product.slice';
import { getAllCategories } from '../redux/slice/category.slice';
import { addToCart } from '../redux/slice/cart.slice';
import { getWishlist, addToWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';
import { AiFillHeart, AiOutlineEye, AiOutlineHeart, AiOutlineShoppingCart } from 'react-icons/ai';


const Shop = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { products = [], allProducts = [], totalProducts = 0, loading = false } = useSelector((state) => state.product || {});
    const { categories: apiCategories = [] } = useSelector((state) => state.category || {});
    const { wishlist } = useSelector((state) => state.wishlist || {});
    const { isAuthenticated } = useSelector((state) => state.auth || {});
    const wishlistItems = wishlist?.items || [];
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [viewType, setViewType] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('alphabetical-az');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Updated from 12 as per user change
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsSmallScreen(window.innerWidth < 480);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

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
        // Handle body scroll locking and prevent layout shift
        const handleBodyScroll = () => {
            const isMobileFilter = isFilterOpen && window.innerWidth < 1024;

            if (isMobileFilter) {
                // Prevent scrolling and compensate for scrollbar width to avoid layout jump
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.overflow = 'hidden';
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            } else {
                // Restore scrolling and remove compensation padding
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '';
            }
        };

        handleBodyScroll();

        // Close mobile filter and restore scroll when screen is resized to desktop
        const handleResize = () => {
            handleBodyScroll();
            if (window.innerWidth >= 1024 && isFilterOpen) {
                setIsFilterOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '';
            window.removeEventListener('resize', handleResize);
        };
    }, [isFilterOpen]);

    useEffect(() => {
        dispatch(getAllProducts({ paginate: false }));
        if (isAuthenticated) {
            dispatch(getWishlist());
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam]);
            // Reset other filters to ensure only that category is shown
            setSelectedAvailability([]);
            setPriceRange({ min: '', max: '' });
            setSelectedWeights([]);
        } else {
            // Only clear categories if we're not filtering via the sidebar (i.e. no URL param)
            // But usually, navigating back to /shop without params means clear everything.
            setSelectedCategories([]);
            setSelectedAvailability([]);
            setPriceRange({ min: '', max: '' });
            setSelectedWeights([]);
        }
        setCurrentPage(1);
    }, [categoryParam, location.key]); // Use location.key to catch clicks on the same link

    useEffect(() => {
        // Fetch paginated products based on all filters
        dispatch(getAllProducts({
            page: currentPage,
            limit: itemsPerPage,
            paginate: true,
            search: searchParams.get('search') || undefined,
            category: (selectedCategories.length > 0 ? selectedCategories.join(',') : categoryParam) || undefined,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            weights: selectedWeights.join(','),
            availability: selectedAvailability.length === 1 ? selectedAvailability[0] : undefined,
            sort: sortBy
        }));
    }, [dispatch, currentPage, itemsPerPage, selectedCategories, priceRange, selectedWeights, selectedAvailability, sortBy, searchParams, categoryParam]);

    // Compute dynamic filter options from products
    const filterOptions = React.useMemo(() => {
        const weightsMap = new Map();
        const categoriesMap = new Map();
        let maxProductPrice = 0;
        let inStockCount = 0;
        let outOfStockCount = 0;

        allProducts.forEach(product => {
            if (product.weighstWise) {
                product.weighstWise.forEach(w => {
                    const priceValue = w.discountPrice || w.price || 0;
                    if (priceValue > maxProductPrice) maxProductPrice = priceValue;
                });
            }
            const isInStock = product.weighstWise?.some(w => w.stock > 0);
            if (isInStock) inStockCount++;
            else outOfStockCount++;
            const productWeights = new Set(product.weighstWise?.map(w => w.unit ? `${w.weight} ${w.unit}` : w.weight) || []);
            productWeights.forEach(weight => {
                weightsMap.set(weight, (weightsMap.get(weight) || 0) + 1);
            });
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
    }, [allProducts]);

    // We now use server-side data directly
    const filteredProductsSlice = products;
    const totalFiltered = totalProducts;

    const handleAvailabilityChange = (id) => {
        setSelectedAvailability(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
        setCurrentPage(1);
    };

    const handleWeightChange = (weight) => {
        setSelectedWeights(prev => prev.includes(weight) ? prev.filter(item => item !== weight) : [...prev, weight]);
        setCurrentPage(1);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev => prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]);
        setCurrentPage(1);
    };



    const totalPages = Math.ceil(totalFiltered / itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        if (isSmallScreen) {
            if (totalPages <= 4) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (currentPage <= 2) {
                pages.push(1, 2, '...', totalPages);
            } else if (currentPage >= totalPages - 1) {
                pages.push(1, '...', totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
            return pages;
        }

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <>
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

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Backdrop */}
                    <div
                        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300 ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setIsFilterOpen(false)}
                    />

                    <aside className={`lg:w-1/4 xl:w-[22%] shrink-0 transition-all duration-300 ease-in-out flex flex-col ${isFilterOpen
                        ? 'fixed top-0 left-0 bottom-0 w-[300px] z-[60] bg-white p-6 shadow-2xl translate-x-0'
                        : 'fixed top-0 left-0 bottom-0 w-[300px] z-[60] bg-white p-6 -translate-x-full lg:translate-x-0'} 
                        lg:relative lg:inset-auto lg:z-0 lg:p-0 lg:bg-transparent lg:shadow-none lg:overflow-visible border-r border-gray-100/0`}>
                        <div className="flex items-center justify-between mb-8 lg:hidden">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} className="text-gray-700" />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1 lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] overflow-y-auto pb-10 lg:pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pr-3">
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
                                            // Reset URL parameters
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.delete('category');
                                            newParams.delete('search');
                                            setSearchParams(newParams);
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
                                                            checked={selectedCategories.some(cat => cat.toLowerCase() === item.label.toLowerCase())}
                                                            onChange={() => handleCategoryChange(item.label)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-5 h-5 rounded-[4px] border border-gray-200 peer-checked:border-[var(--primary)] transition-all duration-200 flex items-center justify-center group-hover:border-[var(--primary)]/50">
                                                            <Check size={14} className={`text-[var(--primary)] transition-all duration-200 ${selectedCategories.some(cat => cat.toLowerCase() === item.label.toLowerCase()) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                                        </div>
                                                    </div>
                                                    <span className={`text-[14px] transition-colors duration-200 ${selectedCategories.some(cat => cat.toLowerCase() === item.label.toLowerCase()) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
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
                                        Highest price is ${filterOptions.maxPrice}
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
                                                                ? (isChecked ? 'border-emerald-500' : 'border-emerald-300/70 group-hover:border-emerald-400')
                                                                : (isChecked ? 'border-rose-400' : 'border-rose-200/80 group-hover:border-rose-300')}`}>
                                                            <Check size={14} className={`${item.id === 'in-stock' ? 'text-emerald-500' : 'text-rose-400'} transition-all duration-200 ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
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
                            <div className="flex items-center gap-4 sm:gap-6">
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="lg:hidden bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-5 py-2.5 rounded flex items-center gap-3 font-medium text-[14px] sm:text-[15px]"
                                >
                                    <SlidersHorizontal className="w-[18px] h-[18px] sm:w-5 sm:h-5 stroke-[2]" />
                                    <span className="tracking-wide">Filters</span>
                                </button>
                                <div className="hidden lg:flex items-center gap-3 text-[14px] sm:text-[15px]">
                                    <span className="text-gray-500 font-medium whitespace-nowrap">Sort by:</span>
                                    <div className="relative group">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white px-5 py-2.5 pr-10 rounded font-medium outline-none cursor-pointer"
                                        >
                                            <option value="alphabetical-az" className="bg-white text-gray-700">Alphabetically, A-Z</option>
                                            <option value="alphabetical-za" className="bg-white text-gray-700">Alphabetically, Z-A</option>
                                            <option value="price-low-high" className="bg-white text-gray-700">Price, low to high</option>
                                            <option value="price-high-low" className="bg-white text-gray-700">Price, high to low</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/80 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 lg:gap-8">
                                <span className="text-sm font-bold text-[#1a1a1a]">{totalFiltered} {totalFiltered === 1 ? 'Product' : 'Products'}</span>
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
                        ) : filteredProductsSlice.length === 0 ? (
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
                                ? "grid grid-cols-1 min-[425px]:grid-cols-2 min-[768px]:grid-cols-3 min-[1280px]:grid-cols-4 gap-4 sm:gap-6"
                                : "flex flex-col gap-6"
                            }>
                                {filteredProductsSlice.map((product) => {
                                    const variant = product.weighstWise?.find(v => v.stock > 0) || product.weighstWise?.[0];
                                    const outOfStock = variant?.stock === 0;
                                    const currentPrice = variant?.discountPrice || variant?.price || 0;
                                    const originalPrice = variant?.price || currentPrice;
                                    const hasDiscount = currentPrice < originalPrice;

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
                                            <Link id={`link-${product._id}`} to={`/product-details/${product._id}`} className="hidden">{product.name}</Link>

                                            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                                                {hasDiscount && !outOfStock && (
                                                    <span className="bg-[#FF4F4F] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wide uppercase">
                                                        {product.offer?.offer_type === "Fixed" ? `$${product.offer?.offer_value}` : `${product.offer?.offer_value}%`} OFF
                                                    </span>
                                                )}
                                                {outOfStock && (
                                                    <span className="bg-red-500 uppercase text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm tracking-wider">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            <div className={`absolute top-4 right-3 z-20 flex flex-col gap-2 transition-all duration-300 ${viewType === 'grid' ? 'sm:opacity-0 sm:translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0' : ''}`}>
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
                                                                // if (!isAuthenticated) {
                                                                //     return navigate('/login');
                                                                // }
                                                                if (isInWishlist) {
                                                                    dispatch(removeFromWishlist(product._id));
                                                                } else {
                                                                    dispatch(addToWishlist(product._id));
                                                                }
                                                            }}
                                                            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                                            className={`w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all transform active:scale-90 ${isInWishlist
                                                                ? 'text-red-500 hover:bg-red-500 hover:text-white'
                                                                : 'text-gray-500 hover:bg-[var(--primary)] hover:text-white'
                                                                }`}
                                                        // className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 bg-white border border-gray-100/50 ${isInWishlist
                                                        //     ? 'text-[var(--primary)]'
                                                        //     : 'text-[#62728f] hover:text-[var(--primary)]'
                                                        //     }`}
                                                        // title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                                        >
                                                            {isInWishlist ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                                                        </button>
                                                    );
                                                })()}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // if (!isAuthenticated) {
                                                        //     return navigate('/login');
                                                        // }
                                                        if (!outOfStock) dispatch(addToCart({
                                                            productId: product._id,
                                                            variantId: variant?._id,
                                                            quantity: 1
                                                        }));
                                                    }}
                                                    title={outOfStock ? "Out of Stock" : "Add to Cart"}
                                                    disabled={outOfStock}
                                                    className={`w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all transform active:scale-90 ${outOfStock
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-[var(--primary)] hover:text-white'
                                                        }`}
                                                // disabled={outOfStock}
                                                // className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all active:scale-95 bg-white border border-gray-100/50 ${outOfStock ? 'text-gray-300 cursor-not-allowed' : 'text-[#62728f] hover:text-[var(--primary)]'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                // title={outOfStock ? "Out of Stock" : "Add to Cart"}
                                                >
                                                    <AiOutlineShoppingCart size={18} />
                                                </button>
                                                <Link
                                                    to={`/product-details/${product._id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition-all transform active:scale-90`}
                                                    title="Quick View"
                                                >
                                                    <AiOutlineEye size={18} />
                                                </Link>
                                            </div>

                                            <div className={`relative shrink-0 overflow-hidden bg-white
                                                    ${viewType === 'list' ? 'w-full sm:w-[260px] aspect-auto h-full sm:h-[200px]' : 'w-full aspect-[4/3] pt-6 pb-2 px-6'}`}>
                                                <div className="w-full h-full flex items-center justify-center relative">
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image'}
                                                        alt={product.name}
                                                        className={`max-w-full max-h-[140px] sm:max-h-[160px] object-contain transition-all duration-500 ${product.images?.[1] ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-105'}`}
                                                    />
                                                    {product.images?.[1] && (
                                                        <img
                                                            src={product.images[1].url}
                                                            alt={product.name}
                                                            className="absolute inset-0 w-full h-full max-h-[140px] sm:max-h-[160px] m-auto object-contain transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`flex flex-col flex-grow w-full ${viewType === 'list' ? 'p-4 sm:py-4 sm:px-0' : 'p-3 sm:p-5 pt-2'} ${outOfStock ? 'opacity-70' : ''}`}>
                                                <div className="text-[11px] sm:text-[13px] text-[#8e9aab] mb-1 font-medium truncate transition-colors">
                                                    {product.category?.categoryName || 'Vegetables'}
                                                </div>
                                                <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#112a46] leading-tight sm:leading-snug mb-1.5 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-1 mb-2 sm:mb-3">
                                                    <div className="flex items-center text-[#e2e8f0]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={13} fill={i < Math.round(avgRating) ? "#fbbf24" : "#e2e8f0"} className={i < Math.round(avgRating) ? "text-[#fbbf24]" : "text-[#e2e8f0]"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[11px] sm:text-[13px] text-[#8e9aab] font-medium">({product.reviews?.length || 0})</span>
                                                </div>
                                                <div className="flex-grow"></div>
                                                <div className={`flex items-center justify-between ${viewType === 'list' ? 'pt-2' : 'pt-1'}`}>
                                                    <div className="flex items-center gap-2 relative top-0.5">
                                                        {hasDiscount ? (
                                                            <>
                                                                <span className="text-[18px] sm:text-[20px] font-bold text-[var(--primary)] leading-none tracking-tight">
                                                                    ${currentPrice}
                                                                </span>

                                                                <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                                                                    ${originalPrice}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[18px] sm:text-[20px] font-bold text-[var(--primary)] leading-none">
                                                                ${currentPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {viewType === 'list' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                // if (!isAuthenticated) {
                                                                //     return navigate('/login');
                                                                // }
                                                                if (!outOfStock) dispatch(addToCart({
                                                                    productId: product._id,
                                                                    variantId: variant?._id,
                                                                    quantity: 1
                                                                }));
                                                            }}
                                                            disabled={outOfStock}
                                                            className={`relative overflow-hidden flex items-center justify-center gap-2 font-[600] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed h-10 px-6 ${outOfStock ? 'bg-gray-400' : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'} text-white rounded-md whitespace-nowrap`}
                                                        >
                                                            <ShoppingCart size={16} />
                                                            <span className="text-[14px]">{outOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination UI */}
                        {!loading && totalFiltered > itemsPerPage && (
                            <div className="mt-12 flex justify-center items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.max(prev - 1, 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === 1}
                                    className="h-9 sm:h-11 px-2.5 sm:px-5 rounded-lg border border-gray-200 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                                >
                                    <ChevronLeft size={isSmallScreen ? 14 : 18} />
                                    <span className="hidden sm:inline">Prev</span>
                                </button>

                                {getPageNumbers().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (typeof page === 'number') {
                                                setCurrentPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        disabled={page === '...'}
                                        className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-sm
                                            ${page === '...'
                                                ? 'border-transparent text-gray-400 cursor-default bg-transparent shadow-none'
                                                : currentPage === page
                                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
                                                    : 'border-gray-200 text-[#1a1a1a] bg-white hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="h-9 sm:h-11 px-2.5 sm:px-5 rounded-lg border border-gray-200 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white shadow-sm"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight size={isSmallScreen ? 14 : 18} />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default Shop;