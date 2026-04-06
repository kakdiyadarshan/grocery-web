import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSellers } from '../../redux/slice/seller.slice';
import { CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../component/Breadcrumb';
import DataTable from '../component/DataTable';

const Seller = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sellers } = useSelector((state) => state.seller);

    useEffect(() => {
        dispatch(fetchAllSellers());
    }, [dispatch]);

    const handleView = (seller) => {
        navigate(`/admin/sellers/view/${seller._id}`);
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
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
            searchKey: (sellers) => `${sellers?.firstname || ''} ${sellers?.lastname || ''}`.trim() || sellers?.name
        },
        {
            header: 'Email',
            accessor: 'email',
            render: (sellers) => <span className="text-textPrimary">{sellers.email || 'N/A'}</span>,
            searchKey: (sellers) => sellers.email
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
            </div>


            <DataTable
                data={sellers || []}
                onView={handleView}
                columns={columns}
                allowExport={true}
                exportFileName="Sellers"
            />
        </div>
    );
};

export default Seller;