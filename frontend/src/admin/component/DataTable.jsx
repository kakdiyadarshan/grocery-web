import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FiArrowUp, FiArrowDown, FiEye, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BiSortAlt2 } from "react-icons/bi";
// import CommonViewModal from './CommonViewModal';
// import DeleteModal from './DeleteModal';

// Helper for status styles moved outside to avoid recreation
const getStatusStyles = (status) => {
    switch (status) {
        case 'Active':
        case 'Paid':
        case 'Delivered':
        case 'Completed':
        case 'completed':
        case 'approved':
            return 'bg-green-500/10 text-green-500 border border-green-500/20';

        case 'Pending':
        case 'pending':
        case 'Unpaid':
            return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';

        case 'Order Confirmed':
            return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';

        case 'Processing':
            return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';

        case 'Shipped':
            return 'bg-violet-500/10 text-violet-500 border border-violet-500/20';

        case 'Out For Delivery':
            return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';

        case 'Disable':
        case 'Rejected':
        case 'rejected':
        case 'Cancelled':
        case 'Returned':
            return 'bg-red-500/10 text-red-500 border border-red-500/20';

        case 'Amount':
            return 'bg-emerald-500/10 text-emerald-500 ';

        default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
};

const Table = ({ columns = [], data = [], onEdit, onView, onDelete, itemsPerPage = 10, extraActions,
    manualPagination = false, manualTotalPages, manualCurrentPage, onManualPageChange,
    manualRowsPerPage, onManualRowsPerPageChange, manualTotalItems, onSearch
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage)
    const [viewModalData, setViewModalData] = useState(null);
    const [deleteModalData, setDeleteModalData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Search Filter - (If manual, we assumesearch handled by parent or disabled, or we just filter the current page)
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(item =>
            columns.some(col => {
                if (col.searchKey && typeof col.searchKey === 'function') {
                    const customValue = col.searchKey(item);
                    return customValue && customValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
                }
                const itemValue = item[col.accessor];
                return itemValue && itemValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    }, [data, searchTerm, columns]);

    // Derived State for Pagination
    const isManual = manualPagination;
    const effectivePage = isManual ? manualCurrentPage : currentPage;
    const effectiveRowsPerPage = isManual ? manualRowsPerPage : rowsPerPage;
    const effectiveTotalItems = isManual ? manualTotalItems : filteredData.length;

    // 2. Sorting
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // 3. Pagination
    const totalPages = isManual ? manualTotalPages : Math.ceil(sortedData.length / rowsPerPage);

    const paginatedData = useMemo(() => {
        if (isManual) return sortedData; // Expecting data to be the current page's data
        const start = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage, isManual]);

    const handleSort = useCallback((accessor) => {
        setSortConfig(prevConfig => {
            let direction = 'asc';
            if (prevConfig.key === accessor && prevConfig.direction === 'asc') {
                direction = 'desc';
            }
            return { key: accessor, direction };
        });
    }, []);

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            if (isManual && onManualPageChange) {
                onManualPageChange(page);
            } else {
                setCurrentPage(page);
            }
        }
    }, [totalPages, isManual, onManualPageChange]);

    const handleRowsPerPageChange = useCallback((val) => {
        if (isManual && onManualRowsPerPageChange) {
            onManualRowsPerPageChange(val);
        } else {
            setRowsPerPage(val);
        }
    }, [isManual, onManualRowsPerPageChange]);

    // Reset page when filtering/sorting (Only for client side)
    useEffect(() => {
        if (!isManual) setCurrentPage(1);
    }, [searchTerm, rowsPerPage, isManual]);

    const handleViewAction = useCallback((item) => {
        if (typeof onView === 'function') {
            onView(item);
        } else {
            setViewModalData(item);
        }
    }, [onView]);

    const handleDeleteAction = useCallback((item) => {
        if (onDelete) {
            onDelete(item);
        }
    }, [onDelete]);

    const handleConfirmDelete = useCallback(async () => {
        if (deleteModalData && onDelete) {
            setIsDeleting(true);
            try {
                await onDelete(deleteModalData);
            } catch (error) {
                console.error("Delete error:", error);
            } finally {
                setIsDeleting(false);
                setDeleteModalData(null);
            }
        }
    }, [deleteModalData, onDelete]);


    return (
        <>
            <div className="w-full bg-white rounded-[4px] mt-5 shadow-sm border border-gray-100 overflow-hidden transition-colors duration-300 font-jost">
                {/* Top Controls */}
                <div className="p-3 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchTerm(val);
                                if (onSearch) onSearch(val);
                                if (isManual && onManualPageChange) onManualPageChange(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[4px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#228B22]/20 focus:border-[#228B22] transition-all text-sm placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FiSearch className="text-gray-400" size={16} />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-y border-gray-100">
                                {columns.filter(col => !col.hideInTable).map((col, index) => {
                                    const isAsc = sortConfig.key === col.accessor && sortConfig.direction === 'asc';
                                    const isDesc = sortConfig.key === col.accessor && sortConfig.direction === 'desc';
                                    return (
                                        <th
                                            key={index}
                                            onClick={() => handleSort(col.accessor)}
                                            className="px-6 py-4 text-xs font-semibold text-gray-500 capitalize tracking-wider cursor-pointer select-none whitespace-nowrap group hover:text-primary-color transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.header}
                                                {isAsc ? (
                                                    <FiArrowUp className="text-primary-color" />
                                                ) : isDesc ? (
                                                    <FiArrowDown className="text-primary-color" />
                                                ) : (
                                                    <BiSortAlt2 className="text-gray-400 group-hover:text-primary-color/50 transition-colors" size={14} />
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                                {/* Action Column Header */}
                                {!columns.some(col => col.accessor === 'actions' || col.accessor === 'action') && (onEdit || onDelete || onView) && (
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 capitalize tracking-wider">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIndex) => (
                                    <tr
                                        key={item._id || rowIndex}
                                        className={`transition-colors group hover:bg-gray-50 ${(onView && !columns.some(col => col.accessor === 'actions')) ? 'cursor-pointer' : ''}`}
                                        onClick={() => (!columns.some(col => col.accessor === 'actions') && onView) && handleViewAction(item)}
                                    >
                                        {columns.filter(col => !col.hideInTable).map((col, colIndex) => (
                                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                {col.render ? (
                                                    col.render(item)
                                                ) : ['status', 'paymentStatus', 'orderStatus', 'amount'].includes(col.accessor) ? (
                                                    <span className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold border ${getStatusStyles(item[col.accessor])}`}>
                                                        {item[col.accessor]}
                                                    </span>
                                                ) : (
                                                    item[col.accessor]
                                                )}
                                            </td>
                                        ))}

                                        {/* Action Buttons */}
                                        {!columns.some(col => col.accessor === 'actions' || col.accessor === 'action') && (onEdit || onDelete || onView || extraActions) && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    {onView && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewAction(item);
                                                            }}
                                                            className="p-1.5 text-blue-500 bg-blue-50 rounded-[4px] hover:bg-blue-100 transition-colors"
                                                            title="View"
                                                        >
                                                            <FiEye size={15} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(item);
                                                            }}
                                                            className="p-1.5 text-green-500 bg-green-50 rounded-[4px] hover:bg-green-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={15} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAction(item);
                                                            }}
                                                            className="p-1.5 text-red-500 bg-red-50 rounded-[4px] hover:bg-red-100 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={15} />
                                                        </button>
                                                    )}
                                                    {extraActions && extraActions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length + (!columns.some(col => col.accessor === 'actions' || col.accessor === 'action') && (onEdit || onDelete || onView || extraActions) ? 1 : 0)}
                                        className="px-6 py-12 text-center text-gray-500 text-sm"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FiSearch size={24} className="opacity-50" />
                                            <p>No results found for "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <div className='flex items-center gap-3'>
                        <span className="text-gray-500 font-medium">Rows per page:</span>
                        <select
                            value={effectiveRowsPerPage}
                            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-[4px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer transition-all"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={12}>12</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-gray-500">
                            Showing <span className="font-semibold text-gray-800">{Math.min((effectivePage - 1) * effectiveRowsPerPage + 1, effectiveTotalItems)}</span> - <span className="font-semibold text-gray-800">{Math.min(effectivePage * effectiveRowsPerPage, effectiveTotalItems)}</span> of <span className="font-semibold text-gray-800">{effectiveTotalItems}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(effectivePage - 1)}
                                disabled={effectivePage === 1}
                                className="p-1 px-2 border border-gray-200 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(effectivePage + 1)}
                                disabled={effectivePage === totalPages || totalPages === 0}
                                className="p-1 px-2 border border-gray-200 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* <CommonViewModal
                isOpen={!!viewModalData}
                onClose={() => setViewModalData(null)}
                data={viewModalData}
                columns={columns}
            />
            <DeleteModal
                isOpen={!!deleteModalData}
                onClose={() => setDeleteModalData(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            /> */}
        </>
    )
}

export default Table
