import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Home, ChevronRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    // Mock cart data
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Fresh Hass Avocado', category: 'Vegetables', price: 2.49, quantity: 4, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop' },
        { id: 2, name: 'Organic Bananas (Bunch)', category: 'Fruits', price: 3.29, quantity: 1, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=400&auto=format&fit=crop' },
        { id: 3, name: 'Premium Coffee Beans', category: 'Beverages', price: 14.99, quantity: 2, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop' },
    ]);

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    };

    // Calculations
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = cartItems.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
    const tax = cartItems.length > 0 ? (subtotal * 0.08) : 0; // 8% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="font-['Inter',sans-serif] pb-12">
            <div className="bg-white pt-8 pb-6 px-4 md:px-8 lg:px-12 mb-8">
                <div className="flex flex-col gap-4">
                    <nav className="flex items-center text-sm text-[var(--text-secondary)]">
                        <Link to="/" className="hover:text-[var(--primary)] flex items-center gap-1 transition-colors font-medium">
                            <Home size={14} /> Home
                        </Link>
                        <ChevronRight size={14} className="mx-2" />
                        <span className="text-[var(--text-primary)] font-semibold">Shopping Cart</span>
                    </nav>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Shopping Cart</h1>
                            <p className="text-[var(--text-secondary)] mt-1.5 font-medium">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
                        </div>
                        {cartItems.length > 0 && (
                            <Link to="/" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-bold flex items-center gap-2 transition-colors">
                                <ArrowLeft size={16} /> Continue Shopping
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 lg:px-12">
                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="w-full lg:w-2/3 flex flex-col gap-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-md border border-[var(--border)] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all">
                                    <div className="w-full sm:w-28 h-28 shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply rounded-md" />
                                    </div>

                                    <div className="flex-1 w-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-light)] px-2.5 py-1 rounded-md mb-2 inline-block">
                                                    {item.category}
                                                </span>
                                                <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1 leading-tight"><Link to={`/product/${item.id}`} className="hover:text-[var(--primary)] transition-colors">{item.name}</Link></h3>
                                                <p className="text-[var(--text-secondary)] font-medium">${item.price.toFixed(2)} each</p>
                                            </div>
                                            <span className="font-extrabold text-xl text-[var(--text-primary)]">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border)] border-dashed">
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[var(--primary)] transition-colors">
                                                    <Minus size={14} strokeWidth={2.5} />
                                                </button>
                                                <input type="text" readOnly value={item.quantity} className="w-10 h-9 bg-transparent text-center font-bold text-[var(--text-primary)] text-sm focus:outline-none"/>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[var(--primary)] transition-colors">
                                                    <Plus size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>

                                            <button onClick={() => removeFromCart(item.id)} className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                                <Trash2 size={16} /> <span className="hidden sm:inline">Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="w-full lg:w-1/3 sticky top-6">
                            <div className="bg-white rounded-md border border-[var(--border)] p-6 lg:p-8">
                                <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-6">Order Summary</h2>

                                <div className="space-y-4 text-sm font-medium mb-6">
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span className="text-[var(--text-primary)]">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Estimated Tax (8%)</span>
                                        <span className="text-[var(--text-primary)]">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-[var(--primary)] font-bold">Free</span>
                                        ) : (
                                            <span className="text-[var(--text-primary)]">${shipping.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-[var(--border)] pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-[var(--text-primary)]">Total</span>
                                        <span className="text-2xl font-extrabold text-[var(--text-primary)]">${total.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 text-right">Pre-tax currency USD</p>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--primary)] text-white rounded-md font-bold text-lg hover:bg-[var(--primary-hover)] transition-all duration-300 shadow-md shadow-[var(--primary)]/20 active:scale-95 mb-4 border border-transparent">
                                    Proceed to Checkout <ArrowRight size={20} />
                                </button>

                                <div className="flex items-center justify-center gap-4 text-[var(--text-secondary)] mt-6 border-t border-[var(--border)] pt-6">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <ShieldCheck size={20} className="text-[var(--primary)]" />
                                        <span className="text-[10px] uppercase tracking-wider font-bold">Secure</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 border-l border-[var(--border)] pl-4">
                                        <Truck size={20} className="text-[var(--primary)]" />
                                        <span className="text-[10px] uppercase tracking-wider font-bold">Fast Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-3xl border border-[var(--border)] shadow-sm text-center">
                        <div className="w-28 h-28 bg-[var(--bg-main)] text-gray-300 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[var(--border)]">
                            <ShoppingBag size={56} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">Your cart is empty</h2>
                        <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto mb-8 leading-relaxed font-medium">
                            Looks like you haven't added any fresh groceries to your cart yet. Let's fix that!
                        </p>
                        <Link to="/" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/30 active:scale-95 text-lg">
                            Return to Shop
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
