import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSubscribers, deleteSubscriber, sendOfferEmail } from '../../redux/slice/subscribe.slice';
import Table from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiMail, FiX, FiSend } from 'react-icons/fi';

const Subscribe = () => {
    const dispatch = useDispatch();
    const { subscribers: data, loading, submitLoading, emailLoading } = useSelector((state) => state.subscribe);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
    const [errors, setErrors] = useState({});

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

    const handleDelete = useCallback(async (contact) => {
        dispatch(deleteSubscriber(contact._id));
    }, [dispatch]);

    const validate = () => {
        const newErrors = {};
        if (!emailForm.subject.trim()) newErrors.subject = 'Subject is required.';
        if (!emailForm.message.trim()) newErrors.message = 'Message is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendEmail = async () => {
        if (!validate()) return;
        const result = await dispatch(sendOfferEmail({ subject: emailForm.subject, message: emailForm.message }));
        if (result.meta.requestStatus === 'fulfilled') {
            setShowEmailModal(false);
            setEmailForm({ subject: '', message: '' });
            setErrors({});
        }
    };

    const handleCloseModal = () => {
        setShowEmailModal(false);
        setEmailForm({ subject: '', message: '' });
        setErrors({});
    };

    const activeCount = data?.filter(s => s.status === 'Active').length || 0;
    const thisMonthCount = data?.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length || 0;

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
                    <button
                        onClick={() => setShowEmailModal(true)}
                        disabled={!activeCount}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-all font-medium text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSend size={15} />
                        Send Offer Email
                    </button>
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
                        <h4 className="text-xl font-bold text-gray-800">{thisMonthCount}</h4>
                    </div>
                </div>
            </div>

            {/* Subscribers Table */}
             {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
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

            {/* Send Offer Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[8px] shadow-2xl w-full max-w-lg overflow-hidden font-jost">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <FiSend size={16} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-800">Send Offer Email</h3>
                                    <p className="text-xs text-gray-400">Will be sent to {activeCount} active subscriber(s)</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 🎉 Exclusive 30% OFF on Fresh Vegetables!"
                                    value={emailForm.subject}
                                    onChange={(e) => {
                                        setEmailForm(prev => ({ ...prev, subject: e.target.value }));
                                        if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-[4px] text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Message / Offer Details <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Write your offer details here... e.g. Get 30% off on all vegetables this weekend only. Use code FRESH30 at checkout!"
                                    value={emailForm.message}
                                    onChange={(e) => {
                                        setEmailForm(prev => ({ ...prev, message: e.target.value }));
                                        if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-[4px] text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            {/* Info note */}
                            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-[4px] px-4 py-3">
                                <FiMail size={15} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-600 leading-relaxed">
                                    This email will be sent to all <strong>{activeCount} active</strong> subscriber(s). A professional HTML email template will be used automatically.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex sm:justify-end justify-center gap-3 sm:px-6 px-2 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-[4px] hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSendEmail}
                                disabled={emailLoading}
                                className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-[4px] hover:bg-primaryHover transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {emailLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={14} />
                                        Send to All
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscribe;