import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerPayments, updatePaymentStatus } from '../../redux/slice/payment.slice';
import AdminLoader from '../../admin/component/AdminLoader';
import Breadcrumb from "../../admin/component/Breadcrumb";
import DataTable from "../../admin/component/DataTable";
import CustomSelect from '../../admin/component/CustomSelect';
import { FiDollarSign } from 'react-icons/fi';

const Transactions = () => {
    const dispatch = useDispatch();
    const { payments = [], loading } = useSelector((state) => state.payment);

    console.log(payments);

    useEffect(() => {
        dispatch(fetchSellerPayments());
    }, [dispatch]);

    const handleStatusChange = useCallback((id, status) => {
        dispatch(updatePaymentStatus({ id, status }));
    }, [dispatch]);

    const columns = useMemo(() => [
        {
            header: 'Date',
            accessor: 'createdAt',
            searchKey: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            render: (row) => (
                <div>
                    <div>{new Date(row.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleTimeString()}</div>
                </div>
            )
        },
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <span className="font-medium font-mono">#{row.orderId?.slice(-6).toUpperCase()}</span>
            )
        },
        {
            header: 'Customer',
            accessor: 'userName',
            searchKey: (row) => `${row.userName} ${row.email}`,
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-textPrimary">{row.userName || 'Unknown'}</span>
                    {row.email && (
                        <span className="text-xs text-textSecondary">{row.email}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Payment Method',
            accessor: 'paymentMethod',
        },
        {
            header: 'Earning Amount',
            accessor: 'amount',
            render: (row) => (
                <span className="font-bold text-green-600">
                    ${Number(row.amount || 0).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => row.paymentMethod?.toLowerCase() === 'cod' ? (
                <CustomSelect
                    value={row.status}
                    onChange={(val) => handleStatusChange(row._id, val)}
                    searchable={false}
                    className="w-32"
                    buttonClassName={`!py-1.5 shadow-sm text-[10px] font-[600] tracking-widest capitalize ${
                        row.status === 'paid' ? '!bg-emerald-50 !text-emerald-600 !border-emerald-200' :
                        row.status === 'pending' ? '!bg-amber-50 !text-amber-600 !border-amber-200' :
                        row.status === 'failed' ? '!bg-rose-50 !text-rose-600 !border-rose-200' :
                        row.status === 'refunded' ? '!bg-indigo-50 !text-indigo-600 !border-indigo-200' :
                        '!bg-gray-50 !text-gray-600 !border-gray-200'
                    }`}
                    options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'failed', label: 'Failed' },
                    ]}
                />
            ) : (
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-[600] tracking-widest capitalize shadow-sm border ${
                        row.status === 'paid' || row.status === 'succeeded' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        row.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        row.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        row.status === 'refunded' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ], [handleStatusChange]);

    if (loading) {
        return <AdminLoader message="Loading payments..." icon={FiDollarSign} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Transactions</h2>
                    <Breadcrumb />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <DataTable 
                    columns={columns} 
                    data={payments} 
                    allowExport={true}
                    exportFileName="My_Transactions"
                />
            </div>
        </>
    );
};

export default Transactions;
