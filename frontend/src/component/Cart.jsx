import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ChevronDown, ShoppingBag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateCartQuantity } from '../redux/slice/cart.slice';

const Cart = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cart } = useSelector((state) => state.cart);
    // const [showInstructions, setShowInstructions] = useState(false);
    const [instructions, setInstructions] = useState('');

    const cartItems = cart?.items?.filter(item => item?.productId && (item.productId.name || item.productId.productName)) || [];
    const subtotal = cartItems.reduce((acc, item) => {
        const variant = item.selectedVariant;
        const price = Number(variant?.discountPrice || variant?.price || 0);
        const quantity = Number(item.quantity || 0);
        return acc + (price * quantity);
    }, 0);


    const handleUpdateQuantity = (productId, variantId, newQuantity) => {
        if (newQuantity < 1) return;
        dispatch(updateCartQuantity({ productId, variantId, quantity: newQuantity }));
    };

    const handleRemove = (productId, variantId) => {
        dispatch(removeFromCart({ productId, variantId }));
    };


    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-[60] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Cart Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[85vw] sm:w-[400px] max-w-[400px] bg-white z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="px-4 sm:px-6 py-5 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-gray)] tracking-wide">Your Cart ({cartItems.length})</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                    </button>
                </div>

                {/* Labels */}
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100 text-[12px] sm:text-[13px] text-gray-500 font-medium tracking-widest uppercase">
                    <span>Product</span>
                    <span>Total</span>
                </div>

                {/* Cart Items (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-8 text-[var(--text-gray)] overflow-x-hidden">
                    {cartItems.length > 0 ? (
                        cartItems.map((wish) => {
                            const item = wish.productId;
                            if (!item) return null;
                            const prodId = item._id || item;
                            const variant = wish.selectedVariant;
                            const originalPrice = variant?.price || 0;
                            const price = variant?.discountPrice || originalPrice;
                            const hasOffer = price < originalPrice;

                            return (
                                <div key={wish._id} className="flex justify-between items-start border-b border-gray-100 pb-8 gap-2">
                                    <div className="flex gap-2 sm:gap-4 flex-1 min-w-0">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden p-1">
                                            <img
                                                src={item.images?.[0]?.url || item.images?.[0] || item.image || item.image?.[0] || 'https://via.placeholder.com/100'}
                                                alt={item.name || item.productName || 'Product'}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <span className="text-[12px] sm:text-[13px] text-gray-400 tracking-wide truncate">
                                                {wish.categoryName || item.category?.categoryName || "Grocery"}
                                            </span>

                                            <span className="text-[14px] sm:text-[15px] font-medium leading-snug text-[var(--text-gray)] mt-0.5 break-words line-clamp-2">
                                                {item.name || item.productName}
                                                {(wish.selectedVariant || item.weighstWise?.[0]) && (
                                                    <span className="text-xs font-bold text-[var(--primary)] ml-1">
                                                        ({(wish.selectedVariant || item.weighstWise?.[0])?.weight} {(wish.selectedVariant || item.weighstWise?.[0])?.unit})
                                                    </span>
                                                )}
                                            </span>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[12px] sm:text-[13px] text-gray-500 truncate">${price.toFixed(2)} each</span>
                                                {hasOffer && (
                                                    <span className="text-[12px] text-text-secondary line-through">${originalPrice.toFixed(2)}</span>
                                                )}
                                            </div>



                                            {/* Controls */}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                                                <div className="flex items-center border border-gray-200 rounded px-2 w-[75px] sm:w-[85px] h-8 sm:h-9 justify-between">
                                                    <button onClick={() => handleUpdateQuantity(prodId, wish.variantId, wish.quantity - 1)} className="text-gray-400 hover:text-[var(--primary)] shrink-0 transition-colors">
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-[14px] sm:text-[15px] font-medium shrink-0">{wish.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(prodId, wish.variantId, wish.quantity + 1)}
                                                        disabled={variant?.stock !== undefined && wish.quantity >= variant.stock}
                                                        className={`text-gray-400 hover:text-[var(--primary)] shrink-0 transition-colors ${variant?.stock !== undefined && wish.quantity >= variant.stock ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button onClick={() => handleRemove(prodId, wish.variantId)} className="bg-[var(--primary)] text-white w-8 h-8 sm:w-9 sm:h-9 rounded flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors shrink-0">
                                                    <Trash2 className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                                                </button>

                                                {variant?.stock !== undefined && wish.quantity > variant.stock && (
                                                    <span className="text-[10px] text-red-500 font-bold w-full mt-1">
                                                        * Exceeds stock ({variant.stock} available)
                                                    </span>
                                                )}
                                                {variant?.stock <= 0 && (
                                                    <span className="text-[10px] text-red-500 font-bold w-full mt-1">
                                                        * Out of Stock
                                                    </span>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[var(--primary)] text-[14px] sm:text-[16px] shrink-0 whitespace-nowrap">${(price * (Number(wish.quantity) || 0)).toFixed(2)}</span>


                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <ShoppingBag size={48} className="mb-4 text-gray-300" />
                            <p className="text-sm font-medium">Your cart is empty</p>
                            <Link to="/" onClick={onClose} className="text-[var(--primary)] font-bold mt-2 text-sm hover:underline">Start Shopping</Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="px-4 sm:px-6 py-6 border-t border-gray-100 bg-white">
                        {/* <div className="mb-6 border-b border-gray-100 pb-6">
                            <button
                                onClick={() => setShowInstructions(!showInstructions)}
                                className="flex items-center justify-between w-full text-[14px] sm:text-[15px] text-[var(--text-gray)] group text-left"
                            >
                                <span className="truncate pr-2 font-medium group-hover:text-[var(--primary)] transition-colors">Order special instructions</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`} />
                            </button>
                            {showInstructions && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                                    <textarea
                                        className="w-full border border-gray-200 rounded p-3 text-[13.5px] text-gray-600 outline-none focus:border-[var(--primary)] transition-colors resize-none shadow-sm"
                                        rows="3"
                                        placeholder="Add any special instructions for your order..."
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                    ></textarea>
                                </div>
                            )}
                        </div>  */}

                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[var(--text-gray)] text-[15px] sm:text-[17px] tracking-wide shrink-0">Subtotal</span>
                            <span className="font-bold text-[var(--primary)] text-[15px] sm:text-[17px] tracking-wide shrink-0 whitespace-nowrap">${subtotal.toFixed(2)}</span>
                        </div>

                        <p className="text-[12px] sm:text-[13px] text-[var(--text-gray)] mb-6 opacity-80 break-words">Taxes and shipping calculated at checkout</p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={handleViewCart} className="flex-1 bg-gray-100 text-gray-700 py-3 sm:py-3.5 rounded text-[14px] sm:text-[15px] font-bold hover:bg-gray-200 transition-colors w-full">
                                View Cart
                            </button>
                            <button onClick={handleCheckout} className="flex-1 bg-[var(--primary)] text-white py-3 sm:py-3.5 rounded text-[14px] sm:text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-colors w-full">
                                Check Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
