import React from 'react';
import { X, Minus, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/checkout');
    }
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-[60] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Cart Drawer - Using flexible max width to prevent screen overflow */}
            <div
                className={`fixed top-0 right-0 h-full w-[85vw] sm:w-[400px] max-w-[400px] bg-white z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="px-4 sm:px-6 py-5 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-gray)] tracking-wide">Your Cart</h2>
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

                    {/* Item 1 */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8 gap-2">
                        <div className="flex gap-2 sm:gap-4 flex-1 min-w-0">
                            {/* Product Image */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                                <img
                                    src={require("../Image/mango.jpg")}
                                    alt="Mango"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Product Details - Add min-w-0 here! */}
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <span className="text-[12px] sm:text-[13px] text-gray-400 tracking-wide truncate">Fruity-Liscious</span>
                                <span className="text-[14px] sm:text-[15px] font-medium leading-snug text-[var(--text-gray)] mt-0.5 break-words">
                                    Curate Mango Mallika<br className="hidden sm:block" /> Large Premium
                                </span>
                                <span className="text-[12px] sm:text-[13px] text-gray-500 mt-1 truncate">$32.00</span>
                                <span className="text-[12px] sm:text-[13px] text-gray-500 mt-1 truncate">No of Pcs: 4pcs</span>

                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-gray-200 rounded px-2 w-[75px] sm:w-[85px] h-8 sm:h-9 justify-between">
                                        <button className="text-gray-400 hover:text-[var(--primary)] shrink-0">
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-[14px] sm:text-[15px] font-medium shrink-0">1</span>
                                        <button className="text-gray-400 hover:text-[var(--primary)] shrink-0">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Delete Button */}
                                    <button className="bg-[var(--primary)] text-white w-8 h-8 sm:w-9 sm:h-9 rounded flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors shrink-0">
                                        <Trash2 className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Total Price */}
                        <span className="font-bold text-[var(--primary)] text-[14px] sm:text-[16px] shrink-0 whitespace-nowrap">$32.00</span>
                    </div>

                    {/* (No Item 2 implemented in user's most recent code block, but if we wanted another we'd just add another block identical to Item 1) */}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-6 border-t border-gray-100 bg-white">
                    {/* Order Special Instructions */}
                    <button className="flex items-center justify-between w-full text-[14px] sm:text-[15px] text-[var(--text-gray)] mb-6">
                        <span className="truncate pr-2">Order special instructions</span>
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    </button>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[var(--text-gray)] text-[15px] sm:text-[17px] tracking-wide shrink-0">Subtotal</span>
                        <span className="font-bold text-[var(--primary)] text-[15px] sm:text-[17px] tracking-wide shrink-0 whitespace-nowrap">$32.00 USD</span>
                    </div>

                    <p className="text-[12px] sm:text-[13px] text-[var(--text-gray)] mb-6 opacity-80 break-words">Taxes and shipping calculated at checkout</p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-[var(--primary)] text-white py-3 sm:py-3.5 rounded text-[14px] sm:text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-colors w-full">
                            View Cart
                        </button>
                        <button className="flex-1 bg-[var(--primary)] text-white py-3 sm:py-3.5 rounded text-[14px] sm:text-[15px] font-bold hover:bg-[var(--primary-hover)] transition-colors w-full" onClick={handleNavigate}>
                            Check Out
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Cart;