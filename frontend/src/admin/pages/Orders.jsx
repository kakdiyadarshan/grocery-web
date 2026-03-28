import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../../redux/slice/order.slice';
import DataTable from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiCheck, FiX, FiShoppingCart, FiMapPin, FiPackage, FiClock, FiTruck, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { IMAGE_URL } from '../../utils/baseUrl';

const Orders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { allorders, loading } = useSelector((state) => state.order);

    console.log("____________-----allorders", allorders);
    const [statusUpdating, setStatusUpdating] = useState(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleStatusUpdate = useCallback(async (id, status) => {
        try {
            setStatusUpdating(id);
            // await dispatch(updateOrderStatus({ id, status })).unwrap();
        } finally {
            setStatusUpdating(null);
        }
    }, [dispatch]);

    // Determine possible next statuses
    const getNextStatusOptions = useCallback((currentStatus) => {
        const options = [];
        if (currentStatus === 'pending') options.push('processing', 'cancelled');
        if (currentStatus === 'processing') options.push('shipped', 'cancelled');
        if (currentStatus === 'shipped') options.push('delivered', 'cancelled');
        return options;
    }, []);

    const columns = useMemo(() => [
        {
            header: 'Order Info',
            accessor: '_id',
            searchKey: (data) => data._id + " " + data.user?.username,
            render: (data) => (
                <div className="flex flex-col gap-0.5">
                    <div className="font-bold text-textPrimary">
                        #{data._id.slice(-6).toUpperCase()}
                    </div>
                    <div className='text-xs text-textSecondary'>
                        By: {data.userId?.firstname + " " + data.userId?.lastname || 'Unknown User'}
                    </div>
                </div>
            )
        },
        {
            header: 'Order Date',
            accessor: 'createdAt',
            render: (data) => (
                <div className="flex items-center gap-2 text-textSecondary">
                    <FiClock size={12} className="text-textSecondary opacity-60" />
                    <span className="text-xs font-medium">
                        {new Date(data.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            header: 'Items',
            searchKey: (data) => data.items?.map((item) => item.product?.name).join(' '),
            accessor: 'items',
            render: (data) => (
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 overflow-hidden">
                        {data.items?.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 shadow-sm transition-transform hover:scale-110 hover:z-10"
                                title={item.product?.name}
                            >
                                {item.product?.images?.[0]?.url ? (
                                    <img
                                        src={item.product.images[0].url}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                                        <FiPackage />
                                    </div>
                                )}
                            </div>
                        ))}

                        {data.items?.length > 3 && (
                            <div className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                +{data.items.length - 3}
                            </div>
                        )}
                    </div>
                    <div className='text-xs flex items-center text-gray-500 whitespace-nowrap self-center pl-2 !ml-1'>
                        {data.items?.length} items
                    </div>
                </div>
            )
        },
        {
            header: 'Total',
            accessor: 'totalAmount',
            render: (data) => (
                <div className="text-sm font-medium text-textPrimary">
                    ${data.totalAmount.toFixed(2)}
                </div>
            )
        },
        {
            header: 'Payment',
            accessor: 'paymentMethod',
            render: (data) => (
                <div className="text-sm font-medium text-textPrimary">
                    {data.paymentMethod}
                </div>
            )
        },
        {
            header: 'Payment Status',
            accessor: 'paymentStatus'
        },
        {
            header: 'Order Status',
            accessor: 'orderStatus',
            render: (data) => (
                <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium border capitalize
                ${data.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        data.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            data.orderStatus === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                data.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {data.orderStatus}
                </span>
            )
        },
        {
            header: 'Shipping',
            searchKey: (data) => `${data.shippingAddress?.firstName} ${data.shippingAddress?.lastName} ${data.shippingAddress?.city} ${data.shippingAddress?.postcode}`,
            accessor: 'shippingAddress',
            render: (data) => (
                <div className='max-w-[150px] text-xs text-textSecondary truncate'>
                    <div className='font-medium text-textPrimary'>
                        {data.shippingAddress?.firstName} {data.shippingAddress?.lastName}
                    </div>
                    <div title={`${data.shippingAddress?.street}, ${data.shippingAddress?.city}`}>
                        {data.shippingAddress?.city}, {data.shippingAddress?.postcode}
                    </div>
                </div>
            )
        }
    ], []);

    const handleView = useCallback((item) => {
        navigate(`/admin/orders/${item._id}`);
    }, [navigate]);

    const handleDelete = useCallback((item) => {
        // dispatch(deleteOrder(item._id));
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-16 h-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FiShoppingCart className="text-primary animate-pulse" size={24} />
                    </div>
                </div>
                <p className="text-textSecondary font-medium animate-pulse">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Orders</h2>
                    <Breadcrumb />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={allorders || []}
                itemsPerPage={10}
                onView={handleView}
                onDelete={handleDelete}
                exportFileName="Orders"
                allowExport={true}
            />
        </div>
    );
};

export default Orders;
