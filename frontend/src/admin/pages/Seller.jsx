import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSellers, fetchSellerCommission, updateSellerCommission } from '../../redux/slice/seller.slice';
import { setAlert } from '../../redux/slice/alert.slice';
import { CheckCircle, AlertCircle, Package, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../component/Breadcrumb';
import DataTable from '../component/DataTable';

const Seller = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sellers, globalCommission, loading } = useSelector((state) => state.seller);
    
    // Commission settings modal state
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    const [commissionValue, setCommissionValue] = useState(10);

    useEffect(() => {
        dispatch(fetchAllSellers());
    }, [dispatch]);

    const handleOpenCommissionModal = async () => {
        setIsCommissionModalOpen(true);
        const actionResult = await dispatch(fetchSellerCommission());
        if (fetchSellerCommission.fulfilled.match(actionResult)) {
            if (actionResult.payload && actionResult.payload.data) {
                setCommissionValue(parseFloat(actionResult.payload.data));
            }
        }
    };

    const handleUpdateCommission = async () => {
        const actionResult = await dispatch(updateSellerCommission(commissionValue));
        if (updateSellerCommission.fulfilled.match(actionResult)) {
            setIsCommissionModalOpen(false);
        }
    };

    const handleView = (seller) => {
        navigate(`/admin/sellers/view/${seller._id}`);
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'sellername',
            searchKey: (sellers) => `${sellers?.firstname || ''} ${sellers?.lastname || ''} ${sellers?.name || ''} ${sellers?.brandDetails?.storeName || ''}`.toLowerCase(),
            exportValue: (sellers) => `${sellers.brandDetails?.storeName}`,
            render: (sellers) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold overflow-hidden shadow-sm border border-emerald-500/20 shrink-0">
                        {sellers?.photo?.url || sellers?.profileImage || sellers?.image ? (
                            <img src={sellers?.photo?.url || sellers.profileImage || sellers.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            (sellers?.firstname?.charAt(0) || sellers?.name?.charAt(0) || 'U').toUpperCase()
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-800 tracking-wide block">
                            {`${sellers?.firstname || ''} ${sellers?.lastname || ''}`.trim() || sellers?.name || 'N/A'}
                        </span>
                        <p className="text-xs text-gray-500">{sellers.brandDetails?.storeName || 'Store Pending'}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (sellers) => <span className="text-textPrimary">{sellers.email || 'N/A'}</span>,
            searchKey: (sellers) => sellers.email,
        },
        {
            header: 'Mobile',
            accessor: 'mobileno',
            exportValue: (sellers) => sellers.mobileno || sellers.mobile || sellers.phone || sellers.phoneNumber || sellers.addresses?.[0]?.phone,
            render: (sellers) => {
                const mobile = sellers.mobileno || sellers.mobile || sellers.phone || sellers.phoneNumber || sellers.addresses?.[0]?.phone || 'N/A';
                return <span className="text-textPrimary">{mobile}</span>;
            },
            searchKey: (sellers) => sellers.mobileno || sellers.mobile || sellers.phone || sellers.phoneNumber || sellers.addresses?.[0]?.phone
        },
        {
            header: 'Status',
            accessor: 'status',
            searchKey: (sellers) => sellers.status,
            exportValue: (sellers) => sellers.status,
            render: (sellers) => getStatusBadge(sellers.status)
        },
        {
            header: 'Onboarding',
            accessor: 'isOnboardingCompleted',
            searchKey: (sellers) => sellers.isOnboardingCompleted ? 'Completed' : 'Pending',
            exportValue: (sellers) => sellers.isOnboardingCompleted ? 'Completed' : 'Pending',
            render: (sellers) => (
                <span className="text-textSecondary text-sm">
                    {sellers.isOnboardingCompleted ? (
                        <>
                            <div className='text-green-600 font-bold flex items-center gap-1 text-xs'>
                                <CheckCircle size={14} /> Completed
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='text-gray-400 font-medium flex items-center gap-1 text-xs'>
                                <AlertCircle size={14} /> Pending (Step {sellers?.onboardingStep})
                            </div>
                        </>
                    )}
                </span>
            ),
        },
        {
            header: 'Joined',
            accessor: 'createdAt',
            searchKey: (sellers) => new Date(sellers.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            exportValue: (sellers) => new Date(sellers.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            render: (sellers) => (
                <span className="text-textSecondary text-sm">
                    {sellers.createdAt ? new Date(sellers.createdAt).toLocaleDateString('en-In', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </span>
            ),
        }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-[4px] border border-green-200">Approved</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-[4px] border border-red-200">Rejected</span>;
            case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-[4px] border border-yellow-200">Pending</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-[4px] border border-gray-200">{status || 'Unknown'}</span>;
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Sellers</h2>
                    <Breadcrumb />
                </div>
                <button
                    onClick={handleOpenCommissionModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-btnText rounded hover:bg-primaryHover transition-colors text-sm font-medium"
                >
                    <Settings className="w-4 h-4" />
                    <span>Global Commission</span>
                </button>
            </div>


            <DataTable
                data={sellers || []}
                onView={handleView}
                columns={columns}
                allowExport={true}
                exportFileName="Sellers"
            />

            {/* Commission Settings Modal */}
            {isCommissionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Global Seller Commission</h3>
                            <button
                                onClick={() => setIsCommissionModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Commission Percentage (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={commissionValue}
                                onChange={(e) => setCommissionValue(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-textPrimary focus:border-transparent outline-none"
                                placeholder="E.g., 10"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                When you update this, an email will be automatically sent to all approved sellers to notify them of the change. This new percentage will be applied to all newly created orders.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100">
                            <button
                                onClick={() => setIsCommissionModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCommission}
                                disabled={loading}
                                className="px-4 py-2 bg-primary text-btnText rounded font-medium hover:bg-primaryHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? 'Updating & Notifying...' : 'Update Commission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Seller;