import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../../redux/slice/product.slice';
import { getAllCategories } from '../../redux/slice/category.slice';
import Table from '../component/DataTable';
import Breadcrumb from '../component/Breadcrumb';
import { FiPlus, FiX, FiUpload, FiLoader, FiTrash2, FiPlusCircle } from 'react-icons/fi';

const Product = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);

    useEffect(() => {
        dispatch(getAllProducts());
        dispatch(getAllCategories());
    }, [dispatch]);

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
        },
        validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('category', values.category);
            formData.append('description', values.description);
            formData.append('weighstWise', JSON.stringify(values.weighstWise));

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
        setSelectedProduct(product);
        setIsViewModalOpen(true);
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
        if (window.confirm(`Are you sure you want to delete the product "${product.name}"?`)) {
            await dispatch(deleteProduct(product._id));
        }
    };

    const columns = [
        {
            header: 'Image',
            accessor: 'images',
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
        { header: 'Product Name', accessor: 'name', sortable: true },
        { header: 'Category', accessor: 'category.categoryName', render: (row) => row.category?.categoryName || '-' },
        {
            header: 'Price Range',
            accessor: 'weighstWise',
            render: (row) => {
                const prices = row.weighstWise.map(w => w.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
            }
        },
        {
            header: 'Stock Status',
            accessor: 'weighstWise',
            render: (row) => {
                const lowStockItems = row.weighstWise.filter(v => v.stock <= 10);
                if (lowStockItems.length === 0) {
                    return <span className="text-green-600 font-bold text-xs uppercase tracking-wider">In Stock</span>;
                }
                return (
                    <div className="flex flex-col gap-1">
                        {lowStockItems.map((item, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 whitespace-nowrap">
                                {item.weight}{item.unit}: {item.stock} Left
                            </span>
                        ))}
                    </div>
                );
            }
        },
    ];

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 text-textprimary tracking-tight">Products</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                    >
                        <FiPlus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <Table
                columns={columns}
                data={products}
                onEdit={handleOpenModal}
                onView={handleView}
                onDelete={handleDelete}
                itemsPerPage={10}
            />

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
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
                                            <label className="text-sm font-semibold text-gray-700 block">
                                                Category <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <select
                                                name="category"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.category}
                                                className={`w-full px-4 py-2.5 border rounded-[4px] outline-none transition-all bg-gray-50/50 focus:bg-white text-gray-900 text-sm ${formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                                ))}
                                            </select>
                                            {formik.touched.category && formik.errors.category && <p className="text-xs text-red-500">{formik.errors.category}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 block">
                                                Description <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <textarea
                                                name="description"
                                                placeholder="Product details..."
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.description}
                                                rows={4}
                                                className={`w-full px-4 py-2.5 border rounded-[4px] outline-none transition-all bg-gray-50/50 focus:bg-white text-gray-900 text-sm ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                            />
                                            {formik.touched.description && formik.errors.description && <p className="text-xs text-red-500">{formik.errors.description}</p>}
                                        </div>
                                    </div>

                                    {/* Right Side: Pricing & Stock */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-semibold text-gray-700">Weights & Pricing</label>
                                                <button
                                                    type="button"
                                                    onClick={() => formik.setFieldValue('weighstWise', [...formik.values.weighstWise, { weight: '', price: '', stock: '' }])}
                                                    className="text-primary hover:text-primaryHover flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    <FiPlusCircle size={14} /> Add Variation
                                                </button>
                                            </div>

                                            <FieldArray
                                                name="weighstWise"
                                                render={arrayHelpers => (
                                                    <div className="space-y-4">
                                                        {formik.values.weighstWise.map((variation, index) => (
                                                            <div key={index} className="flex gap-2 items-start bg-gray-50/80 p-4 rounded-xl border border-gray-100 relative group transition-all hover:bg-gray-100/50">
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-grow">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Value</label>
                                                                        <input
                                                                            name={`weighstWise[${index}].weight`}
                                                                            placeholder="e.g. 500"
                                                                            onChange={formik.handleChange}
                                                                            value={variation.weight}
                                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 bg-white"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Unit</label>
                                                                        <select
                                                                            name={`weighstWise[${index}].unit`}
                                                                            onChange={formik.handleChange}
                                                                            value={variation.unit}
                                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 bg-white"
                                                                        >
                                                                            <option value="Gram">Gram (g)</option>
                                                                            <option value="Kilogram">Kilogram (kg)</option>
                                                                            <option value="Pound">Pound (lb)</option>
                                                                            <option value="Liter">Liter (L)</option>
                                                                            <option value="Milliliter">Milliliter (ml)</option>
                                                                            <option value="Piece">Piece (pc)</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Price (₹)</label>
                                                                        <input
                                                                            name={`weighstWise[${index}].price`}
                                                                            type="number"
                                                                            placeholder="0.00"
                                                                            onChange={formik.handleChange}
                                                                            value={variation.price}
                                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 bg-white"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Stock</label>
                                                                        <input
                                                                            name={`weighstWise[${index}].stock`}
                                                                            type="number"
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

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 block">
                                                Product Images {!isEditMode && <span className="text-red-500 font-bold">* (Min 4)</span>}
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
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
                                                    <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase">Upload</span>
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

                                <div className="mt-8 border-t pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-[4px] transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                                    >
                                        {loading ? <FiLoader className="animate-spin h-5 w-5" /> : isEditMode ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </FormikProvider>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsViewModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-64 w-full bg-slate-100">
                            <img src={selectedProduct.images[0]?.url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full shadow-lg transition-all"><FiX size={20} /></button>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-6 left-8 right-8">
                                <span className="px-2.5 py-0.5 bg-primary/20 backdrop-blur-md border border-primary/30 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">Product Details</span>
                                <h3 className="text-white font-extrabold text-3xl mt-2">{selectedProduct.name}</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-6 h-[2px] bg-primary" /> About Product
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{selectedProduct.description}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-6 h-[2px] bg-primary" /> Pricing & Stock
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedProduct.weighstWise.map((v, i) => {
                                            const isLowStock = v.stock <= 10;
                                            return (
                                                <div key={i} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${isLowStock ? 'bg-red-50 border-red-100 ring-1 ring-red-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${isLowStock ? 'text-red-700' : 'text-gray-700'}`}>{v.weight} {v.unit}</span>
                                                        <span className={`text-[11px] font-extrabold uppercase tracking-widest mt-1 ${isLowStock ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                                            Stock: {v.stock} {isLowStock && '(Low Stock)'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-black text-xl ${isLowStock ? 'text-red-600' : 'text-primary'}`}>₹{v.price}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-6 h-[2px] bg-primary" /> Gallery
                                </h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {selectedProduct.images.map((img, i) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden border">
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3">
                            <button onClick={() => { setIsViewModalOpen(false); handleOpenModal(selectedProduct); }} className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-primary/5 transition-all">Edit</button>
                            <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Product;