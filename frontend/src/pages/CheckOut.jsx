import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { ChevronRight, CreditCard, Wallet, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />
      
      {/* Breadcrumb / Page Title */}
      <div className="bg-gray-50 py-8 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-6">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1e5066] mb-3">Checkout</h1>
          <div className="flex items-center gap-2 text-[14px] text-gray-500 font-medium">
            <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/cart" className="hover:text-[var(--primary)] transition-colors">Shopping Cart</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[var(--primary)] font-bold">Checkout</span>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <main className="flex-grow py-10 sm:py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Column: Billing Details */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded border border-gray-100 p-6 sm:p-8 shadow-sm">
                <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--text-gray)] mb-6 border-b border-gray-100 pb-4">Billing Details</h2>
                
                <form className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">First Name <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" placeholder="e.g. John" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" placeholder="e.g. Doe" />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" placeholder="e.g. john@example.com" />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" placeholder="e.g. +1 234 567 8900" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Street Address <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors mb-4" placeholder="House number and street name" />
                    <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" placeholder="Apartment, suite, unit, etc. (optional)" />
                  </div>

                  {/* City & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-1">
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Country / Region <span className="text-red-500">*</span></label>
                      <select className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors bg-white appearance-none cursor-pointer">
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Town / City <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Postcode / ZIP <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors" />
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="pt-2">
                    <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Order Notes (Optional)</label>
                    <textarea rows="4" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors resize-none" placeholder="Notes about your order, e.g. special notes for delivery."></textarea>
                  </div>
                  
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded border border-gray-100 p-6 sm:p-8 shadow-sm lg:sticky lg:top-8">
                <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--text-gray)] mb-6 border-b border-gray-100 pb-4">Your Order</h2>
                
                {/* Items */}
                <div className="space-y-5 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-white rounded border border-gray-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                         <img src={require("../Image/mango.jpg")} alt="Product" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[14px] sm:text-[14.5px] font-bold text-[var(--text-gray)] line-clamp-2 leading-snug">Curate Mango Mallika Large Premium</h4>
                        <p className="text-[13px] text-gray-500 mt-1">Qty: 1</p>
                      </div>
                    </div>
                    <span className="text-[15px] font-bold text-[var(--text-gray)] shrink-0">$32.00</span>
                  </div>
                </div>

                {/* Subtotals */}
                <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-500">Subtotal</span>
                    <span className="text-[15px] font-bold text-[var(--text-gray)]">$32.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-500">Shipping</span>
                    <span className="text-[14.5px] font-bold text-[var(--primary)]">Free shipping</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-500">Tax</span>
                    <span className="text-[15px] font-bold text-[var(--text-gray)]">$0.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                  <span className="text-[17px] font-bold text-[var(--text-gray)]">Total</span>
                  <span className="text-[22px] font-bold text-[var(--primary)]">$32.00 <span className="text-sm font-bold text-gray-500">USD</span></span>
                </div>

                {/* Payment Methods */}
                <h3 className="text-[15px] font-bold text-[var(--text-gray)] mb-4">Payment Method</h3>
                <div className="space-y-3 mb-8">
                  {/* Card */}
                  <label className={`block border rounded p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-[var(--primary)] border-gray-300 focus:ring-[var(--primary)] accent-[var(--primary)]" />
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
                      <span className={`text-[14.5px] font-bold ${paymentMethod === 'card' ? 'text-[var(--primary)]' : 'text-gray-600'}`}>Credit / Debit Card</span>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`block border rounded p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-[var(--primary)] border-gray-300 focus:ring-[var(--primary)] accent-[var(--primary)]" />
                      <Truck className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
                      <span className={`text-[14.5px] font-bold ${paymentMethod === 'cod' ? 'text-[var(--primary)]' : 'text-gray-600'}`}>Cash on Delivery</span>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label className={`block border rounded p-4 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-4 h-4 text-[var(--primary)] border-gray-300 focus:ring-[var(--primary)] accent-[var(--primary)]" />
                      <Wallet className={`w-5 h-5 ${paymentMethod === 'paypal' ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
                      <span className={`text-[14.5px] font-bold ${paymentMethod === 'paypal' ? 'text-[var(--primary)]' : 'text-gray-600'}`}>PayPal</span>
                    </div>
                  </label>
                </div>

                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <button className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white py-4 rounded font-bold text-[16px] shadow-md flex justify-center items-center">
                  Place Order
                </button>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckOut;