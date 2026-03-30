import React, { useCallback, useEffect, useMemo } from 'react';
import { fetchPayments } from '../../redux/slice/payment.slice';
import { FiDownload, FiHash, FiClock, FiUser, FiInfo, FiDollarSign } from 'react-icons/fi';
import DataTable from '../component/DataTable';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumb from '../component/Breadcrumb';

const Transactions = () => {
    const dispatch = useDispatch();
    const { payments = [], loading } = useSelector((state) => state.payment);

    useEffect(() => {
        dispatch(fetchPayments());
    }, [dispatch]);


    const columns = useMemo(() => [
        {
            header: 'Date',
            accessor: 'createdAt',
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
            render: (row) => (
                <span className="font-medium font-mono">
                    #{row.orderId?.slice(-6).toUpperCase()}
                </span>
            )
        },
        {
            header: 'User',
            searchKey: (row) => `${row.user?.username} ${row.user?.email}`,
            accessor: 'user',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-textPrimary">
                        {row.userId?.firstname + " " + row.userId?.lastname || 'Unknown'}
                    </span>
                    <span className="text-xs text-textSecondary">
                        {row.userId?.email}
                    </span>
                </div>
            )
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
            accessor: 'status'
        }
    ], []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-12 h-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                </div>
            </div>
        );
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
            />
        </>
    );
};

export default Transactions;
