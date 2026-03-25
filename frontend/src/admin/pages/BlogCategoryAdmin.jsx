import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import Table from '../component/DataTable';
import { FiPlus, FiX, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import Breadcrumb from '../component/Breadcrumb';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/slice/alert.slice';

const BlogCategoryAdmin = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ blogCategoryName: '' });

    // Delete Modal state
    const [deleteItem, setDeleteItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    // ─── GET ALL ─────────────────────────────────────────────────────────────────
    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Route: GET /all/category
            const res = await axios.get(`${BASE_URL}/all/category`, { headers: getAuthHeader() });
            if (res.data.success) {
                setData(res.data.result?.blogsCategory || res.data.result || []);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setData([]); // Backend returns 404 on empty array instead of 200 with []
            } else {
                dispatch(setAlert({ text: 'Failed to load blog categories', type: 'error' }));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const columns = [
        {
            header: '#',
            accessor: '_id',
            render: (_, idx) => <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
        },
        { header: 'Category Name', accessor: 'blogCategoryName' },
        {
            header: 'Created',
            accessor: 'createdAt',
            render: (item) => new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
        },
    ];

    // ─── CREATE / UPDATE ─────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitLoading(true);
            if (isEditing) {
                // Route: PATCH /update/blogCategory/:categoryId
                await axios.patch(`${BASE_URL}/update/blogCategory/${currentId}`, formData, { headers: getAuthHeader() });
                dispatch(setAlert({ text: 'Category updated successfully', type: 'success' }));
            } else {
                // Route: POST /new/blogCategory
                await axios.post(`${BASE_URL}/new/blogCategory`, formData, { headers: getAuthHeader() });
                dispatch(setAlert({ text: 'Category added successfully', type: 'success' }));
            }
            closeModal();
            fetchCategories();
        } catch (error) {
            dispatch(setAlert({ text: error.response?.data?.message || 'Something went wrong', type: 'error' }));
        } finally {
            setSubmitLoading(false);
        }
    };

    // ─── EDIT ────────────────────────────────────────────────────────────────────
    const handleEdit = (item) => {
        setFormData({ blogCategoryName: item.blogCategoryName });
        setCurrentId(item._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // ─── DELETE ──────────────────────────────────────────────────────────────────
    const promptDelete = (item) => {
        setDeleteItem(item);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;
        try {
            setIsDeleting(true);
            await axios.delete(`${BASE_URL}/delete/blogCategory/${deleteItem._id}`, { headers: getAuthHeader() });
            dispatch(setAlert({ text: 'Category deleted successfully', type: 'success' }));
            setDeleteItem(null);
            fetchCategories();
        } catch (error) {
            console.error('Delete error:', error.response?.data);
            dispatch(setAlert({ text: error.response?.data?.message || 'Delete failed', type: 'error' }));
        } finally {
            setIsDeleting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ blogCategoryName: '' });
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center md:my-6 my-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Blog Categories</h2>
                    <Breadcrumb />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCategories}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-[4px] transition-colors"
                        title="Refresh"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={16} />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={data}
                    onEdit={handleEdit}
                    onDelete={promptDelete}
                    itemsPerPage={10}
                />
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] shadow-xl w-full max-w-md overflow-hidden font-jost">
                        {/* Modal Header */}
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

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" required autoFocus
                                    value={formData.blogCategoryName}
                                    onChange={(e) => setFormData({ ...formData, blogCategoryName: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-[4px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                                    placeholder="e.g. Health & Nutrition"
                                />
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

            {/* Delete Confirmation Modal */}
            {deleteItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] shadow-xl w-full max-w-sm overflow-hidden font-jost p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <FiTrash2 className="text-red-500 text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Category</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteItem.blogCategoryName}"</span>? This action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteItem(null)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-[4px] hover:bg-gray-200 transition-colors disabled:opacity-70"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-[4px] hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {isDeleting && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BlogCategoryAdmin;
