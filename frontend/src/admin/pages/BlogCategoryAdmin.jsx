import React, { useState, useEffect, useCallback } from 'react';
import Table from '../component/DataTable';
import { FiPlus, FiX, FiShoppingCart } from 'react-icons/fi';
import Breadcrumb from '../component/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBlogCategory, createBlogCategory, updateBlogCategory, deleteBlogCategory } from '../../redux/slice/blogCategory.slice';
import AdminLoader from '../component/AdminLoader';

const BlogCategoryAdmin = () => {
    const dispatch = useDispatch();
    const { blogCategory: data, loading, submitLoading } = useSelector((state) => state.blogCategory);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ blogCategoryName: '' });
    const [error, setError] = useState('');

    const fetchCategories = () => {
        dispatch(getAllBlogCategory());
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const columns = [
        {
            header: '#',
            accessor: '_id',
            hideInExport: true,
            render: (_, idx) => <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
        },
        { header: 'Category Name', accessor: 'blogCategoryName' },
        {
            header: 'Created',
            accessor: 'createdAt',
            searchKey: (item) => new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            exportValue: (item) => new Date(item.createdAt).toLocaleString(),
            render: (item) => new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.blogCategoryName.trim()) {
            setError('Category name is required.');
            return;
        }

        setError('');
        const action = isEditing
            ? await dispatch(updateBlogCategory({ id: currentId, formData }))
            : await dispatch(createBlogCategory(formData));

        if (action.type.endsWith('/fulfilled')) {
            closeModal();
            fetchCategories();
        }
    };

    const handleEdit = (item) => {
        setFormData({ blogCategoryName: item.blogCategoryName });
        setCurrentId(item._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = useCallback(async (blogCategory) => {
        dispatch(deleteBlogCategory(blogCategory._id));
    }, [dispatch]);

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ blogCategoryName: '' });
        setError('');
    };

    if (loading) {
        return <AdminLoader message="Loading categories..." icon={FiShoppingCart} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Blog Categories</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={18} />
                        <span>Add Blog Category</span>
                    </button>
                </div>
            </div>
            <Table
                columns={columns}
                data={data}
                onEdit={handleEdit}
                onDelete={handleDelete}
                itemsPerPage={10}
                exportFileName="Blog_Categories"
                allowExport={false}
            />

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] shadow-xl w-full max-w-md overflow-hidden font-jost">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {isEditing ? 'Edit Blog Category' : 'Add Blog Category'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" autoFocus
                                    value={formData.blogCategoryName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, blogCategoryName: e.target.value });
                                        if (error) setError('');
                                    }}
                                    className={`w-full px-3 py-2.5 border rounded-[4px] outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                    placeholder="e.g. Health & Nutrition"
                                />
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                                <p className="text-xs text-gray-400 mt-1">A URL-friendly slug will be auto-generated from this name.</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button" onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-[4px] hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={submitLoading}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-[4px] hover:bg-primaryHover shadow-lg shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-70"
                                >
                                    {submitLoading && (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {isEditing ? 'Update Category' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )} 
        </>
    );
};

export default BlogCategoryAdmin;
