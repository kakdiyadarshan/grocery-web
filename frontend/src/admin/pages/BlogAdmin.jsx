import React, { useState, useEffect } from 'react';
import Table from '../component/DataTable';
import { FiPlus, FiTrash2, FiImage, FiArrowLeft, FiRefreshCw, FiX } from 'react-icons/fi';
import Breadcrumb from '../component/Breadcrumb';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog
} from '../../redux/slice/blog.slice';
import { getAllBlogCategory } from '../../redux/slice/blogCategory.slice';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import CustomSelect from '../component/CustomSelect';

const BlogAdmin = () => {
    const dispatch = useDispatch();

    // Select state from Redux
    const { blogs, loading, submitLoading } = useSelector(state => state.blog);
    const { blogCategory: categories } = useSelector(state => state.blogCategory);

    // View state: 'list' | 'form' | 'view'
    const [view, setView] = useState('list');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [viewBlog, setViewBlog] = useState(null);

    // Delete Modal state
    const [deleteItem, setDeleteItem] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        blogTitle: '',
        blogCategoryId: '',
        blogDesc: '',
        conclusion: '',
    });
    const [heroImage, setHeroImage] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);
    const [sections, setSections] = useState([]);
    const [errors, setErrors] = useState({});

    // ─── API CALLS ──────────────────────────────────────────────────────────────

    const fetchBlogs = () => {
        dispatch(getAllBlogs());
    };

    const fetchCategories = () => {
        dispatch(getAllBlogCategory());
    };

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, []);

    // ─── TABLE COLUMNS ──────────────────────────────────────────────────────────

    const columns = [
        {
            header: '#',
            accessor: '_id',
            hideInExport: true,
            render: (_, idx) => <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
        },
        {
            header: 'Hero Image',
            accessor: 'heroImage',
            hideInExport: true,
            render: (item) => item.heroImage
                ? <img src={item.heroImage} className="w-14 h-14 object-cover rounded-[4px] border border-gray-100" alt="" />
                : <span className="text-xs text-gray-400">No Image</span>
        },
        { header: 'Blog Title', accessor: 'blogTitle' },
        {
            header: 'Category',
            accessor: 'blogCategoryId',
            exportValue: (item) => item.blogCategoryId?.blogCategoryName || 'N/A',
            render: (item) => (
                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-[4px]">
                    {item.blogCategoryId?.blogCategoryName || 'N/A'}
                </span>
            )
        },
        {
            header: 'Sections',
            accessor: 'section',
            exportValue: (item) => `${item.section?.length || 0} sections`,
            render: (item) => (
                <span className="font-semibold text-gray-700">{item.section?.length || 0} sections</span>
            )
        },
        {
            header: 'Created',
            accessor: 'createdAt',
            exportValue: (item) => new Date(item.createdAt).toLocaleString(),
            render: (item) => new Date(item.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
        },
    ];

    // ─── SECTION HELPERS ─────────────────────────────────────────────────────────

    const textToArray = (text) => {
        if (!text) return [];
        return text.split('\n').map(t => t.trim()).filter(t => t);
    };

    const arrayToText = (arr) => {
        if (!arr || !Array.isArray(arr)) return '';
        return arr.join('\n');
    };

    const handleAddSection = () => {
        setSections(prev => [...prev, {
            sectionTitle: '',
            sectionDesc: '',
            sectionPoints: '',
            sectionOtherInfo: '',
            existingImages: [],
            files: null
        }]);
    };

    const handleRemoveSection = (index) => {
        setSections(prev => prev.filter((_, i) => i !== index));
    };

    const handleSectionChange = (index, field, value) => {
        setSections(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleRemoveExistingImage = (sectionIndex, imageIndex) => {
        setSections(prev => {
            const updated = [...prev];
            const updatedSec = { ...updated[sectionIndex] };
            updatedSec.existingImages = updatedSec.existingImages.filter((_, i) => i !== imageIndex);
            updated[sectionIndex] = updatedSec;
            return updated;
        });
    };

    // ─── FORM SUBMIT ─────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.blogTitle.trim()) newErrors.blogTitle = 'Blog title is required';
        if (!formData.blogCategoryId) newErrors.blogCategoryId = 'Category is required';
        if (!formData.blogDesc.trim()) newErrors.blogDesc = 'Description is required';
        if (!heroPreview && !heroImage) newErrors.heroImage = 'Hero image is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstError = Object.keys(newErrors)[0];
            document.getElementsByName(firstError)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setErrors({});
        const data = new FormData();
        data.append('blogTitle', formData.blogTitle);
        data.append('blogCategoryId', formData.blogCategoryId);
        data.append('blogDesc', formData.blogDesc);
        data.append('conclusion', formData.conclusion);

        if (heroImage) data.append('heroImage', heroImage);

        const sectionJson = sections.map(sec => ({
            sectionTitle: sec.sectionTitle,
            sectionDesc: textToArray(sec.sectionDesc),
            sectionPoints: textToArray(sec.sectionPoints),
            sectionOtherInfo: textToArray(sec.sectionOtherInfo),
            sectionImg: sec.existingImages
        }));
        data.append('section', JSON.stringify(sectionJson));

        if (isEditing && !heroPreview && !heroImage) {
            data.append('removeHeroImage', 'true');
        }

        sections.forEach((sec, i) => {
            if (sec.files && sec.files.length > 0) {
                Array.from(sec.files).forEach(file => {
                    data.append(`sectionImg_${i}`, file);
                });
            }
        });

        const action = isEditing
            ? await dispatch(updateBlog({ id: currentId, formData: data }))
            : await dispatch(createBlog(data));

        if (action.type.endsWith('/fulfilled')) {
            closeForm();
            fetchBlogs();
        }
    };

    // ─── CRUD HANDLERS ────────────────────────────────────────────────────────────

    const handleEdit = (item) => {
        setFormData({
            blogTitle: item.blogTitle || '',
            blogCategoryId: item.blogCategoryId?._id || '',
            blogDesc: item.blogDesc || '',
            conclusion: item.conclusion || '',
        });

        if (item.heroImage) setHeroPreview(item.heroImage);
        else setHeroPreview(null);
        setHeroImage(null);

        if (item.section && Array.isArray(item.section)) {
            setSections(item.section.map(sec => ({
                sectionTitle: sec.sectionTitle || '',
                sectionDesc: arrayToText(sec.sectionDesc),
                sectionPoints: arrayToText(sec.sectionPoints),
                sectionOtherInfo: arrayToText(sec.sectionOtherInfo),
                existingImages: sec.sectionImg || [],
                files: null
            })));
        } else {
            setSections([]);
        }

        setCurrentId(item._id);
        setIsEditing(true);
        setView('form');
    };

    const handleView = (item) => {
        setViewBlog(item);
        setView('view');
    };

    const promptDelete = (item) => {
        setDeleteItem(item);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;
        const action = await dispatch(deleteBlog(deleteItem._id));
        if (action.type.endsWith('/fulfilled')) {
            setDeleteItem(null);
        }
    };

    const closeForm = () => {
        setView('list');
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ blogTitle: '', blogCategoryId: '', blogDesc: '', conclusion: '' });
        setHeroImage(null);
        setHeroPreview(null);
        setSections([]);
        setErrors({});
    };

    // ─── RENDER ───────────────────────────────────────────────────────────────────

    return (
        <div className="font-jost">
            {/* Header */}
            <div className="flex justify-between items-center md:my-6 my-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Blogs Management</h2>
                    <Breadcrumb />
                </div>
                <div className="flex items-center gap-2">
                    {view === 'list' && (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); setView('form'); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm"
                            >
                                <FiPlus size={16} />
                                Add New Blog
                            </button>
                        </>
                    )}
                    {(view === 'form' || view === 'view') && (
                        <button
                            onClick={closeForm}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-[4px] hover:bg-gray-200 transition-colors font-medium text-sm"
                        >
                            <FiArrowLeft size={16} />
                            Back to Blogs
                        </button>
                    )}
                </div>
            </div>

            {/* ──── LIST VIEW ──── */}
            {view === 'list' && (
                <>
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
                            data={blogs}
                            onEdit={handleEdit}
                            onView={handleView}
                            onDelete={promptDelete}
                            itemsPerPage={10}
                            allowExport={false}
                        />
                    )}
                </>
            )}

            {/* ──── VIEW BLOG DETAIL ──── */}
            {view === 'view' && viewBlog && (
                <div className="bg-white rounded-[4px] shadow-sm border border-gray-100 overflow-hidden">
                    {viewBlog.heroImage && (
                        <img src={viewBlog.heroImage} alt={viewBlog.blogTitle} className="w-full h-64 object-cover" />
                    )}
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                                {viewBlog.blogCategoryId?.blogCategoryName || 'Uncategorized'}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(viewBlog.createdAt).toDateString()}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">{viewBlog.blogTitle}</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">{viewBlog.blogDesc}</p>

                        {viewBlog.section?.map((sec, i) => (
                            <div key={i} className="mb-6 pb-6 border-b border-gray-100 last:border-0">
                                {sec.sectionTitle && <h3 className="text-lg font-bold text-gray-800 mb-2">{sec.sectionTitle}</h3>}
                                {sec.sectionDesc?.map((d, j) => <p key={j} className="text-gray-600 mb-2">{d}</p>)}
                                {sec.sectionPoints?.length > 0 && (
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        {sec.sectionPoints.map((pt, j) => <li key={j}>{pt}</li>)}
                                    </ul>
                                )}
                                {sec.sectionImg?.length > 0 && (
                                    <div className="flex gap-3 mt-3 flex-wrap">
                                        {sec.sectionImg.map((img, j) => (
                                            <img key={j} src={img} alt="" className="h-32 w-auto rounded-[4px] object-cover border border-gray-100" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {viewBlog.conclusion && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-[4px] border-l-4 border-primary">
                                <p className="text-gray-700 italic">{viewBlog.conclusion}</p>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => handleEdit(viewBlog)}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-[4px] hover:bg-primaryHover"
                            >
                                Edit This Blog
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──── FORM VIEW (Create / Edit) ──── */}
            {view === 'form' && (
                <div className="bg-white rounded-[4px] shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6">
                        {isEditing ? 'Edit Blog' : 'Create New Blog'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blog Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="blogTitle"
                                    type="text"
                                    value={formData.blogTitle}
                                    onChange={(e) => {
                                        setFormData({ ...formData, blogTitle: e.target.value });
                                        if (errors.blogTitle) setErrors({ ...errors, blogTitle: null });
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-[4px] outline-none focus:ring-2 focus:ring-primary/20 text-sm ${errors.blogTitle ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                    placeholder="Enter blog title"
                                />
                                {errors.blogTitle && <p className="text-xs text-red-500 mt-1">{errors.blogTitle}</p>}
                            </div>
                            <div className="space-y-1">
                                <CustomSelect
                                    label="Category"
                                    required={true}
                                    options={categories.map(cat => ({ value: cat._id, label: cat.blogCategoryName }))}
                                    value={formData.blogCategoryId}
                                    onChange={(val) => {
                                        setFormData({ ...formData, blogCategoryId: val });
                                        if (errors.blogCategoryId) setErrors({ ...errors, blogCategoryId: null });
                                    }}
                                    placeholder="Select Category"
                                    buttonClassName={errors.blogCategoryId ? 'border-red-500 focus:border-red-500' : ''}
                                />
                                {errors.blogCategoryId && <p className="text-xs text-red-500">{errors.blogCategoryId}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Blog Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="blogDesc"
                                rows="4"
                                value={formData.blogDesc}
                                onChange={(e) => {
                                    setFormData({ ...formData, blogDesc: e.target.value });
                                    if (errors.blogDesc) setErrors({ ...errors, blogDesc: null });
                                }}
                                className={`w-full px-4 py-2.5 border rounded-[4px] outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none ${errors.blogDesc ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'}`}
                                placeholder="Write an engaging blog description..."
                            />
                            {errors.blogDesc && <p className="text-xs text-red-500 mt-1">{errors.blogDesc}</p>}
                        </div>

                        {/* Hero Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hero Image <span className="text-red-500">*</span>
                            </label>
                            {heroPreview && !heroImage && (
                                <div className="mb-2 relative inline-block group rounded-lg overflow-hidden border border-gray-100">
                                    <img src={heroPreview} alt="Current" className="h-40 rounded-lg object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setHeroPreview(null)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        title="Remove Image"
                                    >
                                        <FiX size={14} />
                                    </button>
                                    <p className="text-xs text-gray-400 mt-1">Current hero image</p>
                                </div>
                            )}
                            {heroImage && (
                                <div className="mb-2 relative inline-block group rounded-lg overflow-hidden border border-gray-100">
                                    <img src={URL.createObjectURL(heroImage)} alt="Preview" className="h-40 rounded-lg object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setHeroImage(null)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        title="Remove Selection"
                                    >
                                        <FiX size={14} />
                                    </button>
                                   
                                </div>
                            )}
                            <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-[4px] hover:border-primary transition-colors cursor-pointer relative bg-gray-50 ${errors.heroImage ? 'border-red-500 bg-red-50/10' : 'border-gray-300'}`}>
                                <input
                                    name="heroImage"
                                    type="file" accept="image/*"
                                    onChange={(e) => {
                                        setHeroImage(e.target.files[0]);
                                        if (errors.heroImage) setErrors({ ...errors, heroImage: null });
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center">
                                    <FiImage className={`mx-auto h-10 w-10 mb-2 ${errors.heroImage ? 'text-red-400' : 'text-gray-400'}`} />
                                    <p className={`text-sm font-medium ${errors.heroImage ? 'text-red-500' : 'text-primary'}`}>Click to upload hero image</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                            </div>
                            {errors.heroImage && <p className="text-xs text-red-500 mt-1">{errors.heroImage}</p>}
                        </div>

                        {/* Sections */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-base font-bold text-gray-800">Blog Sections</h4>
                                    <p className="text-xs text-gray-500">Each section can have a title, descriptions, bullet points, and images</p>
                                </div>
                                <button
                                    type="button" onClick={handleAddSection}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[4px] text-sm font-medium transition-colors"
                                >
                                    <FiPlus size={14} /> Add Section
                                </button>
                            </div>

                            {sections.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-[4px]">
                                    <p className="text-gray-400 text-sm">No sections yet. Click "Add Section" above.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {sections.map((sec, index) => (
                                        <div key={index} className="p-5 border border-gray-200 rounded-[4px] bg-gray-50 relative group">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="font-semibold text-gray-700 text-sm">Section {index + 1}</h5>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSection(index)}
                                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-[4px] transition-colors"
                                                >
                                                    <FiTrash2 size={12} /> Remove
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Section Title */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Section Title</label>
                                                    <input
                                                        type="text"
                                                        value={sec.sectionTitle}
                                                        onChange={(e) => handleSectionChange(index, 'sectionTitle', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-[4px] outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary/20"
                                                        placeholder="Title for this section"
                                                    />
                                                </div>

                                                {/* Desc & Points */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Descriptions <span className="text-gray-400">(one per line)</span></label>
                                                        <textarea
                                                            rows={4}
                                                            value={sec.sectionDesc}
                                                            onChange={(e) => handleSectionChange(index, 'sectionDesc', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-[4px] outline-none text-sm focus:border-primary resize-none"
                                                            placeholder={"Paragraph 1\nParagraph 2\n..."}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Bullet Points <span className="text-gray-400">(one per line)</span></label>
                                                        <textarea
                                                            rows={4}
                                                            value={sec.sectionPoints}
                                                            onChange={(e) => handleSectionChange(index, 'sectionPoints', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-[4px] outline-none text-sm focus:border-primary resize-none"
                                                            placeholder={"Point 1\nPoint 2\n..."}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Section Images */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Section Images</label>
                                                    {sec.existingImages?.length > 0 && (
                                                        <div className="flex flex-wrap gap-3 mb-3">
                                                            {sec.existingImages.map((img, j) => (
                                                                <div key={j} className="relative aspect-square w-20 h-20 rounded-lg overflow-hidden border group">
                                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveExistingImage(index, j)}
                                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                                        title="Remove Image"
                                                                    >
                                                                        <FiX size={10} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file" multiple accept="image/*"
                                                        onChange={(e) => handleSectionChange(index, 'files', e.target.files)}
                                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-[4px] file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                                    />
                                                    {sec.files && sec.files.length > 0 && (
                                                        <p className="text-xs text-green-600 mt-1">{sec.files.length} new file(s) selected</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Conclusion */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Conclusion</label>
                            <textarea
                                rows="3"
                                value={formData.conclusion}
                                onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-[4px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                                placeholder="Final takeaway for your readers..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button" onClick={closeForm}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-[4px] hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit" disabled={submitLoading}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-[4px] hover:bg-primaryHover shadow-lg shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {submitLoading && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isEditing ? 'Update Blog' : 'Publish Blog'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] shadow-xl w-full max-w-sm overflow-hidden font-jost p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <FiTrash2 className="text-red-500 text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Blog</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteItem.blogTitle}"</span>? This will also delete all associated hero and section images.
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteItem(null)}
                                disabled={submitLoading}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-[4px] hover:bg-gray-200 transition-colors disabled:opacity-70"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={submitLoading}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-[4px] hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {submitLoading && (
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
        </div>
    );
};

export default BlogAdmin;
