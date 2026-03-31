import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { ChevronRight, Banknote, ChevronDown } from 'lucide-react';
import { FaCcMastercard, FaCcAmex, FaStripe } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BASE_URL } from '../utils/baseUrl';
import { toast } from 'sonner';
import { createOrder as triggerCreateOrder } from '../redux/slice/order.slice';
import { clearCart, removeCoupon } from '../redux/slice/cart.slice';
import { fetchAddresses } from '../redux/slice/address.slice';




const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const { loading: orderLoading } = useSelector(state => state.order);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { cart, appliedCoupon } = useSelector(state => state.cart);
  const { addresses } = useSelector(state => state.address);
  const items = cart?.items || [];

  const appliedCouponData = React.useMemo(() => {
    if (appliedCoupon) return appliedCoupon;
    try {
      const stored = localStorage.getItem('appliedCoupon');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }, [appliedCoupon]);

  console.log("items", items);
  // Calculate totals
  const subtotal = items.reduce((acc, item) => {
    const variant = item.selectedVariant;
    const price = variant?.discountPrice || variant?.price || 0;
    return acc + (price * item.quantity);
  }, 0);


  const shipping = items.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
  const tax = items.length > 0 ? (subtotal * 0.08) : 0;
  const couponDiscount = appliedCouponData ? (subtotal * appliedCouponData.discount) / 100 : 0;
  const totalAmount = parseFloat(Math.max(0, subtotal + shipping + tax - couponDiscount).toFixed(2));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    city: '',
    zip: '',
    upiId: '',
    selectedBank: ''
  });
  const [errors, setErrors] = useState({});
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const defaultAddress = addresses?.find(addr => addr.isDefault) || addresses?.[0] || null;

  React.useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  const mapCountryValue = (country) => {
    if (!country) return '';
    const normalized = country.toString().trim().toLowerCase();
    if (['in', 'india', 'ind', 'bharat'].includes(normalized)) return 'IN';
    if (['us', 'usa', 'united states', 'united states of america'].includes(normalized)) return 'US';
    if (['uk', 'united kingdom', 'great britain', 'britain'].includes(normalized)) return 'UK';
    if (['ca', 'canada'].includes(normalized)) return 'CA';
    return country;
  };

  React.useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
      setUseSavedAddress(true);
    }
  }, [defaultAddress]);

  React.useEffect(() => {
    if (useSavedAddress && selectedAddress) {
      setFormData(prev => ({
        ...prev,
        firstName: selectedAddress.firstName || selectedAddress.firstname || user?.firstName || user?.firstname || prev.firstName,
        lastName: selectedAddress.lastName || selectedAddress.lastname || user?.lastName || user?.lastname || prev.lastName,
        email: selectedAddress.email || user?.email || prev.email,
        phone: selectedAddress.phone || prev.phone,
        address: selectedAddress.address || prev.address,
        city: selectedAddress.city || prev.city,
        country: mapCountryValue(selectedAddress.country) || mapCountryValue(selectedAddress.countryName) || prev.country,
        zip: selectedAddress.zip || selectedAddress.postcode || prev.zip,
      }));
    }
  }, [useSavedAddress, selectedAddress, user]);

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank"
  ];

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

  const handlePlaceOrder = async () => {
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

    // Payment specific validation
    if (paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
      } else if (!/^[a-zA-Z0-9.\-_]{3,}@[a-zA-Z]{3,}$/.test(formData.upiId.trim())) {
        newErrors.upiId = "Enter a valid UPI ID (e.g., username@bank)";
      }
    }

    if (paymentMethod === 'netbanking' && !formData.selectedBank) {
      newErrors.selectedBank = "Please select a bank";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const currentUserId = user?._id || localStorage.getItem('userId');

      if (!currentUserId) {
        toast.error("Please login to place an order");
        return;
      }

      if (items.length === 0 || totalAmount === 0) {
        toast.error("Your cart is empty");
        return;
      }

      const orderData = {
        userId: currentUserId,
        items: items.map(item => ({
          productId: item.productId?._id || item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.selectedVariant?.price || 0,
          discountPrice: item.selectedVariant?.discountPrice !== undefined ? item.selectedVariant.discountPrice : null
        })),
        totalAmount: totalAmount,
        couponId: appliedCouponData?._id || null,
        couponCode: appliedCouponData?.code || null,
        couponDiscount: couponDiscount,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'netbanking' ? 'Bank' : 'Stripe',
        addressId: selectedAddress?._id || null,
        addressDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          country: formData.country
        },
        upiDetails: paymentMethod === 'upi' ? { upiId: formData.upiId } : undefined,
        bankDetails: paymentMethod === 'netbanking' ? { bankName: formData.selectedBank } : undefined
      };

      console.log("Placing Order with data:", orderData);


      const resultAction = await dispatch(triggerCreateOrder(orderData));

      if (triggerCreateOrder.fulfilled.match(resultAction)) {
        const data = resultAction.payload.data;
        const newOrderId = data?.orderId || data?.order?._id || data?._id;

        dispatch(removeCoupon());

        if (data?.paymentUrl) {
          // Clear cart before stripe redirect
          dispatch(clearCart());
          // Stripe Redirect
          window.location.href = data.paymentUrl;
        } else {
          // COD/UPI/Bank Success
          dispatch(clearCart());
          toast.success("Order placed successfully!");
          if (newOrderId) {
            navigate(`/order-completed?order_id=${newOrderId}`);
          } else {
            navigate('/order-completed');
          }
        }



      }
    } catch (error) {
      console.error("Order Error:", error);
    }
  };

  const handleNavigate = () => {
    navigate('/profile?tab=Address');
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">

      {/* Breadcrumb / Page Title */}
      <div className="bg-gray-50 py-8 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-6">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-textPrimary mb-3">Checkout</h1>
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
                <div className='mb-6 border-b border-gray-100 pb-4 flex justify-between items-center'>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--text-gray)] ">Billing Details</h2>
                  <button className='bg-[var(--primary)] text-white py-2 px-5 rounded text-sm' onClick={handleNavigate}>Manage Addresses</button>
                </div>
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
                <div className="space-y-5 mb-6 border-b border-gray-100 pb-6 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item) => {
                    const product = item.productId;
                    if (!product) return null;
                    const variant = item.selectedVariant;
                    const originalPrice = variant?.price || 0;
                    const price = variant?.discountPrice || originalPrice;
                    const hasOffer = price < originalPrice;
                    return (
                      <div key={item._id} className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 bg-white rounded border border-gray-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden text-[10px]">
                            <img src={product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/50'} alt="Product" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-[14px] sm:text-[14.5px] font-bold text-[var(--text-gray)] line-clamp-2 leading-snug">{product.name || product.productName}</h4>
                            <p className="text-[13px] text-gray-500 mt-1">
                              {variant && <span>{variant.weight} {variant.unit} | </span>}
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[15px] font-bold text-[var(--text-gray)] shrink-0">${(price * item.quantity).toFixed(2)}</span>
                          {hasOffer && (
                            <span className="text-[12px] text-gray-400 line-through font-medium">
                              ${(originalPrice * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && <p className="text-center text-gray-500 font-medium py-4">No items in cart</p>}
                </div>


                {/* Subtotals */}
                <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-500">Subtotal</span>
                    <span className="text-[15px] font-bold text-[var(--text-gray)]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-500">Shipping</span>
                    <span className="text-[14.5px] font-bold text-[var(--primary)]">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-500">Tax</span>
                    <span className="text-[15px] font-bold text-[var(--text-gray)]">${tax.toFixed(2)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="text-[14px] font-bold">Coupon ({appliedCouponData?.code})</span>
                      <span className="text-[15px] font-bold">-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
                  <span className="text-[17px] font-bold text-[var(--text-gray)]">Total</span>
                  <span className="text-[22px] font-bold text-[var(--primary)]">${totalAmount.toFixed(2)} <span className="text-sm font-bold text-gray-500">USD</span></span>
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

                  {/* Stripe Payment */}
                  <label className={`flex items-center justify-between border rounded-md p-4 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[var(--primary)] bg-blue-50/30 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'stripe' ? 'border-[var(--primary)]' : 'border-gray-400'}`}>
                        {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                      </div>
                      <span className="text-[14.5px] font-bold text-[#1e5066]">Stripe (Card Payment)</span>

                    </div>
                    <FaStripe className="w-8 h-8 text-[#635BFF] opacity-90" />
                  </label>


                  {/* UPI */}
                  <div className={`border rounded-md p-4 transition-all ${paymentMethod === 'upi' ? 'border-[var(--primary)] bg-blue-50/10 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <label className="flex items-center justify-between cursor-pointer" onClick={() => setPaymentMethod('upi')}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} readOnly className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'upi' ? 'border-[var(--primary)]' : 'border-gray-400'}`}>
                          {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                        </div>
                        <span className="text-[14.5px] font-bold text-[#1e5066]">UPI</span>
                      </div>
                      <FaCcAmex className="w-6 h-6 text-[#2671B9] opacity-80" />
                    </label>
                    {paymentMethod === 'upi' && (
                      <div className="mt-4 pt-4 border-t border-[var(--primary)]/10 animate-fadeIn">
                        <label className="block text-[13px] font-bold text-gray-600 mb-2 ms-0.5">UPI ID</label>
                        <input
                          type="text"
                          name="upiId"
                          value={formData.upiId}
                          onChange={handleChange}
                          placeholder="username@upi"
                          className="w-full px-4 py-2.5 rounded border border-gray-200 outline-none focus:border-[var(--primary)] text-[14.5px] text-gray-700 transition-colors bg-white shadow-sm"
                        />
                        {errors.upiId && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.upiId}</p>}
                      </div>
                    )}
                  </div>

                  {/* Net Banking */}
                  <div className={`border rounded-md p-4 transition-all ${paymentMethod === 'netbanking' ? 'border-[var(--primary)] bg-blue-50/10 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <label className="flex items-center justify-between cursor-pointer" onClick={() => setPaymentMethod('netbanking')}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} readOnly className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'netbanking' ? 'border-[var(--primary)]' : 'border-gray-400'}`}>
                          {paymentMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                        </div>
                        <span className="text-[14.5px] font-bold text-[#1e5066]">Net Banking</span>
                      </div>
                      <FaCcMastercard className="w-6 h-6 text-[#eb001b]" />
                    </label>
                    {paymentMethod === 'netbanking' && (
                      <div className="mt-4 pt-4 border-t border-[var(--primary)]/10 animate-fadeIn">
                        <label className="block text-[13px] font-bold text-gray-600 mb-2 ms-0.5">Select Bank</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                            className={`w-full px-4 py-2.5 rounded border border-gray-200 flex justify-between items-center bg-white text-[14.5px] shadow-sm transition-all ${isBankDropdownOpen ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/10' : 'hover:border-gray-300'}`}
                          >
                            <span className={formData.selectedBank ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                              {formData.selectedBank || "Select your bank"}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isBankDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                              {banks.map((bank) => (
                                <div
                                  key={bank}
                                  onClick={() => {
                                    setFormData({ ...formData, selectedBank: bank });
                                    setIsBankDropdownOpen(false);
                                    setErrors(prev => ({ ...prev, selectedBank: "" }));
                                  }}
                                  className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${formData.selectedBank === bank
                                    ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold'
                                    : 'text-gray-700 hover:bg-[var(--primary)] hover:text-white'
                                    }`}
                                >
                                  {bank}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {errors.selectedBank && <p className="text-red-500 text-[12px] mt-1.5 font-medium">{errors.selectedBank}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <button onClick={handlePlaceOrder} disabled={orderLoading} className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-white py-4 rounded font-bold text-[16px] shadow-md flex justify-center items-center disabled:opacity-50">
                  {orderLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Place Order"}
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