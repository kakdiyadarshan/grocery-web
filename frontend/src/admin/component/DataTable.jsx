import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Plus,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

const DataTable = () => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    // Determine current module from URL
    const getModuleConfig = () => {
        const path = location.pathname;
        if (path.includes('/products')) return 'products';
        if (path.includes('/categories')) return 'categories';
        if (path.includes('/orders')) return 'orders';
        if (path.includes('/customers')) return 'customers';
        if (path.includes('/vendors')) return 'vendors';
        return 'products'; // default
    };

    const currentModule = getModuleConfig();

    // Reusable status badge generator
    const getStatusBadge = (status) => {
        const text = status.toLowerCase();
        if (text.includes('in stock') || text === 'active' || text === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
        if (text.includes('low') || text === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (text.includes('out of') || text === 'inactive') return 'bg-red-100 text-red-700 border-red-200';
        if (text === 'processing') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Module configurations managing all data and columns within this single file
    const configurations = {
        products: {
            title: "Products",
            subtitle: "Manage your store's product inventory and pricing.",
            addLabel: "Add Product",
            searchPlaceholder: "Search products by name or category...",
            searchableFields: ['name', 'category', 'status'],
            data: [
                { id: 1, name: 'Organic Bananas', category: 'Fruits', price: '$2.99', stock: 154, status: 'In Stock', image: '🍌' },
                { id: 2, name: 'Whole Milk 1 Gallon', category: 'Dairy', price: '$4.49', stock: 43, status: 'Low Stock', image: '🥛' },
                { id: 3, name: 'Sourdough Bread', category: 'Bakery', price: '$5.99', stock: 0, status: 'Out of Stock', image: '🍞' },
                { id: 4, name: 'Fresh Salmon Fillet', category: 'Seafood', price: '$12.99', stock: 24, status: 'In Stock', image: '🐟' },
                { id: 5, name: 'Avocado (Large)', category: 'Vegetables', price: '$1.50', stock: 312, status: 'In Stock', image: '🥑' },
            ],
            columns: [
                {
                    header: 'Product', accessor: 'name', sortable: true, render: (row) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center text-xl border border-gray-100 group-hover:bg-white transition-colors">
                                {row.image}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{row.name}</p>
                                <p className="text-xs text-gray-500">ID: #{row.id.toString().padStart(4, '0')}</p>
                            </div>
                        </div>
                    )
                },
                { header: 'Category', accessor: 'category', render: (row) => <span className="text-sm text-gray-600 font-medium">{row.category}</span> },
                { header: 'Price', accessor: 'price', render: (row) => <span className="text-sm font-semibold text-gray-900">{row.price}</span> },
                { header: 'Status', accessor: 'status', render: (row) => <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(row.status)}`}>{row.status}</span> },
                {
                    header: 'Stock', accessor: 'stock', render: (row) => (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${row.stock > 50 ? 'bg-green-500' : row.stock > 0 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${Math.min((row.stock / 200) * 100, 100)}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium w-8">{row.stock}</span>
                        </div>
                    )
                },
                {
                    header: 'Actions', accessor: 'actions', align: 'right', render: (row) => (
                        <div className="flex justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Eye size={18} /></button>
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"><Edit size={18} /></button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={18} /></button>
                        </div>
                    )
                }
            ]
        },
        categories: {
            title: "Categories",
            subtitle: "Manage product categories.",
            addLabel: "Add Category",
            searchPlaceholder: "Search categories...",
            searchableFields: ['name'],
            data: [
                { id: 1, name: 'Fruits', count: 12, status: 'Active' },
                { id: 2, name: 'Vegetables', count: 24, status: 'Active' },
                { id: 3, name: 'Dairy', count: 8, status: 'Active' },
            ],
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Category Name', accessor: 'name', sortable: true },
                { header: 'Product Count', accessor: 'count' },
                { header: 'Status', accessor: 'status', render: (row) => <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(row.status)}`}>{row.status}</span> },
                {
                    header: 'Actions', accessor: 'actions', align: 'right', render: (row) => (
                        <div className="flex justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit size={18} /></button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                    )
                }
            ]
        },
        orders: {
            title: "Orders",
            subtitle: "Manage customer orders.",
            addLabel: "Create Order",
            searchPlaceholder: "Search orders by ID or customer...",
            searchableFields: ['id', 'customer', 'status'],
            data: [
                { id: '#ORD-001', customer: 'John Doe', total: '$45.00', status: 'Delivered', date: '2023-10-01' },
                { id: '#ORD-002', customer: 'Jane Smith', total: '$120.50', status: 'Processing', date: '2023-10-02' },
                { id: '#ORD-003', customer: 'Alice Johnson', total: '$15.20', status: 'Pending', date: '2023-10-02' },
            ],
            columns: [
                { header: 'Order ID', accessor: 'id' },
                { header: 'Customer', accessor: 'customer', sortable: true },
                { header: 'Date', accessor: 'date' },
                { header: 'Total', accessor: 'total' },
                { header: 'Status', accessor: 'status', render: (row) => <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(row.status)}`}>{row.status}</span> },
                {
                    header: 'Actions', accessor: 'actions', align: 'right', render: (row) => (
                        <div className="flex justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                        </div>
                    )
                }
            ]
        },
        customers: {
            title: "Customers",
            subtitle: "Manage your customers list.",
            addLabel: "Add Customer",
            searchPlaceholder: "Search customers by name or email...",
            searchableFields: ['name', 'email'],
            data: [
                { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, spent: '$250.00', status: 'Active' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 2, spent: '$45.00', status: 'Inactive' },
            ],
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Name', accessor: 'name', sortable: true },
                { header: 'Email', accessor: 'email' },
                { header: 'Orders', accessor: 'orders' },
                { header: 'Total Spent', accessor: 'spent' },
                { header: 'Status', accessor: 'status', render: (row) => <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(row.status)}`}>{row.status}</span> },
                {
                    header: 'Actions', accessor: 'actions', align: 'right', render: (row) => (
                        <div className="flex justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit size={18} /></button>
                        </div>
                    )
                }
            ]
        },
        vendors: {
            title: "Vendors",
            subtitle: "Manage your suppliers and vendors.",
            addLabel: "Add Vendor",
            searchPlaceholder: "Search vendors...",
            searchableFields: ['name', 'contact'],
            data: [
                { id: 1, name: 'Fresh Farms Inc.', contact: 'fresh@farms.com', products: 15, status: 'Active' },
                { id: 2, name: 'Global Dairy', contact: 'contact@globaldairy.com', products: 8, status: 'Active' },
            ],
            columns: [
                { header: 'ID', accessor: 'id' },
                { header: 'Vendor Name', accessor: 'name', sortable: true },
                { header: 'Contact', accessor: 'contact' },
                { header: 'Supplied Products', accessor: 'products' },
                { header: 'Status', accessor: 'status', render: (row) => <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(row.status)}`}>{row.status}</span> },
                {
                    header: 'Actions', accessor: 'actions', align: 'right', render: (row) => (
                        <div className="flex justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit size={18} /></button>
                        </div>
                    )
                }
            ]
        }
    };

    const config = configurations[currentModule];

    // Filter data based on search term
    const filteredData = config.data.filter(item => {
        if (!searchTerm) return true;
        if (config.searchableFields.length > 0) {
            return config.searchableFields.some(field => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="space-y-6 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{config.subtitle}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium">
                    <Plus size={20} />
                    <span>{config.addLabel}</span>
                </button>
            </div>

            <div className="rounded-md border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder={config.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white"/>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto font-medium text-sm">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                {config.columns.map((col, index) => (
                                    <th key={index} className={`px-6 py-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                                        <div className={`flex items-center gap-2 ${col.sortable ? 'cursor-pointer hover:text-gray-700' : ''} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                            {col.header}
                                            {col.sortable && <ArrowUpDown size={14} />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/70">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50/80 transition-colors group">
                                        {config.columns.map((col, colIndex) => (
                                            <td key={colIndex} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                                                {col.render ? col.render(row) : (
                                                    <span className="text-sm font-medium text-gray-900">{row[col.accessor]}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={config.columns.length} className="px-6 py-8 text-center text-gray-500 text-sm">No data found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex flex-col justify-between items-center sm:flex-row gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-semibold text-gray-900">{filteredData.length > 0 ? 1 : 0}</span> to <span className="font-semibold text-gray-900">{filteredData.length}</span> of <span className="font-semibold text-gray-900">{config.data.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-700 font-semibold border border-green-200">1</button>
                        </div>
                        <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
