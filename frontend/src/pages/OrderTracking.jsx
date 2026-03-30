import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/baseUrl';
import {
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowLeft,
  Star
} from 'lucide-react';
import ReviewModal from '../component/ReviewModal';

const OrderTracking = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/trackOrder/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
    const timer = setInterval(fetchTracking, 30000); // Refresh every 30s
    return () => clearInterval(timer);
  }, [id]);


  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Tracking your order...</p>
        </div>
      </div>
    );
  }

  const displayId = `#${(data?._id || "").toString().slice(-8).toUpperCase()}`;

  // Build delivery address from populated address object or use pre-computed string
  const getDeliveryAddress = () => {
    if (data.deliveryAddress) return data.deliveryAddress;
    if (data.address) {
      const addr = data.address;
      return `${addr.address}, ${addr.city}, ${addr.state} - ${addr.zip}, ${addr.country}`;
    }
    return 'Address not available';
  };

  const getDeliveryContact = () => {
    if (data.deliveryContact) return data.deliveryContact;
    if (data.address) {
      const addr = data.address;
      return `${addr.email} | ${addr.phone}`;
    }
    return '';
  };

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 ">
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewProduct(null);
        }}
        product={reviewProduct}
      />
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Link to="/my-order" className="flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>

            <h1 className="text-3xl font-extrabold text-gray-900">Express Delivery</h1>

            <p className="text-[var(--primary)] font-bold flex items-center gap-1.5 mt-2">
              <Clock className="w-4 h-4" />
              Guaranteed Delivery in 2 Hours
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-bold text-gray-900">{displayId}</span></p>
            <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
              <Truck className="w-3.5 h-3.5" />
              Flash Delivery
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-8 text-gray-900 border-b pb-4">Live Timeline</h3>

              <div className="relative">
                {data.steps.map((step, index) => {
                  const Icon = step.status === "Order Placed" ? Package :
                    step.status === "Processing" ? Package :
                      step.status === "Out for Delivery" ? Truck : CheckCircle2;
                  return (
                    <div key={index} className="flex gap-6 mb-10 relative">
                      {index < data.steps.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-10 -ml-[1px] ${step.isCompleted ? 'bg-[var(--primary)]' : 'bg-gray-100'}`} />
                      )}
                      <div className={`w-10 h-10 flex items-center justify-center rounded-2xl shrink-0 
                            ${step.isCompleted ? 'bg-[var(--primary)] text-white shadow-lg shadow-green-100 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-bold text-[16px] ${step.isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>{step.status}</p>
                        <p className="text-xs text-gray-400">{new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-8 border-t">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-left">Delivery Address</p>
                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                    <MapPin className="text-[var(--primary)] w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{getDeliveryAddress()}</p>
                    {getDeliveryContact() && <p className="text-xs text-gray-500 font-medium italic">{getDeliveryContact()}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
            <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">Order Summary</h3>
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(data.items || []).map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                    <img 
                      src={item.productId?.images?.[0]?.url || item.productId?.images?.[0] || 'https://via.placeholder.com/150?text=Product'} 
                      alt={item.productId?.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 text-[15px] line-clamp-1">{item.productId?.name || 'Item'}</p>
                    <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                      {item.selectedVariant?.weight} {item.selectedVariant?.unit} × {item.quantity}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                       <p className="font-extrabold text-[var(--primary)] text-sm">₹{(item.selectedVariant?.price || 0) * item.quantity}</p>
                       {(data.status?.toLowerCase() === 'delivered' || data.status?.toLowerCase() === 'completed') && (
                         <button
                           onClick={() => {
                             setReviewProduct(item.productId);
                             setReviewModalOpen(true);
                           }}
                           className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md hover:bg-yellow-100 transition-colors"
                         >
                           <Star className="w-3 h-3 fill-yellow-600" />
                           Rate
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-dashed space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">₹{data.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Shipping</span>
                <span className="text-green-600 font-bold uppercase text-[11px] tracking-wider bg-green-50 px-2 py-0.5 rounded-md">Free</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-gray-900 font-black text-lg">Total</span>
                <div className="text-right">
                   <span className="text-2xl font-black text-[var(--primary)]">₹{data.totalAmount?.toFixed(2)}</span>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Taxes Included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;