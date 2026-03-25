import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createFAQ, updateFAQ, getAllFAQs } from '../../redux/slice/faq.slice';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Loader2, Plus, Trash2, Copy } from 'lucide-react';
import { FiX } from 'react-icons/fi';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { MdOutlineContentCopy } from 'react-icons/md';
import { LuTrash2 } from 'react-icons/lu';

// Utility to naturally strip any old HTML tags from titles/questions since we are upgrading to clean inputs
const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

const faqValidationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    faqs: Yup.array().of(
        Yup.object().shape({
            faqQuestion: Yup.string().required('Question is required'),
            faqAnswer: Yup.string().required('Answer is required').test(
                'is-not-empty',
                'Answer content is required',
                val => val && val.replace(/<[^>]*>?/gm, '').trim() !== ''
            )
        })
    ).min(1, 'At least one FAQ is required')
});

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'align': [] }],
        ['clean']
    ]
};

const AddFaqs = ({ editingFaq, onClose }) => {
    const dispatch = useDispatch();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const [title, setTitle] = useState('');
    const [faqs, setFaqs] = useState([
        { id: Date.now().toString(), faqQuestion: '', faqAnswer: '' }
    ]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        if (editingFaq) {
            setTitle(stripHtml(editingFaq.title) || '');

            if (editingFaq.faqs && Array.isArray(editingFaq.faqs)) {
                setFaqs(editingFaq.faqs.map((f, idx) => ({
                    id: `faq-${idx}-${Date.now()}`,
                    faqQuestion: stripHtml(f.faqQuestion) || '',
                    faqAnswer: f.faqAnswer || ''
                })));
            } else if (editingFaq.question && editingFaq.answer) {
                // Legacy support
                setFaqs([{
                    id: Date.now().toString(),
                    faqQuestion: stripHtml(editingFaq.question),
                    faqAnswer: editingFaq.answer
                }]);
            }
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [editingFaq]);

    const handleAddFaq = () => {
        setFaqs([...faqs, { id: Date.now().toString(), faqQuestion: '', faqAnswer: '' }]);
    };

    const handleRemoveFaq = (id) => {
        if (faqs.length <= 1) {
            toast.error("You must have at least one question in the FAQ block.");
            return;
        }
        setFaqs(faqs.filter(f => f.id !== id));
    };

    const handleDuplicateFaq = (idx) => {
        const toCopy = faqs[idx];
        const newFaqs = [...faqs];
        newFaqs.splice(idx + 1, 0, {
            ...toCopy,
            id: Date.now().toString(),
        });
        setFaqs(newFaqs);
    };

    const handleFaqChange = (id, field, value) => {
        setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleSubmit = async () => {
        const payload = {
            title: title.trim(),
            faqs: faqs.map(f => ({
                faqQuestion: f.faqQuestion.trim(),
                faqAnswer: f.faqAnswer
            }))
        };

        try {
            await faqValidationSchema.validate(payload, { abortEarly: false });
            setErrors({});
            setIsProcessing(true);

            const action = editingFaq ? updateFAQ({ id: editingFaq._id, data: payload }) : createFAQ(payload);

            dispatch(action).unwrap().then(() => {
                setIsProcessing(false);
                dispatch(getAllFAQs());
                onClose();
            }).catch((err) => {
                setIsProcessing(false);
                toast.error(err?.message || "Failed to process FAQ.");
            });

        } catch (validationError) {
            if (validationError instanceof Yup.ValidationError) {
                const validationErrors = {};
                validationError.inner.forEach(error => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
                toast.error('Please fill out all required fields properly.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-[800px] overflow-hidden transform transition-all flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-5 py-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
                    <div>
                        <h3 className="text-lg sm:text-[20px] font-[800] text-gray-800 tracking-tight">
                            {editingFaq ? 'Edit FAQ' : 'Create FAQ'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-2 sm:p-2.5 rounded-[4px]">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body Form Layout */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 editor-scrollbar">

                    {/* Main Title Input */}
                    <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white border border-gray-200 rounded-[4px] shadow-sm hover:shadow-md transition-shadow">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">
                            FAQ Title <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Orders & Shipping"
                            className={`w-full px-4 py-3 sm:py-3.5 bg-gray-50 hover:bg-white focus:bg-white border ${errors.title ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary'} rounded-[4px] outline-none focus:ring-[1px] focus:ring-primary text-gray-800 transition-all font-semibold text-sm sm:text-base selection:bg-primary/20`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><FiX size={12} />{errors.title}</p>}
                    </div>

                    {/* Questions Array Container */}
                    <div className="space-y-4 sm:space-y-6">
                        {faqs.map((faq, index) => {
                            const qError = errors[`faqs[${index}].faqQuestion`];
                            const aError = errors[`faqs[${index}].faqAnswer`];

                            return (
                                <div key={faq.id} className="relative p-4 sm:p-6 bg-white border border-gray-200 rounded-[4px] shadow-sm hover:shadow-md hover:border-gray-300 transition-all group">

                                    {/* Action Buttons - Responsive Header */}
                                    <div className="flex flex-row justify-between items-center mb-4 sm:mb-5 pb-3 sm:pb-0 border-b border-gray-100 sm:border-0 relative">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] bg-primary text-white font-bold text-xs sm:text-sm shadow-sm">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[11px] sm:text-xs">Question Block</h4>
                                        </div>

                                        <div className="flex items-center gap-1.5 sm:absolute sm:top-0 sm:right-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDuplicateFaq(index)} className="p-1.5 bg-gray-50 text-gray-500 hover:text-primary hover:bg-green-100 rounded-[4px] text-gray-500 hover:text-primary shadow-sm transition-colors" title="Duplicate"><MdOutlineContentCopy size={16} /></button>
                                            <button onClick={() => handleRemoveFaq(faq.id)} className="p-1.5 bg-gray-50 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[4px] text-gray-500 hover:text-red-500 shadow-sm transition-colors" title="Delete"><LuTrash2 size={16} /></button>
                                        </div>
                                    </div>

                                    {/* Standard Input for Question */}
                                    <div className="mb-4 sm:mb-5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Question Text</label>
                                        <input
                                            type="text"
                                            value={faq.faqQuestion}
                                            onChange={(e) => handleFaqChange(faq.id, 'faqQuestion', e.target.value)}
                                            placeholder="What is your return policy?"
                                            className={`w-full px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-white focus:bg-white border ${qError ? 'border-red-400' : 'border-gray-200 focus:border-primary'} rounded-[4px] outline-none focus:ring-[1px] focus:ring-primary text-gray-800 transition-all font-semibold text-sm`}
                                        />
                                        {qError && <p className="text-red-500 text-xs mt-1.5 font-medium">{qError}</p>}
                                    </div>

                                    {/* Standard Quill for Answer */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Answer Content</label>
                                        <div className={`rounded-[4px] border ${aError ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'} focus-within:border-primary focus-within:ring-[1px] focus-within:ring-primary transition-all bg-white quill-wrapper-fix relative`}>
                                            <ReactQuill
                                                theme="snow"
                                                value={faq.faqAnswer}
                                                onChange={(val) => handleFaqChange(faq.id, 'faqAnswer', val)}
                                                modules={quillModules}
                                                style={{ minHeight: '120px' }}
                                                className="quill-responsive bg-white"
                                            />
                                        </div>
                                        {aError && <p className="text-red-500 text-xs mt-1.5 font-medium">{aError}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleAddFaq}
                        className="mt-6 sm:mt-8 w-full py-4 sm:py-5 border-2 border-dashed border-gray-300 rounded-[4px] text-gray-500 hover:border-primary hover:text-primary bg-white hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group shadow-sm active:scale-[0.99]"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="font-bold tracking-widest text-xs sm:text-sm uppercase">Add Another Question</span>
                    </button>

                    {/* Extra padding for mobile clear scroll */}
                    <div className="h-6 sm:hidden"></div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.02)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-600 font-bold text-sm px-4 py-3 sm:py-2.5 transition-colors hover:text-gray-900 bg-gray-50 sm:bg-transparent rounded-[4px] sm:rounded-none w-full sm:w-auto hover:bg-gray-100"
                        disabled={isProcessing}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="bg-primary hover:bg-primaryHover text-white px-8 py-3 sm:py-2.5 rounded-[4px] text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 w-full sm:w-auto uppercase tracking-wide"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {editingFaq ? 'Update FAQ' : 'Add FAQ'}
                    </button>
                </div>

            </div>

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
        </div>
    );
};

export default AddFaqs;