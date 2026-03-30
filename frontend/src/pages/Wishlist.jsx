import React, { useEffect, useState } from 'react';
import { Trash2, ShoppingCart, HeartCrack, ChevronRight, Home, Eye, Check, X, Minus, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';
import { addToCart } from '../redux/slice/cart.slice';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { wishlist, loading: wishlistLoading } = useSelector((state) => state.wishlist);
    const { loading: cartLoading } = useSelector((state) => state.cart);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        dispatch(getWishlist());
    }, [dispatch]);

    const handleRemoveFromWishlist = (id) => {
        dispatch(removeFromWishlist(id));
    };

    const handleQuantityChange = (id, delta) => {
        setQuantities(prev => {
            const currentQty = prev[id] || 1;
            const newQty = Math.max(1, currentQty + delta);
            return { ...prev, [id]: newQty };
        });
    };

    const handleAddToCart = (productId) => {
        const qty = quantities[productId] || 1;
        dispatch(addToCart({ productId, quantity: qty }));
    };

    const wishlistItems = wishlist?.items?.filter(item => item?.productId) || [];

    if (wishlistLoading) {
        return (
            <div className="container flex justify-center items-center py-20 font-['Inter',sans-serif]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="container font-['Inter',sans-serif]">
            <div className="bg-white py-8 px-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                    <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1e5066] text-left leading-tight">My Wishlist</h1>
                    {wishlistItems.length > 0 && (
                        <Link to="/shop" className="text-[var(--primary)] hover:text-[#1e5066] font-bold flex items-center gap-2 transition-colors">
                            <ArrowLeft size={16} /> Continue Shopping
                        </Link>
                    )}
                </div>
                <div className="flex items-center gap-1 text-[14px] text-gray-500 font-medium">
                    <Link to="/" className="hover:text-[var(--primary)] transition-colors font-bold">Home</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                    <span className="text-[#228b22] font-bold">My Wishlist</span>
                    <span className="text-gray-400 ml-2 border-l font-[600] border-gray-300 pl-2">({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})</span>
                </div>
            </div>

            <div className="px-4 py-8">
                {wishlistItems.length > 0 ? (
                    <div className="w-full overflow-x-auto pb-10">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-5 px-4 font-bold text-[14px] text-gray-600 tracking-wide">Product</th>
                                    <th className="py-5 px-4 font-bold text-[14px] text-gray-600 tracking-wide">Quantity</th>
                                    <th className="py-5 px-4 font-bold text-[14px] text-gray-600 tracking-wide">Price</th>
                                    <th className="py-5 px-4 font-bold text-[14px] text-gray-600 tracking-wide">Stock Status</th>
                                    <th className="py-5 px-4 font-bold text-[14px] text-gray-600 tracking-wide text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlistItems.map((wish) => {
                                    const item = wish.productId;
                                    if (!item) return null;
                                    const isOnSale = item.discountPrice && item.discountPrice < item.price;
                                    const itemPrice = item.price || item.discountPrice || item.weighstWise?.[0]?.price || 0;
                                    const itemDiscountPrice = item.discountPrice || itemPrice;

                                    // Check product stock status (supporting both root stock and weights array)
                                    const isInStock = item.stock || item.stockCount > 0 || (item.weighstWise && item.weighstWise.some(w => w.stock > 0));
                                    const stockCount = item.stockCount || item.stock || (item.weighstWise ? item.weighstWise.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) : 0);

                                    const currentQty = quantities[item._id] || 1;

                                    return (
                                        <tr key={wish._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-6 px-4 align-middle">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-[84px] h-[84px] bg-white rounded-md flex items-center justify-center p-2 flex-shrink-0 border border-gray-100 group-hover:border-gray-200 transition-colors">
                                                        <img
                                                            src={item.images?.[0]?.url || item.images?.[0] || item.image || item.image?.[0] || 'https://via.placeholder.com/84'}
                                                            alt={item.name || item.productName || 'Product'}
                                                            className="w-full h-full object-contain mix-blend-multiply"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Link to={`/product-details/${item._id}`} className="text-[#333333] font-[600] text-[15.5px] hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug">
                                                            {item.name || item.productName || 'No Name'}
                                                        </Link>
                                                        <div className="text-[13px] text-gray-500 mt-1.5 flex items-center gap-1 uppercase">
                                                            <span>SKU:</span>
                                                            <span className="text-gray-600">{item.sku || item._id?.substring(0, 5) || '12345'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 align-middle">
                                                <div className="flex items-center border border-gray-200 rounded-sm w-max bg-white">
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, -1)}
                                                        disabled={currentQty <= 1}
                                                        className="h-[38px] w-[34px] flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus size={15} />
                                                    </button>
                                                    <div className="w-[34px] h-[38px] flex items-center justify-center text-[15px] font-semibold border-x border-gray-200 bg-white text-[#333333]">{currentQty}</div>
                                                    <button
                                                        onClick={() => handleQuantityChange(item._id, 1)}
                                                        className="h-[38px] w-[34px] flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors focus:outline-none focus:bg-gray-50"
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    {isOnSale ? (
                                                        <>
                                                            <span className="text-gray-400 line-through text-[15.5px] font-semibold decoration-gray-400/70">${itemPrice}</span>
                                                            <span className="text-[#e26a45] font-medium whitespace-nowrap font-semibold text-[15.5px]">${itemDiscountPrice}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-700 font-semibold whitespace-nowrap text-[15.5px]">${itemPrice}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 align-middle">
                                                {isInStock ? (
                                                    <div className="flex items-center gap-2 text-[#589c5f]">
                                                        <Check size={18} strokeWidth={2.5} />
                                                        <span className="text-[14px] font-semibold whitespace-nowrap pt-0.5">{stockCount > 0 ? stockCount : '188'} in stock</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-500">
                                                        <X size={18} strokeWidth={2.5} />
                                                        <span className="text-[14px] font-semibold whitespace-nowrap pt-0.5">Out of stock</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-6 px-4 align-middle text-right">
                                                <div className="flex flex-col items-end gap-2.5">
                                                    <div className="flex items-center gap-2 justify-end w-full">
                                                        <Link
                                                            to={`/product-details/${item._id}`}
                                                            className="flex items-center justify-center border border-gray-200 rounded-sm hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
                                                            style={{ width: '42px', height: '42px' }}
                                                        >
                                                            <Eye size={18} strokeWidth={1.5} />
                                                        </Link>
                                                        <button
                                                            disabled={!isInStock || cartLoading}
                                                            onClick={() => handleAddToCart(item._id)}
                                                            className={`h-[42px] px-6 rounded-sm text-[14px] font-semibold transition-colors flex-shrink-0 ${isInStock
                                                                    ? 'bg-[#228b22] text-white hover:bg-black focus:ring-2 focus:ring-[#1a1a1a] focus:ring-offset-1'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                                }`}
                                                        >
                                                            Add To Cart
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveFromWishlist(item._id)}
                                                            className="flex items-center justify-center border border-gray-200 rounded-sm hover:bg-red-50 hover:border-red-100 hover:text-red-500 text-gray-400 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:ring-offset-1"
                                                            title="Remove from Wishlist"
                                                            style={{ width: '42px', height: '42px' }}
                                                        >
                                                            <Trash2 size={18} strokeWidth={1.5} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-[var(--bg-card)] rounded-md border border-[var(--border)] text-center">
                        <div className="w-24 h-24 bg-[var(--primary-light)] text-[var(--primary)] rounded-full flex items-center justify-center mb-6">
                            <HeartCrack size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">Your wishlist is empty</h2>
                        <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto mb-8 leading-relaxed">
                            Looks like you haven't added any items to your wishlist yet. Explore our fresh grocery items to find products you love!
                        </p>
                        <Link to="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-[var(--btn-text)] rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/30 active:scale-95 text-lg">Start Shopping</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;

