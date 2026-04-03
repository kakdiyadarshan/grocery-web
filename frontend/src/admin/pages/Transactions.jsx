import React, { useCallback, useEffect, useMemo } from 'react';
import { fetchPayments, updatePaymentStatus } from '../../redux/slice/payment.slice';
import AdminLoader from '../component/AdminLoader';
import { FiShoppingCart } from 'react-icons/fi';
import DataTable from '../component/DataTable';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumb from '../component/Breadcrumb';
import CustomSelect from '../component/CustomSelect';

const Transactions = () => {
    const dispatch = useDispatch();
    const { payments = [], loading } = useSelector((state) => state.payment);

    useEffect(() => {
        dispatch(fetchPayments());
    }, [dispatch]);

    const handleStatusChange = useCallback((id, status) => {
        dispatch(updatePaymentStatus({ id, status }));
    }, [dispatch]);

    const columns = useMemo(() => [
        {
            header: 'Date',
            accessor: 'createdAt',
            searchKey: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) + " " + new Date(row.createdAt).toLocaleTimeString(),
            exportValue: (row) => new Date(row.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            render: (row) => (
                <div>
                    <div>
                        {new Date(row.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date(row.createdAt).toLocaleTimeString()}
                    </div>
                </div>
            )
        },
        {
            header: 'Transaction ID',
            accessor: 'orderId',
            exportValue: (row) => row.orderId.slice(-6).toUpperCase(),
            render: (row) => (
                <span className="font-medium font-mono">
                    #{row.orderId?.slice(-6).toUpperCase()}
                </span>
            )
        },
        {
            header: 'User',
            searchKey: (row) => {
                const user = row.userId;
                if (!user || typeof user !== 'object') return 'Unknown';
                return `${user.firstname || ''} ${user.lastname || ''} ${user.email || ''}`.trim();
            },
            exportValue: (row) => {
                const user = row.userId;
                if (!user || typeof user !== 'object') return 'Unknown';
                return `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown';
            },
            accessor: 'user',
            render: (row) => {
                const user = row.userId;
                const hasUser = user && typeof user === 'object';
                const fullName = hasUser ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : 'Unknown';

                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-textPrimary">
                            {fullName || 'Unknown'}
                        </span>
                        {hasUser && user.email && (
                            <span className="text-xs text-textSecondary">
                                {user.email}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Payment Method',
            accessor: 'paymentMethod',
        },
        {
            header: 'Amount',
            accessor: 'amount',
            render: (row) => (
                <span className="font-bold">
                    ${Number(row.amount).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
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
            )
        }
    ], [handleStatusChange]);

    if (loading) {
        return <AdminLoader message="Loading transactions..." icon={FiShoppingCart} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Transactions</h2>
                    <Breadcrumb />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={payments}
                allowExport={true}
                exportFileName="Transactions"
            />
        </>
    );
};

export default Transactions;
