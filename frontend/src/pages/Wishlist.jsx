import React, { useState } from 'react';
import { Trash2, ShoppingCart, HeartCrack, ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    // Mock wishlist data
    const [wishlistItems, setWishlistItems] = useState([
        { id: 1, name: 'Fresh Hass Avocado', category: 'Vegetables', price: '$2.49', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop', stock: true },
        { id: 2, name: 'Organic Bananas (Bunch)', category: 'Fruits', price: '$3.29', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=400&auto=format&fit=crop', stock: true },
        { id: 3, name: 'Artisan Sourdough Bread', category: 'Bakery', price: '$5.99', image: 'https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?q=80&w=400&auto=format&fit=crop', stock: false },
        { id: 4, name: 'Premium Coffee Beans', category: 'Beverages', price: '$14.99', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop', stock: true },
    ]);

    const removeFromWishlist = (id) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== id));
    };

    return (
        <div className="font-['Inter',sans-serif]">
            <div className="bg-white pt-8 pb-6 px-4 md:px-8 lg:px-12">
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

            <div className="px-4 md:px-8 lg:px-12 py-8">
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="rounded-md border border-[var(--border)] overflow-hidden group transition-all duration-300 transform">
                                <div className="relative h-56 overflow-hidden flex items-center justify-center p-4">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 rounded-lg"/>
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
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
                                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-light)] px-2 py-1 rounded-md">{item.category}</span>
                                    <h3 className="font-bold text-[var(--text-primary)] text-lg mt-3 mb-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">{item.name}</h3>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xl font-extrabold text-[var(--text-primary)]">{item.price}</span>
                                    </div>

                                    <button disabled={!item.stock} className={`w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-md font-bold transition-all duration-300 ${item.stock ? 'bg-[var(--primary)] text-[var(--btn-text)] hover:bg-[var(--primary-hover)] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}>
                                        <ShoppingCart size={18} />
                                        {item.stock ? 'Add to Cart' : 'Out of stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-sm text-center">
                        <div className="w-24 h-24 bg-[var(--primary-light)] text-[var(--primary)] rounded-full flex items-center justify-center mb-6 shadow-[var(--shadow)]">
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
