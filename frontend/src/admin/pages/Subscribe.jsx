import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSubscribers, deleteSubscriber } from '../../redux/slice/subscribe.slice';
import Table from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiRefreshCw, FiTrash2, FiMail, FiX } from 'react-icons/fi';

const Subscribe = () => {
    const dispatch = useDispatch();
    const { subscribers: data, loading, submitLoading } = useSelector((state) => state.subscribe);
    const [deleteItem, setDeleteItem] = useState(null);

    const fetchSubscribers = () => {
        dispatch(getAllSubscribers());
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const columns = [
        {
            header: '#',
            accessor: '_id',
            hideInExport: true,
            render: (_, idx) => <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
        },
        {
            header: 'Email Address',
            accessor: 'email',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FiMail size={14} />
                    </div>
                    <span className="font-medium">{item.email}</span>
                </div>
            )
        },
        {
            header: 'Joined Date',
            accessor: 'createdAt',
            exportValue: (item) => new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            render: (item) => new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${item.status === 'Active'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    {item.status || 'Active'}
                </span>
            )
        }
    ];

    const handleDelete = (item) => {
        setDeleteItem(item);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;
        const result = await dispatch(deleteSubscriber(deleteItem._id));
        if (result.type.endsWith('/fulfilled')) {
            setDeleteItem(null);
        }
    };

    return (
        <div className="py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        Subscribers
                        <span className="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full font-medium">
                            {data?.length || 0}
                        </span>
                    </h2>
                    <Breadcrumb />
                </div>
                <div className="flex items-center gap-3">
                    {/* <button
                        onClick={fetchSubscribers}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600  transition-all font-medium text-sm "
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
 
                    </button> */}
                    {/* <button
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-all font-medium text-sm shadow-lg shadow-primary/20"
                    >
                        <FiMail size={16} />
                        Export Emails
                    </button> */}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-[4px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                        <FiMail size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Subscribers</p>
                        <h4 className="text-xl font-bold text-gray-800">{data?.length || 0}</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[4px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
                        <FiMail size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active This Month</p>
                        <h4 className="text-xl font-bold text-gray-800">
                            {data?.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length || 0}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Subscribers Table */}
            {loading && !data?.length ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[4px] shadow-sm border border-gray-100">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading subscribers...</p>
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={data}
                    onDelete={handleDelete}
                    itemsPerPage={10}
                    exportFileName="Subscribers"
                    allowExport={true}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-sm overflow-hidden font-jost">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <FiTrash2 className="text-red-500 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Unsubscribe User</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Are you sure you want to remove <span className="font-semibold text-gray-700 italic">"{deleteItem.email}"</span>? They will no longer receive newsletter updates.
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteItem(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-[4px] hover:bg-gray-200 transition-all italic"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={submitLoading}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 rounded-[4px] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Confirm Deletion'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscribe;