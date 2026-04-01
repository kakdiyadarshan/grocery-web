import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts
} from '../../redux/slice/product.slice';
import { getAllCategories } from '../../redux/slice/category.slice';
import Table from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import AdminLoader from '../component/AdminLoader';
import { FiPlus, FiX, FiUpload, FiLoader, FiTrash2, FiPlusCircle, FiAlertTriangle, FiTag, FiCalendar, FiStar, FiAward, FiBarChart2, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import DeleteModal from '../component/DeleteModal';
import StockChart from '../component/StockChart';
import CategoryChart from '../component/CategoryChart';
import CustomSelect from '../component/CustomSelect';
import ReactQuill from 'react-quill-new';

const Product = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, totalProducts, loading } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const fileInputRef = useRef(null);
    const excelInputRef = useRef(null);
    const importImagesRef = useRef(null);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [activeChartTab, setActiveChartTab] = useState('stock');
    const [importExcelFile, setImportExcelFile] = useState(null);
    const [importImageFiles, setImportImageFiles] = useState([]);

    const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    useEffect(() => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            paginate: true,
            search: searchTerm
        };
        dispatch(getAllProducts(params));
    }, [dispatch, currentPage, itemsPerPage, searchTerm]);

    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    useEffect(() => {
        if (isModalOpen || isImportModalOpen || isChartModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen, isImportModalOpen, isChartModalOpen]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Product name is required'),
        category: Yup.string().required('Category is required'),
        description: Yup.string().required('Description is required'),
        weighstWise: Yup.array().of(
            Yup.object().shape({
                weight: Yup.string().required('Required'),
                unit: Yup.string().required('Required'),
                price: Yup.number().required('Required').min(0),
                stock: Yup.number().required('Required').min(0),
            })
        ).min(1, 'At least one price variation is required'),
        images: Yup.array().test('imageRequirement', 'Please upload at least 4 images', function (value) {
            const { isEditMode } = this.options.context || { isEditMode: false };
            const totalImages = (value?.length || 0) + (existingImagesToKeep?.length || 0);
            return isEditMode ? totalImages >= 0 : totalImages >= 4;
        })
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            category: '',
            description: '',
            weighstWise: [{ weight: '', unit: 'Kilogram', price: '', stock: '' }],
            images: [],
            tags: [],
            sku: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('category', values.category);
            formData.append('description', values.description);
            formData.append('weighstWise', JSON.stringify(values.weighstWise));
            formData.append('sku', values.sku);

            // Append tags individually for better compatibility
            if (values.tags && values.tags.length > 0) {
                values.tags.forEach(tag => formData.append('tags', tag));
            } else {
                formData.append('tags', '[]'); // Explicit empty array
            }

            values.images.forEach((image) => {
                if (image instanceof File) {
                    formData.append('images', image);
                }
            });

            if (isEditMode && selectedProduct) {
                formData.append('oldImages', JSON.stringify(existingImagesToKeep));
                await dispatch(updateProduct({ id: selectedProduct._id, formData })).unwrap();
            } else {
                await dispatch(createProduct(formData)).unwrap();
            }
            handleCloseModal();
        },
    });

    const handleOpenModal = (product = null) => {
        if (product && typeof product === 'object' && product._id) {
            setIsEditMode(true);
            setSelectedProduct(product);
            formik.setValues({
                name: product.name,
                category: product.category?._id || product.category,
                description: product.description,
                weighstWise: product.weighstWise.map(w => ({
                    weight: w.weight,
                    unit: w.unit || 'Kilogram',
                    price: w.price,
                    stock: w.stock
                })),
                images: [],
                tags: product.tags || [],
                sku: product.sku || '',
            });
            setExistingImagesToKeep(product.images.map(img => img.public_id));
            setImagePreviews(product.images.map(img => ({ url: img.url, public_id: img.public_id })));
        } else {
            setIsEditMode(false);
            setSelectedProduct(null);
            formik.resetForm();
            setImagePreviews([]);
            setExistingImagesToKeep([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setSelectedProduct(null);
        formik.resetForm();
        setImagePreviews([]);
        setExistingImagesToKeep([]);
    };

    const handleView = (product) => {
        navigate(`view/${product._id}`);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = [...formik.values.images, ...files];
            formik.setFieldValue('images', newImages);

            const filePreviews = files.map(file => ({
                url: URL.createObjectURL(file),
                isNew: true
            }));
            setImagePreviews(prev => [...prev, ...filePreviews]);
        }
    };

    const handleRemoveImage = (index) => {
        const imageToRemove = imagePreviews[index];

        if (imageToRemove.isNew) {
            // Find the index in formik.values.images
            const newImagesIndex = imagePreviews.filter((img, i) => i < index && img.isNew).length;
            const newImages = [...formik.values.images];
            newImages.splice(newImagesIndex, 1);
            formik.setFieldValue('images', newImages);
        } else {
            // It's an existing image, remove from existingImagesToKeep
            setExistingImagesToKeep(prev => prev.filter(pid => pid !== imageToRemove.public_id));
        }

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleDelete = async (product) => {
        if (product && product._id) {
            await dispatch(deleteProduct(product._id));
        }
    };

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
        setImportExcelFile(null);
        setImportImageFiles([]);
        if (excelInputRef.current) excelInputRef.current.value = "";
        if (importImagesRef.current) importImagesRef.current.value = "";
    };

    const handleBulkImport = async () => {
        if (!importExcelFile) return;

        const formData = new FormData();
        formData.append('excel', importExcelFile);

        importImageFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            await dispatch(importProducts(formData)).unwrap();
            dispatch(getAllProducts());
            handleCloseImportModal();
        } catch (error) {
            console.error("Import failed:", error);
        }
    };

    const renderStars = (reviews) => {
        if (!reviews || reviews.length === 0) {
            return (
                <div className="flex items-center gap-1.5 opacity-40">
                    <div className="flex text-gray-300">
                        {[...Array(5)].map((_, i) => <FaStar key={i} size={12} />)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">(0)</span>
                </div>
            );
        }

        const avgRating = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / reviews.length;
        const roundedRating = Math.round(avgRating * 2) / 2;

        return (
            <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        if (starValue <= roundedRating) return <FaStar key={i} size={12} />;
                        if (starValue - 0.5 === roundedRating) return <FaStarHalfAlt key={i} size={12} />;
                        return <FaStar key={i} size={12} className="text-gray-200" />;
                    })}
                </div>
                <span className="text-[10px] font-bold text-gray-500">
                    {avgRating.toFixed(1)} <span className="text-gray-400">({reviews.length})</span>
                </span>
            </div>
        );
    };

    const columns = [
        {
            header: 'Image',
            accessor: 'images',
            // hideInExport: true,
            exportValue: (row) => `${row.images[0]?.url}`,
            render: (row) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                    <img
                        src={row.images[0]?.url || 'https://via.placeholder.com/50'}
                        alt={row.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        { header: 'Product', accessor: 'name', sortable: true },
        {
            header: 'SKU',
            accessor: 'sku',
            render: (row) => <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">{row.sku || '-'}</span>,
            sortable: true
        },
        { header: 'Category', accessor: 'category.categoryName', exportValue: (row) => `${row.category?.categoryName}` || '-', render: (row) => row.category?.categoryName || '-', searchKey: (row) => `${row.category?.categoryName}`.trim() },
        {
            header: 'Price Range',
            accessor: 'weighstWise',
            searchKey: (row) => `${row.weighstWise.map(w => w.price)}`.trim(),
            exportValue: (row) => {
                const variantPrices = row.weighstWise.map(v => `${v.weight}${v.unit}: $${v.price}`).join(', ');
                const prices = row.weighstWise.map(w => w.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const range = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
                return `${range} (${variantPrices})`;
            },
            render: (row) => {
                const prices = row.weighstWise.map(w => w.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
            }
        },
        {
            header: 'Rating',
            accessor: 'reviews',
            searchKey: (row) => `${row.reviews.map(r => r.rating)}`.trim(),
            exportValue: (row) => {
                if (!row.reviews || row.reviews.length === 0) return '0.0';
                const avgRating = row.reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / row.reviews.length;
                return avgRating.toFixed(1);
            },
            render: (row) => renderStars(row.reviews),
            sortable: true
        },
        {
            header: 'Stock Status',
            accessor: 'weighstWise',
            exportValue: (row) => {
                const variantDetails = row.weighstWise.map(v => `${v.weight}${v.unit}: ${v.stock}`).join(', ');
                return variantDetails;
            },
            render: (row) => {
                const lowStockItems = row.weighstWise.filter(v => v.stock <= 10);
                if (lowStockItems.length === 0) {
                    return <span className="text-green-600 font-bold text-xs  tracking-wider">In Stock</span>;
                }
                return (
                    <div className="flex flex-col gap-1">
                        {lowStockItems.map((item, idx) => (
                            <span key={idx} className=" font-bold text-red-500 ">
                                {item.stock}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        {
            header: 'Total Stock',
            accessor: 'weighstWise',
            hideInTable: true,
            exportValue: (row) => row.weighstWise.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
        },
    ];

    if (loading) {
        return <AdminLoader message="Loading products..." icon={FiShoppingCart} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Products</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => setIsChartModalOpen(true)}
                        className=" gap-2 flex items-center justify-center w-full sm:w-auto sm:px-5 px-3 py-2.5 bg-white text-primary border border-primary rounded-[4px] hover:bg-primary/5 transition-all shadow-md active:scale-95 font-medium text-sm tracking-wider whitespace-nowrap"
                    >
                        <FiBarChart2 size={18} />
                        <span className='hidden md:block'>Stock Analytics</span>
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className=" gap-2 flex items-center justify-center w-full sm:w-auto sm:px-5 px-3 py-2.5 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-all shadow-md active:scale-95 font-medium text-sm  tracking-wider whitespace-nowrap"
                    >
                        <FiUpload size={18} />
                        <span className='hidden md:block'>Bulk Import</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className=" gap-2 flex items-center justify-center w-full sm:w-auto sm:px-5 px-3 py-2.5 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-all shadow-md active:scale-95 font-medium text-sm  tracking-wider whitespace-nowrap"
                    >
                        <FiPlus size={18} />
                        <span className='hidden md:block'>Add Product</span>
                    </button>
                </div>
            </div>



            <Table
                columns={columns}
                data={products}
                onEdit={handleOpenModal}
                onView={handleView}
                onDelete={handleDelete}
                itemsPerPage={itemsPerPage}
                manualPagination={true}
                manualTotalItems={totalProducts}
                manualCurrentPage={currentPage}
                manualRowsPerPage={itemsPerPage}
                onManualPageChange={(page) => setCurrentPage(page)}
                onManualRowsPerPageChange={(rows) => {
                    setItemsPerPage(rows);
                    setCurrentPage(1);
                }}
                onSearch={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                }}
                exportFileName="Products"
                allowExport={true}
            />

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                                {isEditMode ? 'Update Product' : 'Create New Product'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <FormikProvider value={formik}>
                            <form onSubmit={formik.handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Side: Basic Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 block">
                                                Product Name <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <input
                                                name="name"
                                                type="text"
                                                placeholder="e.g. Organic Red Apple"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.name}
                                                className={`w-full px-4 py-2.5 border rounded-[4px] outline-none transition-all bg-gray-50/50 focus:bg-white text-gray-900 text-sm ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                            />
                                            {formik.touched.name && formik.errors.name && <p className="text-xs text-red-500">{formik.errors.name}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <CustomSelect
                                                label="Category"
                                                className="w-full"
                                                options={categories.map((cat) => ({ value: cat._id, label: cat.categoryName }))}
                                                value={formik.values.category}
                                                onChange={(value) => formik.setFieldValue('category', value)}
                                                placeholder="Select Category"
                                                required
                                                buttonClassName={formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-gray-200'}
                                            />
                                            {formik.touched.category && formik.errors.category && <p className="text-xs text-red-500">{formik.errors.category}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 block">
                                                SKU (Stock Keeping Unit) <span className="text-xs font-normal text-gray-400">(Optional)</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    name="sku"
                                                    type="text"
                                                    placeholder="e.g. VEG-APPLE-8f3a"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.sku}
                                                    className="flex-grow px-4 py-2.5 w-full border border-gray-200 rounded-[4px] outline-none transition-all bg-gray-50/50 focus:bg-white text-gray-900 text-sm focus:border-primary"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const category = categories.find(c => c._id === formik.values.category);
                                                        const catPart = category ? category.categoryName.substring(0, 3).toUpperCase() : 'PRO';
                                                        const namePart = formik.values.name ? formik.values.name.substring(0, 3).toUpperCase() : 'ITEM';
                                                        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
                                                        formik.setFieldValue('sku', `${catPart}-${namePart}-${randomPart}`);
                                                    }}
                                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[4px] text-xs transition-all border border-gray-200"
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100">
                                            <label className="text-sm font-semibold text-gray-700 block mb-3">Product Tags <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
                                            <div className="flex flex-wrap gap-3">
                                                {[
                                                    { value: 'featured', label: 'Featured', icon: <FiStar size={13} />, color: 'emerald' },
                                                    { value: 'best_selling', label: 'Best Selling', icon: <FiAward size={13} />, color: 'green' }
                                                ].map(tag => {
                                                    const isChecked = formik.values.tags.includes(tag.value);
                                                    return (
                                                        <label
                                                            key={tag.value}
                                                            className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer transition-all select-none text-sm font-semibold ${isChecked
                                                                ? tag.color === 'emerald'
                                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                                    : 'border-green-500 bg-green-50 text-green-700'
                                                                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    const current = formik.values.tags;
                                                                    const updated = isChecked
                                                                        ? current.filter(t => t !== tag.value)
                                                                        : [...current, tag.value];
                                                                    formik.setFieldValue('tags', updated);
                                                                }}
                                                            />
                                                            <span className={isChecked ? (tag.color === 'emerald' ? 'text-emerald-500' : 'text-green-500') : 'text-gray-400'}>
                                                                {tag.icon}
                                                            </span>
                                                            {tag.label}
                                                            {isChecked && (
                                                                <span className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black ${tag.color === 'emerald' ? 'bg-emerald-500' : 'bg-green-500'
                                                                    }`}>✓</span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Pricing & Stock */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-semibold text-gray-700">Weights & Price</label>
                                                <button
                                                    type="button"
                                                    onClick={() => formik.setFieldValue('weighstWise', [...formik.values.weighstWise, { weight: '', price: '', stock: '' }])}
                                                    className="text-primary hover:text-primaryHover flex items-center gap-1 text-xs font-bold  tracking-wider"
                                                >
                                                    <FiPlusCircle size={14} /> Add Variation
                                                </button>
                                            </div>

                                            <div className="pr-2 space-y-4">
                                                <FieldArray
                                                    name="weighstWise"
                                                    render={arrayHelpers => (
                                                        <div className="space-y-3">
                                                            {formik.values.weighstWise.map((variation, index) => (
                                                                <div key={index} style={{ zIndex: formik.values.weighstWise.length - index }} className="flex gap-2 items-start bg-gray-50/80 p-4 rounded-xl border border-gray-100 relative group transition-all hover:bg-gray-100/50">
                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-grow">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-gray-400  ml-1">Weight</label>
                                                                            <input
                                                                                name={`weighstWise[${index}].weight`}
                                                                                placeholder="e.g. 500"
                                                                                onChange={formik.handleChange}
                                                                                value={variation.weight}
                                                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 bg-white"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-gray-400  ml-1">Unit</label>
                                                                            <CustomSelect
                                                                                className="w-full"
                                                                                options={[
                                                                                    { value: 'Gram', label: 'g' },
                                                                                    { value: 'Kilogram', label: 'kg' },
                                                                                    { value: 'Pound', label: 'lb' },
                                                                                    { value: 'Liter', label: 'L' },
                                                                                    { value: 'Milliliter', label: 'ml' },
                                                                                    { value: 'Piece', label: 'pc' }
                                                                                ]}
                                                                                value={variation.unit}
                                                                                onChange={(value) => formik.setFieldValue(`weighstWise[${index}].unit`, value)}
                                                                                placeholder="Unit"
                                                                                searchable={false}
                                                                                buttonClassName="!h-[34px] !py-0 !px-3 !text-xs !rounded-lg "
                                                                                optionClassName="!py-1.5 !px-3 !text-[11px]"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-gray-400  ml-1">Price ($)</label>
                                                                            <input
                                                                                name={`weighstWise[${index}].price`}
                                                                                type="text"
                                                                                placeholder="0.00"
                                                                                onChange={formik.handleChange}
                                                                                value={variation.price}
                                                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 bg-white"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-gray-400  ml-1">Stock</label>
                                                                            <input
                                                                                name={`weighstWise[${index}].stock`}
                                                                                type="text"
                                                                                placeholder="0"
                                                                                onChange={formik.handleChange}
                                                                                value={variation.stock}
                                                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 bg-white"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {formik.values.weighstWise.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => arrayHelpers.remove(index)}
                                                                            className="mt-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                        >
                                                                            <FiTrash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 block">
                                                Product Images {!isEditMode && <span className="text-red-500 font-bold">* (Min 4)</span>}
                                            </label>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-4 gap-2">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                                                        <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                        >
                                                            <FiX size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                                >
                                                    <FiUpload className="text-gray-400" size={20} />
                                                    <span className="text-[8px] font-bold text-gray-500 mt-1 ">Upload</span>
                                                </div>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                            />
                                            {formik.touched.images && formik.errors.images && <p className="text-xs text-red-500">{formik.errors.images}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 block">
                                        Description <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <div className={`rounded-[4px] border ${formik.touched.description && formik.errors.description ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'} focus-within:border-primary transition-all bg-white quill-wrapper-fix relative`}>
                                        <ReactQuill
                                            theme="snow"
                                            value={formik.values.description}
                                            onChange={(val) => formik.setFieldValue('description', val)}
                                            onBlur={() => formik.setFieldTouched('description', true)}
                                            modules={quillModules}
                                            placeholder="Product details..."
                                            style={{ minHeight: '150px' }}
                                            className="quill-responsive bg-white"
                                        />
                                    </div>
                                    {formik.touched.description && formik.errors.description && <p className="text-xs text-red-500 mt-1">{formik.errors.description}</p>}
                                </div>

                                <div className="mt-8 border-t pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-[4px] transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {loading ? <FiLoader className="animate-spin h-5 w-5" /> : isEditMode ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </FormikProvider>
                    </div>
                </div>
            )}

            {/* Global CSS injected to fix ReactQuill responsive toolbar and Link tooltip */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .quill-wrapper-fix .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                    background-color: #f9fafb;
                }
                .quill-wrapper-fix .ql-toolbar .ql-formats {
                    margin-right: 0 !important;
                }
                .quill-wrapper-fix .ql-container {
                    border: none;
                    border-bottom-left-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
                .quill-wrapper-fix .ql-tooltip {
                    z-index: 9999 !important;
                }
            `}} />

            {/* Bulk Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <FiUpload className="text-green-600" /> Bulk Product Import
                            </h2>
                            <button
                                onClick={handleCloseImportModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Excel Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-[600] text-textPrimary block">Step 1: Select Excel File</label>
                                <div
                                    onClick={() => excelInputRef.current.click()}
                                    className={`relative p-8 border-2 border-dashed rounded-[4px] flex flex-col items-center justify-center cursor-pointer transition-all ${importExcelFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        className="hidden"
                                        ref={excelInputRef}
                                        onChange={(e) => setImportExcelFile(e.target.files[0])}
                                    />
                                    <FiUpload size={24} className={importExcelFile ? 'text-green-600' : 'text-gray-400'} />
                                    <p className={`mt-2 text-sm font-bold ${importExcelFile ? 'text-green-700' : 'text-textSecondary'}`}>
                                        {importExcelFile ? importExcelFile.name : 'Click to select Excel (.xlsx, .xls)'}
                                    </p>
                                    {importExcelFile && <span className="text-[10px] text-green-600 mt-1">Ready for processing</span>}
                                </div>
                            </div>

                            {/* Images Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-[600] text-textPrimary block">Step 2: Select Images Folder</label>
                                <div
                                    onClick={() => importImagesRef.current.click()}
                                    className={`relative p-8 border-2 border-dashed rounded-[4px] flex flex-col items-center justify-center cursor-pointer transition-all ${importImageFiles.length > 0 ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={importImagesRef}
                                        onChange={(e) => setImportImageFiles(Array.from(e.target.files))}
                                        accept="image/*"
                                    />
                                    <FiUpload size={24} className={importImageFiles.length > 0 ? 'text-primary' : 'text-gray-400'} />
                                    <p className={`mt-2 text-sm font-bold ${importImageFiles.length > 0 ? 'text-primary' : 'text-textSecondary'}`}>
                                        {importImageFiles.length > 0 ? `${importImageFiles.length} images selected` : 'Select image files or folder'}
                                    </p>
                                    {importImageFiles.length > 0 && <span className="text-[10px] text-primary mt-1">Images will be matched with Excel names</span>}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-[4px] flex items-start gap-3">
                                <FiAlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                    Make sure the image names in your Excel file (e.g., <span className="font-bold">apple.jpg</span>) exactly match the filenames of the images you upload.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50/50 flex flex-col gap-3">
                            <button
                                onClick={handleBulkImport}
                                disabled={!importExcelFile || loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-[600] py-3 rounded-[4px] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? <FiLoader className="animate-spin h-5 w-5" /> : (
                                    <>
                                        <FiUpload size={18} />
                                        Bluk Import Product
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCloseImportModal}
                                className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm font-[600]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {isChartModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setIsChartModalOpen(false)}>
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-6xl h-[650px] max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsChartModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-[110]"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-10 rounded-[4px] p-3 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 gap-6">
                            <div className="flex flex-col min-w-[200px]">
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <FiBarChart2 className="text-primary" /> Inventory Analytics
                                </h2>
                                <p className="text-[10px] text-gray-500 font-medium">Real-time overview of your store inventory</p>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex bg-gray-100 p-1 rounded-lg gap-1 mx-auto sm:mx-0 border border-gray-200 overflow-x-auto no-scrollbar max-w-[80%] sm:max-w-none">
                                <button
                                    onClick={() => setActiveChartTab('stock')}
                                    className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap outline-none ${activeChartTab === 'stock' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Stock Levels
                                </button>
                                <button
                                    onClick={() => setActiveChartTab('category')}
                                    className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap outline-none ${activeChartTab === 'category' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Category Mix
                                </button>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30 no-scrollbar">
                            {activeChartTab === 'stock' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <StockChart products={products} noContainer={true} />
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <CategoryChart products={products} categories={categories} />
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setIsChartModalOpen(false)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[4px] text-sm font-bold transition-all border border-gray-200 shadow-sm active:scale-95"
                            >
                                Close Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Product;