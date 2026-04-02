import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, deleteOrder, updateOrderStatus } from '../../redux/slice/order.slice';
import DataTable from '../component/DataTable';
import AdminLoader from '../component/AdminLoader';
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
            await dispatch(updateOrderStatus({ id, status })).unwrap();
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
            searchKey: (data) => data._id + " " + data.userId?.firstname + " " + data.userId?.lastname,
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
            searchKey: (data) => new Date(data.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
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
                        {data.items?.slice(0, 2).map((item, i) => (
                            <div
                                key={i}
                                className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 shadow-sm transition-transform  border border-primary"
                                title={item.productId?.name}
                            >
                                {item.productId?.images?.[0]?.url ? (
                                    <img
                                        src={item.productId.images[0].url}
                                        alt={item.productId.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                                        <FiPackage />
                                    </div>
                                )}
                            </div>
                        ))}

                        {data.items?.length > 2 && (
                            <div className="relative  h-9 w-9 border border-primary rounded-full ring-2 ring-white  bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                +{data.items.length - 2}
                            </div>
                        )}
                    </div>
                    {/* <div className='text-xs flex items-center text-gray-500 whitespace-nowrap self-center pl-2 !ml-1'>
                        {data.items?.length} items
                    </div> */}
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
            header: 'Payment Method',
            accessor: 'paymentMethod',
            render: (data) => (
                <div className="text-sm font-medium text-textPrimary">
                    {data.paymentMethod}
                </div>
            )
        },
        {
            header: 'Payment Status',
            accessor: 'payment',
            render: (data) => {
                const status = data.payment?.status?.toLowerCase();
                let config = {
                    color: 'bg-gray-50 text-gray-600 border-gray-200',
                    Icon: FiAlertCircle
                };

                if (status === 'paid' || status === 'captured' || status === 'completed') {
                    config = { color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                } else if (status === 'pending') {
                    config = { color: 'bg-amber-50 text-amber-700 border-amber-200' };
                } else if (status === 'failed' || status === 'error') {
                    config = { color: 'bg-rose-50 text-rose-700 border-rose-200' };
                } else if (status === 'refunded') {
                    config = { color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
                }

                return (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[12px] font-[600] border capitalize transition-all duration-300 ${config.color}`}>
                        {data.payment?.status || 'N/A'}
                    </div>
                );
            }
        },
        {
            header: 'Order Status',
            accessor: 'status',
            render: (data) => (
                <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium border capitalize
                ${data.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        data.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            data.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                data.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {data.status}
                </span>
            )
        },
        {
            header: 'Shipping',
            searchKey: (data) => `${data.address?.firstname} ${data.address?.lastname} ${data.address?.address} ${data.address?.city} ${data.address?.zipcode}`,
            accessor: 'address',
            render: (data) => (
                <div className='max-w-[150px] text-xs text-textSecondary truncate'>
                    <div className='font-medium text-textPrimary'>
                        {data.address?.firstname} {data.address?.lastname}
                    </div>
                    <div title={`${data.address?.address}, ${data.address?.city}`}>
                        {data.address?.address}, <br />{data.address?.city}
                    </div>
                </div>
            )
        }
    ], []);

    const handleView = useCallback((item) => {
        navigate(`/admin/orders/${item._id}`);
    }, [navigate]);

    const handleDelete = useCallback((item) => {
        dispatch(deleteOrder(item._id));
    }, [dispatch]);

    if (loading) {
        return <AdminLoader message="Loading orders..." icon={FiShoppingCart} />;
    }

    return (
        <>
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
        </>
    );
};

export default Orders;
