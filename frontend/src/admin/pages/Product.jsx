import React, { useState } from 'react';
import Table from '../component/DataTable';
import { FiPlus } from 'react-icons/fi';
import Breadcrumb from '../component/Breadcrumb';

const mockData = [
    { _id: '1', name: 'Fresh Apple', category: 'Fruits', price: '$2.50', stock: 120, status: 'Active' },
    { _id: '2', name: 'Organic Bananas', category: 'Fruits', price: '$1.20', stock: 85, status: 'Active' },
    { _id: '3', name: 'Whole Milk 1L', category: 'Dairy', price: '$3.00', stock: 45, status: 'Active' },
    { _id: '4', name: 'Whole Wheat Bread', category: 'Bakery', price: '$2.20', stock: 30, status: 'Pending' },
    { _id: '5', name: 'Chicken Breast', category: 'Meat', price: '$5.50', stock: 0, status: 'Disable' },
];

const Product = () => {
    const [data, setData] = useState(mockData);

    const columns = [
        { header: 'Product Name', accessor: 'name' },
        { header: 'Category', accessor: 'category' },
        { header: 'Price', accessor: 'price' },
        { header: 'Stock', accessor: 'stock' },
        { header: 'Status', accessor: 'status' },
    ];

    const handleEdit = (item) => {
        console.log("Edit item:", item);
        // Add your edit logic here
    };

    const handleView = (item) => {
        console.log("View item:", item);
        // Add your view logic here
    };

    const handleDelete = (item) => {
        console.log("Delete item:", item);
        setData(prev => prev.filter(i => i._id !== item._id));
    };

    return (
        <>
            <div className="flex justify-between items-center md:my-6 my-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary">Products</h2>
                    <Breadcrumb />
                </div>
                <button
                    // onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                >
                    <FiPlus size={16} />
                    <span>Add Product</span>
                </button>
            </div>

            <Table
                columns={columns}
                data={data}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                itemsPerPage={10}
            />
        </>
    )
}

export default Product;