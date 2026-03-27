import React, { useEffect } from 'react';
import { Trash2, ShoppingCart, HeartCrack, ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getWishlist, removeFromWishlist } from '../redux/slice/wishlist.slice';
import { addToCart } from '../redux/slice/cart.slice';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { wishlist, loading: wishlistLoading } = useSelector((state) => state.wishlist);
    const { loading: cartLoading } = useSelector((state) => state.cart);

    useEffect(() => {
        dispatch(getWishlist());
    }, [dispatch]);

    const handleRemoveFromWishlist = (id) => {
        dispatch(removeFromWishlist(id));
    };

    const handleAddToCart = (productId) => {
        dispatch(addToCart({ productId, quantity: 1 }));
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
            <div className="bg-white pt-8 pb-6 px-4">
                <div className="flex flex-col gap-4">
                    <nav className="flex items-center text-sm text-[var(--text-secondary)]">
                        <Link to="/" className="hover:text-[var(--primary)] flex items-center gap-1 transition-colors">
                            <Home size={14} /> Home
                        </Link>
                        <ChevronRight size={14} className="mx-2" />
                        <span className="text-[var(--text-primary)] font-medium">My Wishlist</span>
                    </nav>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Wishlist</h1>
                            <p className="text-[var(--text-secondary)] mt-1">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-8">
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((wish) => {
                            const item = wish.productId;
                            if (!item) return null;
                            return (
                                <div key={wish._id} className="rounded-md border border-[var(--border)] overflow-hidden group transition-all duration-300 transform">
                                    <div className="relative h-56 overflow-hidden flex items-center justify-center p-4">
                                        <img
                                            src={item.images?.[0]?.url || item.images?.[0] || item.image || item.image?.[0] || 'https://via.placeholder.com/400'}
                                            alt={item.name || item.productName || 'Product'}
                                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleRemoveFromWishlist(item._id)}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full transition-colors duration-300 border border-red-50"
                                            title="Remove from Wishlist"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {!item.stock && (
                                            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-red-600 text-xs font-bold rounded-full shadow-sm">Out of Stock</div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        {item.category && (
                                            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-light)] px-2 py-1 rounded-md">
                                                {item.category?.categoryName || (typeof item.category === 'string' ? item.category : 'General')}
                                            </span>
                                        )}
                                        <h3 className="font-[500] text-[var(--text-primary)] text-lg mt-3 mb-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">{item.name || item.productName || 'No Name'}</h3>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-bold text-[var(--text-primary)]">₹{item.discountPrice || item.weighstWise?.[0]?.price || item.price || 0}</span>
                                        </div>

                                        <button
                                            disabled={!item.stock || cartLoading}
                                            onClick={() => handleAddToCart(item._id)}
                                            className={`w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-md font-[500] transition-all duration-300 ${item.stock ? 'bg-[var(--primary)] text-[var(--btn-text)] hover:bg-[var(--primary-hover)] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                                        >
                                            <ShoppingCart size={18} />
                                            {item.stock ? 'Add to Cart' : 'Out of stock'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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

