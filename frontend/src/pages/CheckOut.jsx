import React, { useState } from 'react';
import { ChevronRight, Banknote } from 'lucide-react';
import {  FaStripe } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { createOrder as triggerCreateOrder } from '../redux/slice/order.slice';
import {  removeCoupon } from '../redux/slice/cart.slice';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '../redux/slice/address.slice';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import DeleteModal from '../admin/component/DeleteModal';


const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { loading: orderLoading } = useSelector(state => state.order);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { cart, appliedCoupon } = useSelector(state => state.cart);
  const { addresses, submitLoading } = useSelector(state => state.address);
  const items = cart?.items || [];

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const appliedCouponData = React.useMemo(() => {
    if (appliedCoupon) return appliedCoupon;
    try {
      const stored = localStorage.getItem('appliedCoupon');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }, [appliedCoupon]);

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

  const hasOutOfStockItems = items.some(item => {
    const variant = item.selectedVariant;
    if (!variant) return false;
    return variant.stock !== undefined && (variant.stock <= 0 || item.quantity > variant.stock);
  });

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
  
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

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


  const handleAddressSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (editingAddress) {
        await dispatch(updateAddress({ addressId: editingAddress._id, addressData: values })).unwrap();
      } else {
        await dispatch(addAddress(values)).unwrap();
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      // error toast handled by slice
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = (id) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (addressToDelete) {
      try {
        await dispatch(deleteAddress(addressToDelete)).unwrap();
        setIsDeleteModalOpen(false);
        setAddressToDelete(null);
      } catch (error) {
        // error toast handled by slice
        console.error(error);
      }
    }
  };

  const handlePlaceOrder = async () => {
    
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
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

      if (hasOutOfStockItems) {
        toast.error("Some items in your cart are out of stock. Please update your cart.");
        navigate('/cart');
        return;
      }

      const orderData = {
        userId: currentUserId,
        items: items.map(item => ({
          productId: item.productId?._id || item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.selectedVariant?.price || 0,
          discountPrice: item.selectedVariant?.discountPrice !== undefined ? item.selectedVariant.discountPrice : null,
          sellerId: item.productId?.sellerId || item.sellerId
        })),
        totalAmount: totalAmount,
        couponId: appliedCouponData?._id || null,
        couponCode: appliedCouponData?.code || null,
        couponDiscount: couponDiscount,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Stripe',
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
        }
      };

      const resultAction = await dispatch(triggerCreateOrder(orderData));

      if (triggerCreateOrder.fulfilled.match(resultAction)) {
        const data = resultAction.payload.data;
        const newOrderId = data?.orderId || data?.order?._id || data?._id;

        dispatch(removeCoupon());
        localStorage.removeItem('appliedCoupon');

        if (data?.paymentUrl) {
          // Stripe Redirect
          window.location.href = data.paymentUrl;
        } else {
          // data is an array of orders for COD
          if (Array.isArray(data) && data.length > 0) {
            const allOrderIds = data.map(o => o._id).join(',');
            navigate(`/order-completed?order_ids=${allOrderIds}`);
          } else if (newOrderId) {
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

            {/* Left Column: Addresses */}
            <div className="lg:col-span-8">
              {/* Add Address Button */}
              <div
                className="bg-white rounded-[4px] border border-gray-100 p-4 mb-4 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
              >
                <FiPlus className="text-gray-800 font-bold" size={18} />
                <span className="text-gray-800 font-bold text-sm tracking-tight">Add address</span>
              </div>

              {/* Saved Addresses List */}
              <div className="space-y-4">
                {(!addresses || addresses.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-[4px] border border-dashed border-gray-200">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4 shadow-sm">
                      <FiMapPin size={28} />
                    </div>
                    <h3 className="text-[16px] font-bold text-[var(--text-gray)]">No Addresses Found</h3>
                    <p className="text-[13px] text-gray-500 mt-1.5 max-w-xs px-4">
                      Please add a shipping address to your account to proceed with checkout.
                    </p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr._id} className="bg-white rounded-[4px] border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddress?._id === addr._id}
                            onChange={() => {
                              setSelectedAddress(addr);
                              setUseSavedAddress(true);
                            }}
                            className="w-[18px] h-[18px] accent-[var(--primary)] cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[15px] text-[var(--text-gray)] mb-2">
                            {addr.firstname || addr.firstName} {addr.lastname || addr.lastName}
                          </h4>
                          <p className="text-[13px] text-gray-500 mb-1 leading-relaxed">
                            {addr.address}, {addr.city}, {addr.state} {addr.zip || addr.postcode}
                          </p>
                          <p className="text-[13px] text-gray-500 mb-4">
                            Phone : {addr.phone}
                          </p>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="px-4 py-1.5 border border-gray-200 text-[13px] font-medium text-gray-600 rounded-[4px] hover:bg-gray-50 transition-colors"
                            >
                              Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                              className="px-4 py-1.5 border border-gray-200 text-[13px] font-medium text-gray-600 rounded-[4px] hover:bg-gray-50 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                            {variant?.stock !== undefined && (variant.stock <= 0 || item.quantity > variant.stock) && (
                              <p className="text-[11px] text-red-500 font-bold mt-1 uppercase">
                                {variant.stock <= 0 ? "Out of Stock" : `Only ${variant.stock} available`}
                              </p>
                            )}
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

                </div>

                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <button
                  onClick={handlePlaceOrder}
                  disabled={orderLoading || hasOutOfStockItems}
                  className={`w-full text-white py-4 rounded font-[600] text-[16px] shadow-md flex justify-center items-center transition-all duration-300 ${(orderLoading || hasOutOfStockItems)
                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                    }`}
                >
                  {orderLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : hasOutOfStockItems ? "Fix Out of Stock Items" : "Place Order"}
                </button>



              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Address Edit/Add Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)}></div>
          <div className="bg-white rounded-[4px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[18px] font-bold text-[var(--text-gray)]">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <FiPlus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Formik
                initialValues={{
                  firstname: editingAddress?.firstname || '',
                  lastname: editingAddress?.lastname || '',
                  address: editingAddress?.address || '',
                  city: editingAddress?.city || '',
                  state: editingAddress?.state || '',
                  zip: editingAddress?.zip || '',
                  country: editingAddress?.country || 'India',
                  phone: editingAddress?.phone || '',
                  email: editingAddress?.email || user?.email || '',
                  isDefault: editingAddress?.isDefault || addresses.length === 0,
                }}
                validationSchema={Yup.object().shape({
                  firstname: Yup.string().required('First name is required'),
                  lastname: Yup.string().required('Last name is required'),
                  address: Yup.string().required('Address is required'),
                  city: Yup.string().required('City is required'),
                  state: Yup.string().required('State is required'),
                  zip: Yup.string().required('Zip is required'),
                  phone: Yup.string().required('Phone is required'),
                  email: Yup.string().email('Invalid email').required('Email is required'),
                })}
                onSubmit={handleAddressSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">First Name <span className="text-red-500">*</span></label>
                        <Field
                          name="firstname"
                          placeholder="First Name"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.firstname && touched.firstname
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.firstname && touched.firstname && <div className="mt-1 text-xs text-red-500 ml-1">{errors.firstname}</div>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">Last Name <span className="text-red-500">*</span></label>
                        <Field
                          name="lastname"
                          placeholder="Last Name"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.lastname && touched.lastname
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.lastname && touched.lastname && <div className="mt-1 text-xs text-red-500 ml-1">{errors.lastname}</div>}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">Street Address <span className="text-red-500">*</span></label>
                        <Field
                          name="address"
                          placeholder="Suite, building, street, etc."
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.address && touched.address
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.address && touched.address && <div className="mt-1 text-xs text-red-500 ml-1">{errors.address}</div>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">City <span className="text-red-500">*</span></label>
                        <Field
                          name="city"
                          placeholder="City"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.city && touched.city
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.city && touched.city && <div className="mt-1 text-xs text-red-500 ml-1">{errors.city}</div>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">State <span className="text-red-500">*</span></label>
                        <Field
                          name="state"
                          placeholder="State"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.state && touched.state
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.state && touched.state && <div className="mt-1 text-xs text-red-500 ml-1">{errors.state}</div>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">Zip Code <span className="text-red-500">*</span></label>
                        <Field
                          name="zip"
                          placeholder="Zip Code"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.zip && touched.zip
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.zip && touched.zip && <div className="mt-1 text-xs text-red-500 ml-1">{errors.zip}</div>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">Country <span className="text-red-500">*</span></label>
                        <Field
                          name="country"
                          placeholder="Country"
                          className="block w-full px-3 py-3 border border-gray-200 rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">Phone Number <span className="text-red-500">*</span></label>
                        <Field
                          name="phone"
                          placeholder="Phone Number"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.phone && touched.phone
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.phone && touched.phone && <div className="mt-1 text-xs text-red-500 ml-1">{errors.phone}</div>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block mb-2 ml-1">Email Address <span className="text-red-500">*</span></label>
                        <Field
                          name="email"
                          placeholder="Email for this address"
                          className={`block w-full px-3 py-3 border rounded-[4px] outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 ${errors.email && touched.email
                            ? 'border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                            }`}
                        />
                        {errors.email && touched.email && <div className="mt-1 text-xs text-red-500 ml-1">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Field
                        type="checkbox"
                        name="isDefault"
                        id="isDefault"
                        className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                      />
                      <label htmlFor="isDefault" className="text-sm font-medium text-gray-600 cursor-pointer">Set as default shipping address</label>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-3 px-4 rounded-[4px] transition-all duration-300 shadow-md transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(false)}
                        className="px-8 py-3 border border-gray-200 text-gray-500 rounded-[4px] font-medium text-sm hover:bg-gray-50 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setAddressToDelete(null); }}
        onConfirm={confirmDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        isLoading={submitLoading}
      />

    </div>
  );
};

export default CheckOut;