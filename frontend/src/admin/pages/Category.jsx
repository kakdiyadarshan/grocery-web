import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../../redux/slice/category.slice';
import Table from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiPlus, FiX, FiUpload, FiLoader, FiAlertTriangle, FiGrid, FiShoppingCart } from 'react-icons/fi';
import AdminLoader from '../component/AdminLoader';
import DeleteModal from '../component/DeleteModal';

const Category = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.category);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            categoryName: '',
            description: '',
            categoryImage: null,
        },
        validationSchema: Yup.object({
            categoryName: Yup.string().required('Category Name is required'),
            description: Yup.string(),
            categoryImage: Yup.mixed().required('Category Image is required'),
        }),
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('categoryName', values.categoryName);
            formData.append('description', values.description);
            if (values.categoryImage instanceof File) {
                formData.append('categoryImage', values.categoryImage);
            }

            try {
                if (isEditMode && selectedCategory) {
                    await dispatch(updateCategory({ id: selectedCategory._id, formData })).unwrap();
                } else {
                    await dispatch(createCategory(formData)).unwrap();
                }
                handleCloseModal();
            } catch (error) {
                console.error("Operation failed:", error);
            }
        },
    });

    const handleOpenModal = (category = null) => {
        if (category && typeof category === 'object' && category._id) {
            setIsEditMode(true);
            setSelectedCategory(category);
            formik.setValues({
                categoryName: category.categoryName,
                description: category.description || '',
                categoryImage: category.categoryImage?.url || null,
            });
            setImagePreview(category.categoryImage?.url);
        } else {
            setIsEditMode(false);
            setSelectedCategory(null);
            formik.resetForm();
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setSelectedCategory(null);
        formik.resetForm();
        setImagePreview(null);
    };

    const handleView = (category) => {
        setSelectedCategory(category);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedCategory(null);
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('categoryImage', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        formik.setFieldValue('categoryImage', null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = useCallback(async (category) => {
        dispatch(deleteCategory(category._id));
    }, [dispatch]);

    const columns = [
        {
            header: 'Image',
            accessor: 'categoryImage',
            // hideInExport: true,
            exportValue: (row) => `${row.categoryImage?.url}`,
            render: (row) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                    <img
                        src={row.categoryImage?.url || 'https://via.placeholder.com/50'}
                        alt={row.categoryName}
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        { header: 'Category Name', accessor: 'categoryName', sortable: true },
        { header: 'Description', accessor: 'description', render: (row) => <span className="text-sm text-gray-500 line-clamp-1 truncate">{row.description || '-'}</span> },
    ];

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Categories</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={18} />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            <>
                {loading ? (
                    <AdminLoader message="Loading categories..." icon={FiShoppingCart} />
                ) : (

                    <Table
                        columns={columns}
                        data={categories}
                        onEdit={handleOpenModal}
                        onView={handleView}
                        onDelete={handleDelete}
                        itemsPerPage={10}
                        exportFileName="Categories_List"
                        allowExport={true}
                    />
                )}
            </>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                                {isEditMode ? 'Update Category' : 'Create New Category'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
                            {/* Category Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">
                                    Category Name <span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    id="categoryName"
                                    name="categoryName"
                                    type="text"
                                    placeholder="e.g. Fresh Fruits"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.categoryName}
                                    className={`w-full px-4 py-2.5 border rounded-[4px] outline-none transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder-gray-400 text-sm ${formik.touched.categoryName && formik.errors.categoryName
                                        ? 'border-red-500 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary'
                                        }`}
                                />
                                {formik.touched.categoryName && formik.errors.categoryName && (
                                    <p className="text-xs text-red-500 font-medium">{formik.errors.categoryName}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Brief details about this category..."
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.description}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border rounded-[4px] outline-none transition-all bg-gray-50/50 focus:bg-white text-gray-900 border-gray-200 focus:ring-2 focus:ring-primary/10 focus:border-primary text-sm"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 block">
                                    Category Thumbnail <span className="text-red-500 font-bold">*</span>
                                </label>

                                {imagePreview ? (
                                    <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2 min-h-[160px]">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-40 object-contain rounded-md shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px] ${formik.touched.categoryImage && formik.errors.categoryImage
                                            ? 'border-red-300 bg-red-50/50'
                                            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                            <FiUpload className={`${formik.touched.categoryImage && formik.errors.categoryImage ? 'text-red-400' : 'text-gray-400'}`} size={24} />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700">Click to upload image</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">JPG, PNG or WEBP up to 5MB</p>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {formik.touched.categoryImage && formik.errors.categoryImage && (
                                    <p className="text-xs text-red-500 font-medium">{formik.errors.categoryImage}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primaryHover text-white font-[600] py-3 rounded-[4px] transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <FiLoader className="animate-spin h-5 w-5" />
                                ) : isEditMode ? (
                                    'Update Category'
                                ) : (
                                    'Create Category'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Fully Responsive View Modal Redesign */}
            {isViewModalOpen && selectedCategory && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
                    onClick={handleCloseViewModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col max-h-[90vh] cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Hero Image - Responsive Height */}
                        <div className="relative h-40 xs:h-48 sm:h-64 w-full bg-slate-100 flex-shrink-0">
                            <img
                                src={selectedCategory.categoryImage?.url || 'https://via.placeholder.com/600x400'}
                                alt={selectedCategory.categoryName}
                                className="w-full h-full object-cover"
                            />
                            {/* Glassmorphism Close Button - Position Refined */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseViewModal();
                                }}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full shadow-lg transition-all active:scale-90 border border-white/30 group z-10"
                            >
                                <FiX className="group-hover:rotate-90 transition-transform duration-300 w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 pointer-events-none">
                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <span className="px-2 sm:px-2.5 py-0.5 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white ring-1 ring-white/20">
                                        Category Detail
                                    </span>
                                </div>
                                <h3 className="text-white font-extrabold text-xl sm:text-3xl tracking-tight leading-tight drop-shadow-md truncate">
                                    {selectedCategory.categoryName}
                                </h3>
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white overflow-y-auto custom-scrollbar flex-grow">
                            {/* Description Section */}
                            <div className="relative">
                                <h4 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-900 uppercase tracking-[0.2em] mb-3 sm:mb-4">
                                    <div className="w-4 sm:w-6 h-[2px] bg-primary" />
                                    About Category
                                </h4>
                                <div className="bg-gray-50/50 p-4 sm:p-5 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed italic">
                                        {selectedCategory.description || "No description provided for this category. Enrich your store by adding more details."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer Actions - Responsive Layout */}
                        <div className="p-4 sm:px-8 sm:pb-8 sm:pt-2 bg-white border-t border-gray-50 flex-shrink-0">
                            <div className="flex flex-row items-stretch sm:items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleOpenModal(selectedCategory);
                                    }}
                                    className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl transition-all font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                >
                                    Edit Details
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseViewModal}
                                    className="order-1 sm:order-2 px-6 sm:px-10 py-3 sm:py-3.5 bg-primary text-white hover:bg-white border-2 border-primary hover:text-primary hover:border-primary/20 rounded-xl transition-all font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Category;
