import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowLeft
} from 'lucide-react';

const OrderTracking = () => {
  const location = useLocation();

  const status = location.state?.order?.status?.toLowerCase();

  // ✅ Default fallback data
  const defaultData = {
    id: "ABC-6457321",
    status: "In progress",
    date: "10 May 2021",
    deliveryDate: "15 May 2021",
    price: 50,
    address: "456 Residential Area, City Square",
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

  // ✅ Build dynamic tracking steps
  const getTrackingSteps = () => {
    if (status === 'delivered') {
      return [
        { title: "Order Placed", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
        { title: "Packed & Ready", date: location.state.order.date, status: "completed", icon: Package },
        { title: "Out for Delivery", date: location.state.order.date, status: "completed", icon: Truck },
        { title: "Delivered", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
      ];
    }

    if (status === 'cancelled' || status === 'canceled') {
      return [
        { title: "Order Placed", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
        { title: "Cancelled", date: location.state.order.date, status: "completed", icon: CheckCircle2 },
      ];
    }

    return defaultData.trackingSteps;
  };

  // ✅ Final order data
  const orderData = location.state?.order
    ? {
        ...defaultData,
        id: location.state.order.id,
        status: location.state.order.status,
        date: location.state.order.date,
        title: location.state.order.title,
        image: location.state.order.image,
        price: Number(location.state.order.price) || 0,
        address: location.state.order.address || defaultData.address,
        items: [
          {
            name: location.state.order.title,
            qty: 1,
            price: Number(location.state.order.price) || 0
          }
        ],
        trackingSteps: getTrackingSteps()
      }
    : defaultData;

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Link to="/my-order" className="flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>

            <h1 className="text-3xl font-extrabold text-gray-900">Express Delivery</h1>

            <p className="text-[var(--primary)] font-bold flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4" />
              Guaranteed in 2 Hours
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-bold text-gray-900">{orderData.id}</span>
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
              <Truck className="w-3 h-3" />
              Flash Delivery
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Tracking */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border p-6">

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Delivery Updates
              </h3>

              {orderData.trackingSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4 mb-6">

                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl
                    ${step.status === 'completed' ? 'bg-[var(--primary)] text-white' :
                      step.status === 'current' ? 'border-2 border-[var(--primary)] text-[var(--primary)]' :
                      'bg-gray-200 text-gray-400'}`}>

                    <step.icon className="w-5 h-5" />
                  </div>

                  <div>
                    <p className={`font-bold ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500">{step.date}</p>
                  </div>
                </div>
              ))}

              {/* Address */}
              <div className="mt-6 flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <MapPin className="text-[var(--primary)]" />
                <p className="text-sm font-medium">{orderData.address}</p>
              </div>

            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border p-6">

              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              {orderData.items.map((item, i) => (
                <div key={i} className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <p className="font-bold">₹{item.price.toFixed(2)}</p>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{orderData.price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[var(--primary)]">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>

                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span>₹{orderData.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="mt-6 bg-[var(--primary)] text-white p-6 rounded-3xl">
              <h4 className="font-bold text-lg mb-2">Need Help?</h4>
              <p className="text-sm mb-4">Support team available 24/7</p>
              <button className="bg-white text-[var(--primary)] px-4 py-2 rounded-lg font-bold w-full">
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