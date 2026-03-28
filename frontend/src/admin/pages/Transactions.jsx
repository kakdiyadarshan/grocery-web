import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchTransactions } from '../../redux/slice/transaction.slice';
import { FiDownload, FiHash, FiClock, FiUser, FiInfo, FiDollarSign } from 'react-icons/fi';
import DataTable from '../component/DataTable';

const Transactions = () => {
    const dispatch = useDispatch();
    // const { transactions = [], loading } = useSelector((state) => state.transaction);

    // useEffect(() => {
    //     dispatch(fetchTransactions());
    // }, [dispatch]);


    const columns = useMemo(() => [
        {
            header: 'Date & Time',
            accessor: 'date',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <div className="text-[13px] font-bold text-textPrimary">
                        {new Date(row.date).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-textSecondary uppercase tracking-widest opacity-60">
                        <FiClock size={10} />
                        {new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )
        },
        {
            header: 'Transaction ID',
            accessor: '_id',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-bgMain border border-borderColor text-primary">
                        <FiHash size={12} />
                    </div>
                    <span className="font-black text-xs text-textPrimary tracking-wider">
                        {row._id.slice(-8).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            header: 'Entity / Client',
            searchKey: (row) => `${row.user?.username} ${row.user?.email}`,
            accessor: 'user',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20 shadow-sm">
                        {row.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-textPrimary uppercase tracking-tight">
                            {row.user?.username || 'System Admin'}
                        </span>
                        <span className="text-[10px] font-bold text-textSecondary opacity-50">
                            {row.user?.email || 'N/A'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Pipeline Type',
            accessor: 'type',
            render: (row) => (
                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${row.type === 'Order'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-violet-50 text-violet-700 border-violet-200'
                        }`}
                >
                    {row.type}
                </span>
            )
        },
        {
            header: 'Execution Details',
            accessor: 'details',
            render: (row) => (
                <div className="flex items-center gap-2 max-w-xs">
                    <FiInfo className="text-textSecondary opacity-30 shrink-0" size={14} />
                    <span className="text-xs font-medium text-textSecondary truncate block italic">
                        {row.details}
                    </span>
                </div>
            )
        },
        {
            header: 'Financial Value',
            accessor: 'amount',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                        <FiDollarSign size={10} />
                    </div>
                    <span className="font-black text-sm text-textPrimary">
                        {Number(row.amount).toFixed(2)}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    row.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    row.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                    {row.status}
                </span>
            )
        }
    ], []);

    // if (loading) {
    //     return (
    //         <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    //            <div className="relative w-12 h-12">
    //                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
    //            </div>
    //         </div>
    //     );
    // }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between sm:mb-8 mb-4 gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                       <h1 className="text-2xl font-black text-textPrimary tracking-tight uppercase">Transactions</h1>
                       <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest border border-primary/20">
                           {/* {transactions.length} Records */}
                       </span>
                   </div>
                   <p className="text-xs font-bold text-textSecondary uppercase tracking-widest opacity-60">Financial ledger and execution logs</p>
                </div>
            </div>

            {/* <DataTable
                columns={columns}
                data={transactions}
                className="bg-card border border-borderColor rounded-2xl overflow-hidden shadow-sm"
            /> */}
        </div>
    );
};

export default Transactions;
