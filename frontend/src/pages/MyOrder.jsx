import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, Calendar, ShoppingBag, X, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserOrders, cancelOrder } from '../redux/slice/order.slice';
import { toast } from 'sonner';
import ConfirmDialog from '../component/ConfirmDialog';
import ReviewModal from '../component/ReviewModal';
import { Star } from 'lucide-react';

const MyOrder = ({ isEmbedded = false }) => {
    const dispatch = useDispatch();
    const { orders: rawOrders, loading } = useSelector((state) => state.order);
    const [activeTab, setActiveTab] = useState('All');
    const [cancellingOrderId, setCancellingOrderId] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingCancelId, setPendingCancelId] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewProduct, setReviewProduct] = useState(null);

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


    const tabs = ['All', 'In Progress', 'Delivered', 'Cancelled'];

    const handleReviewClick = (order, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!order.items || order.items.length === 0) {
            toast.error("No products found in this order");
            return;
        }

        if (order.items.length > 1) {
            // Pass the whole items array for selection
            setReviewProduct(order.items);
        } else {
            // Pass just the single product
            const product = order.items[0]?.productId;
            if (product) {
                setReviewProduct(product);
            } else {
                toast.error("Product information not found");
                return;
            }
        }
        setReviewModalOpen(true);
    };

    const getDisplayStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'processing':
            case 'order placed':
            case 'shipped':
            case 'out for delivery':
                return 'In Progress';
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

        // Calculate original total to show savings if offer is active
        let originalTotal = 0;
        let hasActiveOffer = false;

        (order.items || []).forEach(item => {
            const variant = item.selectedVariant;
            if (variant) {
                originalTotal += (variant.price || 0) * (item.quantity || 1);
                if (variant.discountPrice !== null) {
                    hasActiveOffer = true;
                }
            }
        });

        return {
            id: order._id,
            displayId: `#${(order._id || "").toString().slice(-6).toUpperCase()}`,
            status: getDisplayStatus(order.displayStatus || order.status),
            date: new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            image: product.images?.[0]?.url || product.image || "https://via.placeholder.com/150",
            title: order.items?.map(item => item.productId?.name || 'Product').join(', '),
            price: order.totalAmount?.toFixed(2),
            originalPrice: originalTotal.toFixed(2),
            hasActiveOffer,
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
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => {
                    setReviewModalOpen(false);
                    setReviewProduct(null);
                }}
                product={reviewProduct}
            />
            <div className={`${isEmbedded ? 'w-full px-0 py-0' : 'container mx-auto px-4 py-8 max-w-5xl'}`}>
                {!isEmbedded && (
                    <div className=" py-8">
                        <div className=" mx-auto pr-4 lg:pr-6">
                            <h1 className="text-[28px] sm:text-[32px] font-bold text-textPrimary mb-3 text-left">My Orders</h1>
                            <div className="flex items-center gap-1 text-[14px] text-gray-500 font-medium">
                                <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <Link to="/profile?tab=My Orders" className="hover:text-[var(--primary)] transition-colors">My Account</Link>
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
                                className="border border-gray-200 rounded-2xl bg-white hover:shadow-md transition-shadow cursor-pointer w-full flex flex-col group overflow-hidden"
                            >
                                {/* Card Header - Status & Date */}
                                <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/30">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled' ? 'bg-orange-100 text-orange-600' :
                                            order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${order.status.toLowerCase() === 'in progress' ? 'bg-orange-500 animate-pulse' :
                                                order.status.toLowerCase() === 'delivered' ? 'bg-green-600' :
                                                    'bg-red-500'
                                                }`}></span>
                                            {order.status}
                                        </span>
                                        {order.status.toLowerCase() === 'in progress' && (
                                            <span className="bg-emerald-600 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight shadow-sm">
                                                Express
                                            </span>
                                        )}
                                        {order.rawOrder.payment && (order.rawOrder.payment[0] || order.rawOrder.payment.status) && (
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight shadow-sm transition-all ${(order.rawOrder.payment[0]?.status || order.rawOrder.payment.status)?.toLowerCase() === 'paid'
                                                ? 'bg-emerald-500 text-white'
                                                : (order.rawOrder.payment[0]?.status || order.rawOrder.payment.status)?.toLowerCase() === 'failed'
                                                    ? 'bg-rose-500 text-white'
                                                    : (order.rawOrder.payment[0]?.status || order.rawOrder.payment.status)?.toLowerCase() === 'refunded'
                                                        ? 'bg-purple-500 text-white'
                                                        : 'bg-amber-400 text-amber-900' // pending
                                                }`}>
                                                { (order.rawOrder.payment[0]?.status || order.rawOrder.payment.status) }
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-[11px] font-bold whitespace-nowrap bg-white/50 px-2 py-1 rounded-md border border-gray-100 ml-auto">
                                        <Calendar className="w-3 h-3" /> {order.date}
                                    </div>
                                </div>

                                {/* Card Body - Content */}
                                <div className="p-4 md:p-5 flex gap-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1 border border-gray-100 shrink-0 flex items-center justify-center shadow-sm">
                                        {order.image ? (
                                            <img src={order.image} alt={order.title} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-[var(--primary)] font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">
                                                Order ID: {order.displayId}
                                            </h4>
                                            <p className="text-gray-900 font-bold text-sm sm:text-base line-clamp-1 mb-1">
                                                {order.title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                                {order.rawOrder.address && (
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium capitalize">
                                                        <MapPin className="w-3 h-3 text-[var(--primary)]" /> {order.rawOrder.address.city}
                                                    </p>
                                                )}
                                                <p className="text-[11px] text-gray-500 font-medium">
                                                    Phone: {order.rawOrder.address?.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-[var(--primary)] text-lg sm:text-xl">${order.price}</p>
                                            {order.hasActiveOffer && parseFloat(order.originalPrice) > parseFloat(order.price) && (
                                                <span className="text-gray-400 text-xs line-through font-medium leading-none">${order.originalPrice}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex items-center">
                                        <ChevronRight className="text-gray-300 group-hover:text-[var(--primary)] w-6 h-6 transition-colors" />
                                    </div>
                                </div>

                                {/* Card Footer - Actions (Mobile Specific Layout) */}
                                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between sm:justify-end gap-3">
                                    <div className="sm:hidden flex items-center text-gray-400 gap-1 text-[11px] font-bold uppercase tracking-wider">
                                        Details <ChevronRight className="w-3 h-3" />
                                    </div>
                                        <div className="flex items-center gap-2">
                                            {['pending', 'processing'].includes(order.rawOrder.displayStatus || order.rawOrder.status) && (
                                                <button
                                                    onClick={(e) => handleCancelClick(order.id, e)}
                                                    disabled={cancellingOrderId === order.id}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-xs transition-all border border-red-100 disabled:opacity-50"
                                                >
                                                    {cancellingOrderId === order.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5" />
                                                    )}
                                                    Cancel Order
                                                </button>
                                            )}
                                            {order.status.toLowerCase() === 'delivered' && (
                                                <button
                                                    onClick={(e) => handleReviewClick(order.rawOrder, e)}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-bold text-xs transition-all border border-yellow-100 shadow-sm"
                                                >
                                                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                    Rate Product
                                                </button>
                                            )}
                                        </div>
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
                            <Link to="/shop" className="inline-flex items-center justify-center px-6 py-2 bg-[var(--primary)] text-white font-bold rounded-lg hover:bg-[var(--primary-hover)] transition-all">
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