import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createBanner, fetchBanners, updateBanner } from '../../redux/slice/banner.slice';
import { FiUploadCloud, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import CustomSelect from '../component/CustomSelect';

// Helper functions moved outside to avoid re-creation
const getPreviewPositionClass = (pos) => {
    switch (pos) {
        case 'center': return 'justify-center text-center';
        case 'right': return 'justify-end text-right pr-[8%]';
        default: return 'pl-[8%] text-left'; // left
    }
};

const getPreviewTextGradient = (pos) => {
    switch (pos) {
        case 'center': return '';
        case 'right': return '';
        default: return '';
    }
};

const CreateBanner = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { banners } = useSelector((state) => state.banner);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        link: '/shop',
        order: 0,
        isActive: true,
        image: null,
        titleColor: '#1b1b1b',
        titleSize: '48px',
        subtitleColor: '#555555',
        subtitleSize: '16px',
        textPosition: 'left'
    });

    useEffect(() => {
        if (!banners.length) {
            dispatch(fetchBanners());
        }
    }, [dispatch, banners.length]);

    useEffect(() => {
        if (id && banners.length > 0) {
            const bannerToEdit = banners.find(b => b._id === id);
            if (bannerToEdit) {
                setCurrentBanner(bannerToEdit);
                setFormData({
                    title: bannerToEdit.title,
                    subtitle: bannerToEdit.subtitle,
                    link: bannerToEdit.link,
                    order: bannerToEdit.order,
                    isActive: bannerToEdit.isActive,
                    image: null,
                    titleColor: bannerToEdit.titleStyle?.color || '#1b1b1b',
                    titleSize: bannerToEdit.titleStyle?.fontSize || '48px',
                    subtitleColor: bannerToEdit.subtitleStyle?.color || '#555555',
                    subtitleSize: bannerToEdit.subtitleStyle?.fontSize || '16px',
                    textPosition: bannerToEdit.textPosition || 'left'
                });
                setPreviewImage(bannerToEdit.image?.url);
            }
        }
    }, [id, banners]);

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('link', formData.link);
        data.append('order', formData.order);
        data.append('isActive', formData.isActive);
        data.append('titleColor', formData.titleColor);
        data.append('titleSize', formData.titleSize);
        data.append('subtitleColor', formData.subtitleColor);
        data.append('subtitleSize', formData.subtitleSize);
        data.append('textPosition', formData.textPosition);

        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (currentBanner) {
                await dispatch(updateBanner({ id: currentBanner._id, bannerData: data })).unwrap();
            } else {
                await dispatch(createBanner(data)).unwrap();
            }
            navigate('/admin/banners');
        } catch (error) {
            console.error("Failed to save banner:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, currentBanner, dispatch, navigate]);

    const btnBlack = "inline-block px-[30px] py-[12px] bg-primary text-white rounded-[4px] font-medium transition-all duration-300 border border-transparent hover:bg-primaryHover hover:text-white hover:border-primary";

    // Memoize preview classes
    const previewPositionClass = useMemo(() => getPreviewPositionClass(formData.textPosition), [formData.textPosition]);
    const previewTextGradient = useMemo(() => getPreviewTextGradient(formData.textPosition), [formData.textPosition]);

    const navigateBack = useCallback(() => {
        navigate('/admin/banners');
    }, [navigate]);

    return (
        <div className="text-gray-800 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4 sm:mb-8 mb-4">
                <button
                    onClick={navigateBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FiArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="sm:text-2xl text-lg font-bold text-gray-800">
                        {id ? 'Edit Banner' : 'Create New Banner'}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start h-[calc(100vh-140px)]">
                {/* Form Section - Scrollable */}
                <div className="lg:col-span-4 h-full overflow-y-auto pr-2 no-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 rounded-[4px] border border-gray-100 shadow-sm">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 capitalize tracking-wider border-b border-gray-100 pb-2">Basic Info</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[4px] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 "
                                    placeholder="e.g. Summer Collection"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Description</label>
                                <textarea
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-[4px] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 resize-none"
                                    placeholder="Enter a brief description..."
                                />
                            </div>

                           <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-[4px] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="/shop"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-[4px] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">Active Status</span>
                                </label>
                            </div>
                        </div>

                        {/* Styling & Layout */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 capitalize tracking-wider border-b border-gray-100 pb-2">Design & Layout</h3>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Content Position</label>
                                <div className="flex border border-gray-300 rounded-[4px] overflow-hidden">
                                    {['left', 'center', 'right'].map((pos) => (
                                        <button
                                            key={pos}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, textPosition: pos }))}
                                            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${formData.textPosition === pos ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                <div className=' '>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Title Color</label>
                                    <div className="flex items-center gap-2 border border-gray-200 p-1.5 rounded-[4px] bg-gray-50">
                                        <input
                                            type="color"
                                            name="titleColor"
                                            value={formData.titleColor}
                                            onChange={handleInputChange}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <span className="text-xs text-gray-500 font-mono uppercase truncate">{formData.titleColor}</span>
                                    </div>
                                </div>
                                <div className=''>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Title Size</label>

                                    <CustomSelect
                                        value={formData.titleSize}
                                        onChange={(val) => handleInputChange({ target: { name: 'titleSize', value: val } })}
                                        searchable={false}
                                        options={[
                                            { value: '14px', label: '(14px)' },
                                            { value: '16px', label: '(16px)' },
                                            { value: '18px', label: '(18px)' },
                                            { value: '20px', label: '(20px)' },
                                            { value: '22px', label: '(22px)' },
                                            { value: '24px', label: '(24px)' },
                                            { value: '28px', label: '(28px)' },
                                            { value: '30px', label: '(30px)' },
                                            { value: '32px', label: '(32px)' },
                                            { value: '42px', label: '(42px)' },
                                            { value: '48px', label: '(48px)' },
                                            { value: '56px', label: '(56px)' },
                                            { value: '64px', label: '(64px)' }
                                        ]}
                                    />
                                </div>
                            </div>

                         <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle Color</label>
                                    <div className="flex items-center gap-2 border border-gray-200 p-1.5 rounded-[4px] bg-gray-50">
                                        <input
                                            type="color"
                                            name="subtitleColor"
                                            value={formData.subtitleColor}
                                            onChange={handleInputChange}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <span className="text-xs text-gray-500 font-mono uppercase truncate">{formData.subtitleColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle Size</label>
                                    <CustomSelect
                                        value={formData.subtitleSize}
                                        onChange={(val) => handleInputChange({ target: { name: 'subtitleSize', value: val } })}
                                        searchable={false}
                                        options={[
                                            { value: '14px', label: '(14px)' },
                                            { value: '16px', label: '(16px)' },
                                            { value: '18px', label: '(18px)' },
                                            { value: '20px', label: '(20px)' },
                                            { value: '22px', label: '(22px)' },
                                            { value: '24px', label: '(24px)' },
                                            { value: '28px', label: '(28px)' },
                                            { value: '30px', label: '(30px)' },
                                            { value: '32px', label: '(32px)' },
                                            { value: '42px', label: '(42px)' },
                                            { value: '48px', label: '(48px)' },
                                            { value: '56px', label: '(56px)' },
                                            { value: '64px', label: '(64px)' }
                                        ]}
                                    />
                                </div>
                            </div>


                        </div>

                        {/* Image Upload */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 capitalize tracking-wider border-b border-gray-100 pb-2">Banner Image</h3>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-[4px] hover:border-primary transition-colors bg-gray-50 cursor-pointer relative group">
                                <div className="space-y-1 text-center">
                                    <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary transition-colors" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:underline focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-[4px] hover:bg-primaryHover font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FiCheck size={20} />}
                                <span>{id ? 'Update Banner' : 'Publish Banner'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Section - Sticky */}
                <div className="lg:col-span-8 h-full flex flex-col pt-1">
                    <div className="bg-gray-100 rounded-[4px] border border-gray-200 overflow-hidden relative flex-1 flex items-center justify-center lg:p-8 sm:p-6 p-4 shadow-inner">
                        <div className="hidden sm:block absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-[4px] text-xs font-bold uppercase tracking-wider backdrop-blur-md z-10">Live Preview</div>

                        <div className="w-full max-w-5xl bg-white rounded-[4px] shadow-2xl overflow-hidden relative group transform transition-all duration-300 hover:shadow-3xl">
                            {/* Aspect Ratio Wrapper 16:7 */}
                            <div className="w-full relative aspect-[16/7]">
                                {previewImage ? (
                                    <div
                                        className={`w-full h-full bg-cover bg-center flex items-center relative before:absolute before:inset-0 before:w-full before:pointer-events-none before:z-[1] ${previewTextGradient} ${previewPositionClass}`}
                                        style={{ backgroundImage: `url(${previewImage})` }}
                                    >
                                        <div className={`relative z-[2] max-w-lg mx-8 p-4`}>
                                            <h1
                                                className="font-bold mb-4 leading-tight"
                                                style={{ color: formData.titleColor, fontSize: formData.titleSize }}
                                            >
                                                {formData.title || "Your Title Here"}
                                            </h1>
                                            <p
                                                className="max-w-[400px] mb-6 leading-relaxed"
                                                style={{ color: formData.subtitleColor, fontSize: formData.subtitleSize }}
                                            >
                                                {formData.subtitle || "Your subtitle text will appear here. Add a catchy description."}
                                            </p>
                                            <span className={`${btnBlack} shadow-xl transform cursor-default scale-90 origin-left`}>
                                                Shop Now
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400">
                                        <FiUploadCloud size={64} className="mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Upload an image to generate preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBanner;
