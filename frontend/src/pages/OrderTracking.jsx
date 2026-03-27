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
  ArrowLeft
} from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="py-20 text-center text-gray-400 font-bold">Connecting to live tracking...</div>;
  if (!data) return <div className="py-20 text-center text-red-500 font-bold">Order tracking currently unavailable.</div>;

  const displayId = `#${(data._id || "").toString().slice(-8).toUpperCase()}`;

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 ">
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
                  const Icon = step.status === "Packed & Ready" || step.status === "Processing" ? Package :
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
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <MapPin className="text-[var(--primary)] w-5 h-5 shrink-0 mt-0.5" />
                  {console.log("data", data)}

                  <p className="text-sm font-medium text-gray-700 leading-relaxed text-left">{data.address || "Your specified address"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Summary</h3>
            <div className="space-y-4 mb-8">
              {(data.items || []).map((item, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <div className="text-left"><p className="font-bold text-gray-800 text-sm">{item.productId?.name || 'Item'}</p><p className="text-[12px] text-gray-500">Qty: {item.quantity}</p></div>
                  <p className="font-bold text-gray-900 text-sm italic">₹{(item.selectedVariant?.price || 0) * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-dashed space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-900 font-bold">₹{data.totalAmount?.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-3 border-t"><span className="text-gray-900 font-black">Total</span><span className="text-xl font-black text-[var(--primary)]">₹{data.totalAmount?.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;