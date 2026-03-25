import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Package, Truck, CheckCircle2, MapPin, Clock, ArrowLeft } from 'lucide-react';

const OrderTracking = () => {
    const location = useLocation();
    
    // Default fallback mock data if no state is passed
    const defaultData = {
        id: "ABC-6457321",
        status: "In progress",
        date: "10 May 2021",
        deliveryDate: "15 May 2021",
        items: [
            { name: "Chocolate Truffle Pastry", qty: 1, price: 25 },
            { name: "Chocolate Truffle Cake", qty: 1, price: 25 }
        ],
        trackingSteps: [
            { title: "Order Placed", date: "Today, 10:30 AM", status: "completed", icon: CheckCircle2 },
            { title: "Packed & Ready", date: "Today, 10:45 AM", status: "completed", icon: Package },
            { title: "Out for Delivery", date: "Today, 11:15 AM", status: "current", icon: Truck },
            { title: "Arrival (Estimated)", date: "By 12:30 PM", status: "upcoming", icon: Clock },
        ]   
    };

    const orderData = location.state?.order ? {
        ...defaultData,
        id: location.state.order.id,
        status: location.state.order.status,
        date: location.state.order.date,
        image: location.state.order.image,
        title: location.state.order.title,
        price: parseFloat(location.state.order.price),
        items: [
            { name: location.state.order.title, qty: 1, price: parseFloat(location.state.order.price) }
        ],
        // If status is Delivered, show all steps as completed
        trackingSteps: location.state.order.status.toLowerCase() === 'delivered' ? [
            { title: "Order Placed", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
            { title: "Packed & Ready", date: location.state.order.date, status: "completed", icon: Package },
            { title: "Out for Delivery", date: location.state.order.date, status: "completed", icon: Truck },
            { title: "Delivered", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
        ] : location.state.order.status.toLowerCase() === 'cancelled' ? [
            { title: "Order Placed", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
            { title: "Cancelled", date: location.state.order.date, status: "upcoming", icon: CheckCircle2 },
        ] : defaultData.trackingSteps
    } : defaultData;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <Link to="/my-order" className="flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Orders
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Express Delivery</h1>
                        <p className="text-[var(--primary)] font-bold flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" /> 
                            Guaranteed in 2 Hours
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Order ID: <span className="font-bold text-gray-900">{orderData.id}</span></p>
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <Truck className="w-3 h-3" />
                            Flash Delivery
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Tracking Stepper */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-[var(--primary)]" />
                                    Delivery Updates
                                </h3>

                                <div className="relative">
                                    {orderData.trackingSteps.map((step, index) => (
                                        <div key={index} className="flex gap-6 mb-10 last:mb-0 relative">
                                            {/* Line */}
                                            {index !== orderData.trackingSteps.length - 1 && (
                                                <div className={`absolute left-6 top-10 bottom-[-40px] w-0.5 ${
                                                    step.status === 'completed' ? 'bg-[var(--primary)]' : 'bg-gray-200'
                                                }`} />
                                            )}

                                            {/* Icon Circle */}
                                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 transition-all duration-300 ${
                                                step.status === 'completed' 
                                                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-light)]' 
                                                    : step.status === 'current'
                                                        ? 'bg-white border-2 border-[var(--primary)] text-[var(--primary)] animate-pulse'
                                                        : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <step.icon className="w-6 h-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-col justify-center">
                                                <h4 className={`text-lg font-bold ${
                                                    step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                                                }`}>
                                                    {step.title}
                                                </h4>
                                                <p className={`text-sm ${
                                                    step.status === 'upcoming' ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {step.date}
                                                </p>
                                            </div>

                                            {/* Current Indicator */}
                                            {step.status === 'current' && (
                                                <div className="ml-auto">
                                                    <span className="bg-[var(--primary-light)] text-[var(--primary)] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                        Live
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-[var(--primary-light)]/30 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <MapPin className="w-6 h-6 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Delivery Location</p>
                                        <p className="text-sm font-bold text-gray-900">456 Residential Area, City Square</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                            
                            <div className="space-y-4 mb-6">
                                {orderData.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{item.name}</span>
                                            <span className="text-gray-500">Qty: {item.qty}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                                <div className="flex justify-between text-gray-500 font-medium text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-bold">${orderData.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium text-sm">
                                    <span>Shipping</span>
                                    <span className="text-[var(--primary)] font-bold">FREE</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className="text-gray-900 font-black text-lg">Total</span>
                                    <span className="text-2xl font-black text-[var(--primary)]">${orderData.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] rounded-3xl p-8 text-white shadow-xl shadow-[var(--primary-light)]">
                            <h4 className="font-black text-xl mb-2 italic">Need Help?</h4>
                            <p className="text-white/80 text-sm mb-6 leading-relaxed">
                                Our support team is available 24/7 for any questions regarding your order.
                            </p>
                            <button className="w-full bg-white text-[var(--primary)] py-3 rounded-xl font-black text-sm hover:bg-gray-50 transition-colors shadow-lg">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking; 