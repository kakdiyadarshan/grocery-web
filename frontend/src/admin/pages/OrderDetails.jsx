import React, { useCallback, useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../redux/slice/order.slice';
import { FiArrowLeft, FiBox, FiCreditCard, FiMapPin, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiShoppingCart } from 'react-icons/fi';
import CustomSelect from '../component/CustomSelect';
import { IMAGE_URL } from '../../utils/baseUrl';
import AdminLoader from '../component/AdminLoader';

const TrackingNode = memo(({ title, time, time1, desc, isCompleted, isActive, isLast }) => {
    return (
        <div className="flex-1 relative flex flex-col items-center group">
            {!isLast && (
                <div className={`absolute left-[calc(50%+12px)] right-[-50%] top-[11px] h-[2px] transition-all duration-500 z-0 ${isCompleted ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]' : 'bg-borderColor'
                    }`}></div>
            )}

            <div className={`w-6 h-6 rounded-full border-4 transition-all duration-500 z-10 flex items-center justify-center mb-4 mt-[1px] ${isCompleted
                ? 'bg-primary border-primary/20 scale-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]'
                : isActive
                    ? 'bg-card border-primary ring-4 ring-primary/10'
                    : 'bg-card border-borderColor'
                }`}>
                {isCompleted ? (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                ) : isActive ? (
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                ) : null}
            </div>

            <div className="text-center px-2">
                <h5 className={`text-[13px] font-bold tracking-tight mb-1 transition-colors duration-300 ${isCompleted || isActive
                    ? 'text-textPrimary'
                    : 'text-textSecondary opacity-50'
                    }`}>
                    {title}
                </h5>
                {time && (
                    <>
                        <p className={`text-[9px] font-[600] uppercase tracking-widest mb-1 transition-colors duration-300 ${isCompleted || isActive
                            ? 'text-primary'
                            : 'text-textSecondary opacity-50'
                            }`}>
                            {time}
                        </p>
                        <p className={`text-[9px] font-[600] uppercase tracking-widest mb-1 transition-colors duration-300 ${isCompleted || isActive
                            ? 'text-primary'
                            : 'text-textSecondary opacity-50'
                            }`}>
                            {time1}
                        </p>
                    </>
                )}
                <p className={`text-[11px] leading-tight transition-colors duration-300 line-clamp-2 max-w-[140px] ${isCompleted || isActive
                    ? 'text-textSecondary'
                    : 'text-textSecondary opacity-30'
                    }`}>
                    {desc}
                </p>
            </div>
        </div>
    );
});

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentOrder, loading } = useSelector((state) => state.order);

    useEffect(() => {
        if (id) {
            dispatch(getOrderById(id));
        }
    }, [dispatch, id]);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'shipped': return 'text-violet-600 bg-violet-50 border-violet-200';
            case 'out for delivery': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'delivered':
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-200';
            default: return 'text-textSecondary bg-bgMain border-borderColor';
        }
    }, []);

    const getTextColor = useCallback((status) => {
        switch (status) {
            case 'pending': return 'text-amber-600';
            case 'processing': return 'text-blue-600';
            case 'shipped': return 'text-violet-600';
            case 'out for delivery': return 'text-orange-600';
            case 'delivered':
            case 'completed': return 'text-emerald-600';
            case 'cancelled': return 'text-rose-600';
            default: return 'text-textSecondary';
        }
    }, []);

    const getStatusIcon = useMemo(() => (status) => {
        switch (status) {
            case 'pending': return <FiClock />;
            case 'processing': return <FiBox />;
            case 'shipped': return <FiTruck />;
            case 'out for delivery': return <FiTruck />;
            case 'delivered':
            case 'completed': return <FiCheckCircle />;
            case 'cancelled': return <FiXCircle />;
            default: return <FiClock />;
        }
    }, []);

    const handleStatusChange = useCallback((val) => {
        if (currentOrder?._id) {
            dispatch(updateOrderStatus({ id: currentOrder._id, status: val }));
        }
    }, [dispatch, currentOrder]);


    const trackingMap = useMemo(() => {
        const map = {};
        currentOrder?.trackingHistory?.forEach(entry => {
            map[entry.status.toLowerCase()] = entry;
        });
        return map;
    }, [currentOrder?.trackingHistory]);

    const formatDateTime = useCallback((timestamp) => {
        if (!timestamp) return { date: '', time: '' };
        const dateObj = new Date(timestamp);
        return {
            date: dateObj.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: dateObj.toLocaleTimeString()
        };
    }, []);

    const orderJourneyNodes = useMemo(() => {
        if (!currentOrder) return null;

        const { status: orderStatus } = currentOrder;

        const nodes = [
            {
                id: 'pending',
                title: "Order Received",
                descDefault: "Successfully placed and payment confirmed.",
                checkCompleted: () => true
            },
            {
                id: 'processing',
                title: "Processing",
                descDefault: "Quality check and packaging in progress.",
                checkCompleted: (status) => ['processing', 'shipped', 'out for delivery', 'delivered'].includes(status)
            },
            {
                id: 'shipped',
                title: "Shipped",
                descDefault: "Package handed over to our delivery partner.",
                checkCompleted: (status) => ['shipped', 'out for delivery', 'delivered'].includes(status)
            },
            {
                id: 'out for delivery',
                title: "Out for Delivery",
                descDefault: "Agent is on the way to your address.",
                checkCompleted: (status) => ['out for delivery', 'delivered'].includes(status)
            },
            {
                id: 'delivered',
                title: "Delivered",
                descDefault: "Successfully received by customer.",
                checkCompleted: (status) => ['delivered', 'completed'].includes(status),
                isLast: true
            }
        ];

        return nodes.map(node => {
            const entry = trackingMap[node.id];
            const { date, time } = formatDateTime(entry?.timestamp);

            return (
                <TrackingNode
                    key={node.id}
                    title={node.title}
                    time={date}
                    time1={time}
                    desc={entry?.description || node.descDefault}
                    isCompleted={node.checkCompleted(orderStatus)}
                    isActive={orderStatus === node.id}
                    isLast={node.isLast}
                />
            );
        });
    }, [currentOrder, trackingMap, formatDateTime]);

    if (loading) {
        return <AdminLoader message="Loading Order..." icon={FiShoppingCart} />;
    }
    if (!currentOrder) {
        return (
            <div className="text-center py-20 bg-card rounded-xl border border-borderColor shadow-sm">
                <p className="text-lg text-textSecondary font-medium">Order not found.</p>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="mt-6 px-6 py-2.5 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-all shadow-sm font-medium"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    // Destructure after checking currentOrder exists
    const { userId, items, totalAmount, address, paymentMethod, payment, status, createdAt, couponId } = currentOrder;

    const subtotal = items.reduce((acc, item) => {
        const price = item.selectedVariant?.discountPrice ?? item.selectedVariant?.price ?? 0;
        return acc + (price * item.quantity);
    }, 0);

    const tax = subtotal * 0.08;
    const shipping = items.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 md:my-6 my-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-full bg-card hover:bg-bgMain border border-borderColor transition-all group"
                    >
                        <FiArrowLeft size={20} className="text-textSecondary group-hover:text-primary transition-colors" />
                    </button>
                    <div>
                        <h2 className="sm:text-2xl text-xl font-bold text-textPrimary tracking-tight flex items-center gap-3">
                            Order #{currentOrder._id.slice(-6).toUpperCase()}
                        </h2>
                        <p className="text-sm text-textSecondary mt-0.5 font-medium">
                            Placed on {new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })} at {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className={`px-4 py-1.5 rounded-[4px] text-xs font-bold capitalize tracking-widest border flex items-center gap-2 shadow-sm ${getStatusColor(status)}`}>
                    {getStatusIcon(status)} {status}
                </div>
            </div>

            <div className='bg-card rounded-[4px] shadow-sm border border-borderColor'>
                <div className="px-5 py-4 border-b border-borderColor flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bgMain/50">
                    <h3 className="font-[600] text-textPrimary flex items-center gap-2">
                        <FiBox className="text-primary" /> Order Management
                    </h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-xs font-bold text-textSecondary tracking-wider hidden sm:block">Status:</span>
                        <CustomSelect
                            value={status}
                            onChange={handleStatusChange}
                            searchable={false}
                            options={[
                                { value: 'pending', label: 'Pending', icon: <FiClock /> },
                                { value: 'processing', label: 'Processing', icon: <FiBox /> },
                                { value: 'shipped', label: 'Shipped', icon: <FiTruck /> },
                                { value: 'out for delivery', label: 'Out for Delivery', icon: <FiTruck /> },
                                { value: 'delivered', label: 'Delivered', icon: <FiCheckCircle /> },
                                // { value: 'cancelled', label: 'Cancelled', icon: <FiXCircle /> }
                            ]}
                            className="min-w-[200px] w-full sm:w-auto"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-[4px] shadow-sm border border-borderColor overflow-hidden">
                        <div className="px-5 py-4 border-b border-borderColor flex justify-between items-center bg-bgMain/50">
                            <h3 className="font-[600] text-textPrimary flex items-center gap-2">
                                <FiBox className="text-primary" /> Product Items
                            </h3>
                            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">{items.length} Units</span>
                        </div>
                        <div className="divide-y divide-borderColor overflow-x-auto no-scrollbar">
                            <div className='min-w-[500px]'>
                                {items.map((item, index) => (
                                    <div key={index} className="px-6 py-5 flex gap-5 items-center hover:bg-bgMain/30 transition-colors group">
                                        <div className="w-20 h-20 rounded-lg bg-bgMain overflow-hidden flex-shrink-0 border border-borderColor group-hover:border-primary/30 transition-all shadow-sm">
                                            {item.productId?.images?.[0]?.url ? (
                                                <img src={item.productId.images[0].url} alt={item.productId.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-textSecondary opacity-30">
                                                    <FiBox size={30} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-textPrimary text-base mb-1 group-hover:text-primary transition-colors">{item.productId?.name || 'Unknown Product'}</h4>
                                            <div className='text-textSecondary text-sm font-medium mt-1'>
                                                {item?.selectedVariant?.weight} {item?.selectedVariant?.unit}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="font-bold text-textPrimary text-base">
                                                    ${(item?.selectedVariant?.discountPrice || item?.selectedVariant?.price)?.toFixed(2)}
                                                </p>
                                                {item?.selectedVariant?.discountPrice !== null && item?.selectedVariant?.discountPrice < item?.selectedVariant?.price && (
                                                    <span className="text-[12px] text-textSecondary line-through font-medium">
                                                        ${item?.selectedVariant?.price?.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-textSecondary font-medium mt-0.5">Quantity: {item?.quantity}</p>
                                            <p className="font-black text-primary mt-2 text-base">
                                                ${((item?.selectedVariant?.discountPrice || item?.selectedVariant?.price) * item?.quantity)?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-bgMain/50 flex justify-end border-t border-borderColor">
                            <div className="w-full max-w-xs space-y-3">
                                <div className="flex justify-between text-sm text-textSecondary font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-textPrimary font-bold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-textSecondary font-medium">
                                    <span>Estimated Tax (8%)</span>
                                    <span className="text-textPrimary font-bold">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-textSecondary font-medium">
                                    <span>Shipping Fee</span>
                                    {shipping === 0 ? (
                                        <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                                    ) : (
                                        <span className="text-textPrimary font-bold">${shipping.toFixed(2)}</span>
                                    )}
                                </div>
                                {couponId && couponId.code && (
                                    <div className="flex justify-between text-primary text-sm">
                                        <span className="flex items-center gap-1">
                                            Coupon ({couponId.code}) - {couponId.discount}% off
                                        </span>
                                        <span className="font-[600]">(-${((subtotal * couponId.discount) / 100).toFixed(2)})</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black text-textPrimary border-t border-borderColor pt-4 mt-2">
                                    <span>Total Amount</span>
                                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Shipping Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-card rounded-[4px] shadow-sm border border-borderColor p-5 group transition-all hover:border-primary/20">
                        <h3 className="font-[600] text-textPrimary mb-5 pb-3 border-b border-borderColor flex items-center gap-2">
                            Customer Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl border border-primary/20 shadow-sm">
                                    {userId?.firstname?.charAt(0).toUpperCase() + userId?.lastname?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-textPrimary text-base truncate">{userId?.firstname + " " + userId?.lastname || 'Guest Customer'}</p>
                                    <p className="text-xs text-textSecondary font-medium truncate">{userId?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-card rounded-[4px] shadow-sm border border-borderColor p-5 group transition-all hover:border-primary/20">
                        <h3 className="font-[600] text-textPrimary mb-5 pb-3 border-b border-borderColor flex items-center gap-2">
                            <FiMapPin className="text-primary" /> Shipping Details
                        </h3>
                        {address ? (
                            <div className="text-sm text-textSecondary space-y-2 leading-relaxed">
                                <p className="font-bold text-textPrimary text-base">{address.firstname} {address.lastName}</p>
                                <p className="font-bold text-textPrimary text-base">{address.email}</p>
                                <div className="flex flex-col gap-1">
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0"></span> {address.address}</p>
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0"></span> {address.city}, {address.state}</p>
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0"></span> {address.country} </p>
                                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0"></span>ZIP : {address.zip}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-borderColor flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-bgMain flex items-center justify-center text-primary border border-borderColor">
                                        <FiTruck size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-bold text-textPrimary tracking-tight">Phone: {address.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-textSecondary italic py-2">No shipping address provided</p>
                        )}refunded
                    </div>

                    {/* Payment Info */}
                    <div className="bg-card rounded-[4px] shadow-sm border border-borderColor p-5 group transition-all hover:border-primary/20">
                        <h3 className="font-[600] text-textPrimary mb-5 pb-3 border-b border-borderColor flex items-center gap-2">
                            <FiCreditCard className="text-primary" /> Payment Method
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center rounded-[4px]">
                                <span className="text-xs font-bold text-textSecondary capitalize">Method</span>
                                <span className="font-bold text-textPrimary text-sm">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center rounded-[4px]">
                                <span className="text-xs font-bold text-textSecondary capitalize">Status</span>
                                <span className={`text-[10px] font-[600] capitalize tracking-widest px-2.5 py-1 rounded-[4px] border shadow-sm ${payment[0]?.status === 'completed' || payment[0]?.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                    payment[0]?.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                        payment[0]?.status === 'refunded' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                            'bg-amber-50 text-amber-600 border-amber-200'
                                    }`}>
                                    {payment[0]?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-[4px] shadow-sm border border-borderColor overflow-hidden">
                <div className="px-5 py-4 border-b border-borderColor flex justify-between items-center bg-bgMain/50">
                    <h3 className="font-[600] text-textPrimary flex items-center gap-2">
                        Execution Workflow
                    </h3>
                    <span className={`text-[10px] font-[600] capitalize tracking-widest px-2.5 py-1 rounded-[4px] border shadow-sm ${getStatusColor(status)}`}>
                        {status}
                    </span>
                </div>
                <div className="p-8">
                    <div className="flex flex-row items-start justify-between relative overflow-x-auto pb-4 no-scrollbar min-w-[700px]">
                        {orderJourneyNodes}
                    </div>

                    {status === 'cancelled' && (
                        <div className="mt-12 p-6 bg-rose-50 border border-rose-100 rounded-[4px] flex items-center gap-5 text-rose-600 shadow-sm shadow-rose-100/50">
                            <div className="p-4 bg-rose-100 rounded-full">
                                <FiXCircle className="text-3xl" />
                            </div>
                            <div>
                                <p className="font-[600] text-lg capitalize tracking-tight">Order Revoked</p>
                                <p className="text-sm font-medium opacity-90 mt-1">This order was cancelled by the system or administrator. No further logistics will be processed.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
