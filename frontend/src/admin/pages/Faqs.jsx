import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllFAQs, deleteFAQ } from '../../redux/slice/faq.slice';
import { Loader2 } from 'lucide-react';
import AddFaqs from './AddFaqs';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import Breadcrumb from '../component/Breadcrumb';

const Faqs = () => {
    const dispatch = useDispatch();
    const { faqs, loading } = useSelector((state) => state.faq);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [openAccordion, setOpenAccordion] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(getAllFAQs());
    }, [dispatch]);

    const handleDelete = useCallback((id) => {
        if(window.confirm("Are you sure you want to delete this FAQ?")) {
            dispatch(deleteFAQ(id));
        }
    }, [dispatch]);

    const handleEdit = useCallback((faq) => {
        setEditingFaq(faq);
        setShowAddModal(true);
    }, []);

    const toggleAccordion = useCallback((id) => {
        setOpenAccordion((prev) => (prev === id ? null : id));
    }, []);

    const filteredFaqs = useMemo(() => {
        if (!faqs) return [];

        return faqs.filter((faq) => {
            if (!searchQuery) return true;

            const searchLower = searchQuery.toLowerCase();

            const titleText = (faq.title || '')
                .toString()
                .replace(/<[^>]*>/g, ' ')
                .toLowerCase();

            const matchesTitle = titleText.includes(searchLower);

            const matchesFaqs = faq.faqs?.some((f) =>
                f.faqQuestion
                    ?.toString()
                    .replace(/<[^>]*>/g, ' ')
                    .toLowerCase()
                    .includes(searchLower) ||
                f.faqAnswer
                    ?.toString()
                    .replace(/<[^>]*>/g, ' ')
                    .toLowerCase()
                    .includes(searchLower)
            );

            return matchesTitle || matchesFaqs;
        });
    }, [faqs, searchQuery]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:my-6 my-4">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">FAQs</h2>
                    <Breadcrumb />
                </div>
                <div className='flex items-center justify-end gap-2 ms-auto'>
                    <button
                        onClick={() => {
                            setEditingFaq(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[4px] hover:bg-primaryHover transition-colors font-medium text-sm shadow-sm"
                    >
                        <FiPlus size={18} />
                        <span>Add FAQs</span>
                    </button>
                </div>
            </div>

            <div className="relative flex-1 w-full sm:max-w-xs mb-5 mt-2">
                <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[4px] text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                />
            </div>

            {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white border border-gray-100 rounded-[4px] shadow-sm">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <p className="text-gray-500 text-base sm:text-lg px-4 font-medium">
                            {searchQuery ? 'No FAQ groups found matching your search.' : 'No FAQ groups available yet.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 mx-auto pb-8">
                    {filteredFaqs.map((faq, index) => (
                        <div
                            key={faq._id}
                            className={`bg-white border rounded-[4px] overflow-hidden shadow-sm transition-all duration-200 ${openAccordion === faq._id ? 'border-primary/40 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div
                                className="flex items-center p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleAccordion(faq._id)}
                            >
                                {/* Number Badge */}
                                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-[4px] flex items-center justify-center mr-3 sm:mr-4 border transition-colors ${openAccordion === faq._id ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-primary border-gray-200 text-white'}`}>
                                    <span className="text-xs sm:text-sm font-bold">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Title */}
                                <div
                                    className={`flex-1 font-bold text-sm sm:text-base pr-2 sm:pr-4 line-clamp-1 transition-colors ${openAccordion === faq._id ? 'text-gray-900' : 'text-gray-700'}`}
                                    dangerouslySetInnerHTML={{ __html: faq.title }}
                                />

                                <div className="px-3 py-1.5 bg-gray-50 rounded-[4px] text-[10px] text-gray-500 uppercase font-bold mr-4 border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                    {faq.faqs?.length || 0} Questions
                                </div>

                                {/* Toggle Icon */}
                                <div className="flex-shrink-0 text-gray-400 ml-2 sm:ml-4">
                                    {openAccordion === faq._id ? (
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {openAccordion === faq._id && (
                                <div className={`border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ease-in-out px-4 py-4 sm:p-6`}>
                                    <div className="flex justify-end mb-4 gap-2 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(faq);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-green-600 bg-white rounded border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all shadow-sm"
                                            title="Edit FAQ"
                                        >
                                            <FiEdit2 size={12} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(faq._id);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-white rounded border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                                            title="Delete FAQ"
                                        >
                                            <FiTrash2 size={12} />
                                            <span>Delete</span>
                                        </button>
                                    </div>

                                    <div className="space-y-6 pt-2 pb-2">
                                        {faq.faqs?.map((item, idx) => (
                                            <div key={item._id || idx} className="space-y-3 border-l-[3px] border-primary/40 pl-5 bg-white p-5 rounded-r-[4px] shadow-sm border-t border-r border-b border-gray-100">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-gray-400 font-bold text-sm select-none">Q.</span>
                                                    <div
                                                        className="text-textPrimary font-bold text-sm sm:text-[15px] leading-relaxed break-words"
                                                        dangerouslySetInnerHTML={{ __html: item.faqQuestion }}
                                                    />
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <span className="text-primary/50 font-bold text-sm select-none">A.</span>
                                                    <div
                                                        className="text-textSecondary text-sm leading-relaxed break-words prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 faq_answer"
                                                        dangerouslySetInnerHTML={{ __html: item.faqAnswer }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <AddFaqs
                    editingFaq={editingFaq}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingFaq(null);
                        dispatch(getAllFAQs());
                    }}
                />
            )}
        </>
    );
};

export default Faqs;