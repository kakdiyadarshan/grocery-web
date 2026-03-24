import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { ChevronRight, Banknote } from 'lucide-react';
import { FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    city: '',
    zip: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (!/^\d*$/.test(value)) {
        setErrors(prev => ({
          ...prev,
          phone: "Only numbers are allowed"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          phone: ""
        }));
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit number";
    }
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.country) newErrors.country = "Please select a country";
    if (!formData.city.trim()) newErrors.city = "Town / City is required";
    if (!formData.zip.trim()) newErrors.zip = "ZIP/Postcode is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert("Order placed successfully!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">

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

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">First Name <span className="text-red-500">*</span></label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} placeholder="e.g. John" />
                      {errors.firstName && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} placeholder="e.g. Doe" />
                      {errors.lastName && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} placeholder="e.g. john@example.com" />
                      {errors.email && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} placeholder="e.g. +1 234 567 8900" />
                      {errors.phone && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Street Address <span className="text-red-500">*</span></label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors mb-2 ${errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} placeholder="House number and street name" />
                    {errors.address && <p className="text-red-500 text-[12px] mt-1 mb-2 font-medium">{errors.address}</p>}
                    <input type="text" className="w-full px-4 py-3 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14px] text-gray-700 transition-colors mt-2" placeholder="Apartment, suite, unit, etc. (optional)" />
                  </div>

                  {/* City & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-1">
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Country / Region <span className="text-red-500">*</span></label>
                      <select name="country" value={formData.country} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors bg-white appearance-none cursor-pointer ${errors.country ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`}>
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="CA">Canada</option>
                      </select>
                      {errors.country && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.country}</p>}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Town / City <span className="text-red-500">*</span></label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors ${errors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} />
                      {errors.city && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.city}</p>}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[14px] font-bold text-[var(--text-gray)] mb-2">Postcode / ZIP <span className="text-red-500">*</span></label>
                      <input type="text" name="zip" value={formData.zip} onChange={handleChange} className={`w-full px-4 py-3 rounded border outline-none text-[14px] text-gray-700 transition-colors ${errors.zip ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[var(--primary)]'}`} />
                      {errors.zip && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.zip}</p>}
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
                <div className="space-y-4 mb-8">

                  {/* Cash on Delivery */}
                  <label className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[var(--primary)] bg-blue-50/30 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'cod' ? 'border-[var(--primary)]' : 'border-gray-400'}`}>
                        {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </div>
                      <span className="text-[14.5px] font-bold text-[#1e5066]">Cash on Delivery</span>
                    </div>
                    <Banknote className="w-6 h-6 text-green-600 opacity-90" />
                  </label>

                  {/* UPI */}
                  <label className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[var(--primary)] bg-blue-50/30 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'upi' ? 'border-[var(--primary)]' : 'border-gray-400'}`}>
                        {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </div>
                      <span className="text-[14.5px] font-bold text-[#1e5066]">UPI</span>
                    </div>
                    <FaCcAmex className="w-6 h-6 text-[#2671B9] opacity-80" />
                  </label>

                  {/* Net Banking */}
                  <label className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-[var(--primary)] bg-blue-50/30 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'netbanking' ? 'border-[var(--primary)]' : 'border-gray-400'}`}>
                        {paymentMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </div>
                      <span className="text-[14.5px] font-bold text-[#1e5066]">Net Banking</span>
                    </div>
                    <FaCcMastercard className="w-6 h-6 text-[#eb001b]" />
                  </label>

                </div>

                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <button onClick={handlePlaceOrder} className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white py-4 rounded font-bold text-[16px] shadow-md flex justify-center items-center">
                  Place Order
                </button>

              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default CheckOut;