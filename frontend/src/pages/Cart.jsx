import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Home, ChevronRight, ShieldCheck, Truck, ArrowLeft, Tag, X, CheckCircle2, Ticket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, removeFromCart, updateCartQuantity } from '../redux/slice/cart.slice';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart, loading } = useSelector((state) => state.cart);

    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);

    const handleRemoveFromCart = (productId, variantId) => {
        dispatch(removeFromCart({ productId, variantId }));
    };

    const handleUpdateQuantity = (productId, variantId, newQuantity) => {
        if (newQuantity < 1) return;
        dispatch(updateCartQuantity({ productId, variantId, quantity: newQuantity }));
    };


    const cartItems = cart?.items || [];

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const validCoupons = {
        FRESH10: { type: 'percent', value: 10, label: '10% off your order' },
        SAVE20: { type: 'percent', value: 20, label: '20% off your order' },
        FREESHIP: { type: 'shipping', value: 0, label: 'Free shipping' },
    };

    const handleApplyCoupon = () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) { setCouponError('Please enter a coupon code.'); return; }
        setCouponLoading(true);
        setCouponError('');
        setTimeout(() => {
            if (validCoupons[code]) {
                setAppliedCoupon({ code, ...validCoupons[code] });
                setCouponError('');
            } else {
                setCouponError('Invalid coupon code. Please try again.');
            }
            setCouponLoading(false);
        }, 700);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // Calculations
    const subtotal = cartItems.reduce((acc, item) => {
        const prod = item.productId;
        const variant = item.selectedVariant || prod?.weighstWise?.find(v => v._id === item.variantId) || prod?.weighstWise?.[0];
        const price = variant?.price || prod?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    const shippingBase = cartItems.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
    const shipping = (appliedCoupon?.type === 'shipping') ? 0 : shippingBase;
    const tax = cartItems.length > 0 ? (subtotal * 0.08) : 0; // 8% tax
    const couponDiscount = appliedCoupon?.type === 'percent' ? (subtotal * appliedCoupon.value) / 100 : 0;
    const total = subtotal + shipping + tax - couponDiscount;


    if (loading && !cart) {
        return (
            <div className="container flex justify-center items-center py-20 font-['Inter',sans-serif]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    const handleclick = () => {
        navigate('/checkout');
    }

    return (
        <div className="container font-['Inter',sans-serif] pb-12">
            <div className="bg-white pt-8 pb-6 px-4 mb-8">
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
                            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Shopping Cart</h1>
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

            <div className="px-4">
                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="w-full lg:w-2/3 flex flex-col gap-4">
                            {cartItems.map((wish) => {
                                const item = wish.productId;
                                if (!item) return null;
                                const prodId = item._id || item;
                                return (
                                    <div key={wish._id} className="bg-white rounded-md border border-[var(--border)] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all">
                                        <div className="w-full sm:w-28 h-28 shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                                            <img
                                                src={item.images?.[0]?.url || item.images?.[0] || item.image || item.image?.[0] || 'https://via.placeholder.com/400'}
                                                alt={item.name || item.productName || 'Product'}
                                                className="w-full h-full object-contain mix-blend-multiply rounded-md"
                                            />
                                        </div>

                                        <div className="flex-1 w-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-light)] px-2.5 py-1 rounded-sm mb-2 inline-block">
                                                        {wish.categoryName || item.category?.categoryName || "Grocery"}
                                                    </span>
                                                    <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1 leading-tight"><Link to={`/product/${item._id}`} className="hover:text-[var(--primary)] transition-colors">{item.name || item.productName}</Link></h3>
                                                    {wish.variantId && wish.selectedVariant && (
                                                        <p className="text-xs font-bold text-gray-500 mb-1">
                                                            Weight: {wish.selectedVariant.weight} {wish.selectedVariant.unit}
                                                        </p>
                                                    )}
                                                    <p className="text-[var(--text-secondary)] font-medium">₹{wish.selectedVariant?.price || 0} each</p>

                                                </div>
                                                <span className="font-bold text-xl text-[var(--text-primary)]">
                                                    ₹{((wish.selectedVariant?.price || 0) * wish.quantity).toFixed(2)}
                                                </span>

                                            </div>

                                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border)] border-dashed">
                                                <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                                                    <button onClick={() => handleUpdateQuantity(prodId, wish.variantId, wish.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[var(--primary)] transition-colors">
                                                        <Minus size={14} strokeWidth={2.5} />
                                                    </button>
                                                    <input type="text" readOnly value={wish.quantity} className="w-10 h-9 bg-transparent text-center font-bold text-[var(--text-primary)] text-sm focus:outline-none" />
                                                    <button onClick={() => handleUpdateQuantity(prodId, wish.variantId, wish.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[var(--primary)] transition-colors">
                                                        <Plus size={14} strokeWidth={2.5} />
                                                    </button>
                                                </div>

                                                <button onClick={() => handleRemoveFromCart(prodId, wish.variantId)} className="flex items-center gap-1.5 text-sm font-[500] text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                                    <Trash2 size={16} /> <span className="hidden sm:inline">Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="w-full lg:w-1/3 sticky top-6 flex flex-col gap-4">

                            {/* ── Coupon Card ── */}
                            <div className="bg-white rounded-md border border-[var(--border)] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-[var(--primary-light)] rounded-lg flex items-center justify-center">
                                        <Ticket size={16} className="text-[var(--primary)]" />
                                    </div>
                                    <h3 className="text-base font-bold text-[var(--text-primary)]">Apply Coupon</h3>
                                </div>

                                {appliedCoupon ? (
                                    /* Applied coupon pill */
                                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-green-800 leading-tight">{appliedCoupon.code}</p>
                                                <p className="text-xs text-green-600 mt-0.5">{appliedCoupon.label}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="w-7 h-7 flex items-center justify-center text-green-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                                            title="Remove coupon"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    /* Coupon input */
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                    placeholder="Enter coupon code"
                                                    className={`w-full pl-8 pr-3 py-2.5 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all bg-[var(--bg-main)] ${couponError
                                                        ? 'border-red-300 focus:ring-red-100 text-red-700 placeholder-red-300'
                                                        : 'border-[var(--border)] focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-[var(--text-primary)]'
                                                        }`}
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading}
                                                className="px-4 py-2.5 bg-[var(--primary)] text-white text-sm font-bold rounded-lg hover:bg-[var(--primary-hover)] transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                                            >
                                                {couponLoading ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                        Applying
                                                    </span>
                                                ) : 'Apply'}
                                            </button>
                                        </div>

                                        {/* Error message */}
                                        {couponError && (
                                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                <X size={12} /> {couponError}
                                            </p>
                                        )}

                                        {/* Available coupons hint */}
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            {Object.keys(validCoupons).map((code) => (
                                                <button
                                                    key={code}
                                                    onClick={() => { setCouponCode(code); setCouponError(''); }}
                                                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] rounded border border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white transition-colors"
                                                >
                                                    {code}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Order Summary Card ── */}
                            <div className="bg-white rounded-md border border-[var(--border)] p-6 lg:p-8">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Order Summary</h2>

                                <div className="space-y-4 text-sm font-medium mb-6">
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span className="text-[var(--text-primary)]">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Estimated Tax (8%)</span>
                                        <span className="text-[var(--text-primary)]">₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-[var(--primary)] font-bold">Free</span>
                                        ) : (
                                            <span className="text-[var(--text-primary)]">₹{shipping.toFixed(2)}</span>
                                        )}
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span className="flex items-center gap-1">
                                                <Tag size={12} /> Coupon ({appliedCoupon.code})
                                            </span>
                                            <span className="font-bold">-₹{couponDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {appliedCoupon?.type === 'shipping' && shippingBase > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span className="flex items-center gap-1">
                                                <Tag size={12} /> Coupon ({appliedCoupon.code})
                                            </span>
                                            <span className="font-bold">-${shippingBase.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-[var(--border)] pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-[var(--text-primary)]">Total</span>
                                        <span className="text-2xl font-bold text-[var(--text-primary)]">₹{total.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 text-right">Pre-tax currency INR</p>
                                </div>

                                <button onClick={handleclick} className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--primary)] text-white rounded-md font-[500] text-lg hover:bg-[var(--primary-hover)] transition-all duration-300 shadow-md shadow-[var(--primary)]/20 active:scale-95 mb-4 border border-transparent">
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
                    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-md border border-[var(--border)] text-center">
                        <div className="w-28 h-28 bg-[var(--bg-main)] text-gray-300 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[var(--border)]">
                            <ShoppingBag size={56} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">Your cart is empty</h2>
                        <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto mb-8 leading-relaxed font-medium">
                            Looks like you haven't added any fresh groceries to your cart yet. Let's fix that!
                        </p>
                        <Link to="/" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[var(--primary)] text-white rounded-md font-bold hover:bg-[var(--primary-hover)] transition-all duration-300 hover:shadow-[var(--primary)]/30 active:scale-95 text-lg">
                            Return to Shop
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;

