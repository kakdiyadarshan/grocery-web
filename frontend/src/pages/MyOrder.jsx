import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, Calendar, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserOrders, cancelOrder } from '../redux/slice/order.slice';
import { toast } from 'sonner';
import ConfirmDialog from '../component/ConfirmDialog';

const MyOrder = ({ isEmbedded = false }) => {
    const dispatch = useDispatch();
    const { orders: rawOrders, loading } = useSelector((state) => state.order);
    const [activeTab, setActiveTab] = useState('All');
    const [cancellingOrderId, setCancellingOrderId] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingCancelId, setPendingCancelId] = useState(null);

    useEffect(() => {
        dispatch(getUserOrders());
    }, [dispatch]);

    const handleCancelClick = (orderId, e) => {
        e.preventDefault();
        setPendingCancelId(orderId);
        setDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        setDialogOpen(false);
        const orderId = pendingCancelId;
        setPendingCancelId(null);

        try {
            setCancellingOrderId(orderId);
            const resultAction = await dispatch(cancelOrder(orderId));

            if (cancelOrder.fulfilled.match(resultAction)) {
                toast.success("Order cancelled successfully");
                dispatch(getUserOrders());
            } else {
                toast.error(resultAction.payload?.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error("Error cancelling order");
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleCancelDialog = () => {
        setDialogOpen(false);
        setPendingCancelId(null);
    };


    const handleCancelOrder = async (orderId, e) => {
        e.preventDefault();

        const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmCancel) return;

        try {
            setCancellingOrderId(orderId);
            const resultAction = await dispatch(cancelOrder(orderId));

            if (cancelOrder.fulfilled.match(resultAction)) {
                toast.success("Order cancelled successfully");
                dispatch(getUserOrders()); // Refresh order list
            } else {
                toast.error(resultAction.payload?.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error("Error cancelling order");
        } finally {
            setCancellingOrderId(null);
        }
    };

    const tabs = ['All', 'In Progress', 'Delivered', 'Cancelled'];

    const getDisplayStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'processing':
            case 'order placed':
                return 'In Progress';
            case 'out for delivery':
                return 'Out for Delivery';
            case 'completed':
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status || 'In Progress';
        }
    };

    const orders = (rawOrders || []).map(order => {
        const firstItem = order.items?.[0] || {};
        const product = firstItem.productId || {};

        return {
            id: order._id,
            displayId: `#${(order._id || "").toString().slice(-8).toUpperCase()}`,
            status: getDisplayStatus(order.displayStatus || order.status),
            date: new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            image: product.images?.[0]?.url || product.image || "https://via.placeholder.com/150",
            title: order.items?.map(item => item.productId?.name || 'Product').join(', '),
            price: order.totalAmount?.toFixed(2),
            rawOrder: order
        };
    });

    const filteredOrders = activeTab === 'All'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());

    return (
        <>
            <ConfirmDialog
                isOpen={dialogOpen}
                onConfirm={handleConfirmCancel}
                onCancel={handleCancelDialog}
                orderId={pendingCancelId}
            />
            <div className={`${isEmbedded ? 'w-full px-0 py-0' : 'container mx-auto px-4 py-8 max-w-5xl'}`}>
                {!isEmbedded && (
                    <div className=" py-8">
                        <div className=" mx-auto px-4 lg:px-6">
                            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1e5066] mb-3 text-left">My Orders</h1>
                            <div className="flex items-center gap-1 text-[14px] text-gray-500 font-medium">
                                <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link to="/" className="hover:text-[var(--primary)] transition-colors">My Account</Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="text-[var(--primary)] font-bold">My Orders</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col gap-4 ${isEmbedded ? 'mb-5' : 'mb-8'}`}>
                    <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]'
                                    : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-12 h-12 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Fetching your orders...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <Link
                                to={`/order-tracking/${order.id}`}
                                state={{ order: order.rawOrder }}
                                key={index}
                                className="border border-gray-200 rounded-2xl p-4 md:p-6 bg-white hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-2 md:gap-4 w-full block text-left"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-xs sm:text-sm ${order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled' ? 'bg-orange-50 text-orange-600' :
                                            order.status.toLowerCase() === 'delivered' ? 'bg-[#f4f8ec] text-[#6b9b3e]' :
                                                'bg-red-50 text-red-600'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status.toLowerCase() === 'in progress' ? 'bg-orange-500' :
                                                order.status.toLowerCase() === 'delivered' ? 'bg-[#6b9b3e]' :
                                                    'bg-red-500'
                                                }`}></span>
                                            {order.status}
                                        </span>
                                        {order.status.toLowerCase() === 'in progress' && (
                                            <span className="bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm border border-[var(--primary)]/10">
                                                2hr Express
                                            </span>
                                        )}
                                        <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {order.date}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 items-start md:items-center">
                                        <div className="relative shrink-0 mt-1 md:mt-0">
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 flex items-center justify-center">
                                                {order.image ? (
                                                    <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[var(--primary)] font-bold text-sm mb-1 truncate">Order ID: {order.displayId}</h4>
                                            <p className="text-gray-600 text-sm mb-2 md:mb-1 line-clamp-1">
                                                {order.title}
                                            </p>
                                            <p className="font-bold text-gray-900 text-[16px]">₹{order.price}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex shrink-0 ml-2 md:ml-4 items-center justify-center gap-3">
                                    {order.status.toLowerCase() === 'in progress' && (
                                        <button
                                            onClick={(e) => handleCancelClick(order.id, e)}
                                            disabled={cancellingOrderId === order.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
                                        >
                                            {cancellingOrderId === order.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <X className="w-3.5 h-3.5" />
                                            )}
                                            Cancel
                                        </button>
                                    )}
                                    <ChevronRight className="text-[var(--primary)] w-5 h-5" />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-1">No Orders Found</h3>
                            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                            <Link to="/category" className="inline-flex items-center justify-center px-6 py-2 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary-hover)] transition-all">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyOrder; 