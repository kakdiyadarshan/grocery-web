import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTerms, saveAllTerms, uploadTermImage } from '../../redux/slice/terms.slice';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { HexColorPicker } from 'react-colorful';
import { TbTextSize } from "react-icons/tb";
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify, MdFormatListBulleted, MdFormatListNumbered, MdFormatIndentDecrease, MdFormatIndentIncrease, MdLink, MdUndo, MdRedo, MdOutlineFileUpload, MdOutlineContentCopy} from "react-icons/md";
import { CgColorPicker } from "react-icons/cg";
import { AiOutlineBars, AiOutlineFontColors } from "react-icons/ai";
import { FaCheck, FaRegCheckCircle, FaRegImage } from "react-icons/fa";
import { PiTextStrikethroughBold } from "react-icons/pi";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoIosLink, IoMdClose, IoMdLink } from "react-icons/io";
import { Loader2 } from 'lucide-react';
import { LuTrash2 } from 'react-icons/lu';
import AdminLoader from '../component/AdminLoader';
import { FiShoppingCart } from 'react-icons/fi';


const Quill = ReactQuill.Quill;
if (Quill) {
    // Register font size as inline style
    const Size = Quill.import('attributors/style/size');
    Size.whitelist = ['10px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '32px'];
    Quill.register(Size, true);

    // Register font weight as inline style - use the Size attributor's constructor
    const Parchment = Quill.import('parchment');
    const SizeAttributor = Quill.import('attributors/style/size');
    const StyleAttributorClass = SizeAttributor.constructor;
    const FontWeight = new StyleAttributorClass('weight', 'font-weight', {
        scope: Parchment.Scope.INLINE,
        whitelist: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
    });
    Quill.register(FontWeight, true);

    // Register text alignment as inline style
    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);
}

const CustomDropdown = ({ options, value, onChange, label, icon, editorId, format, editorRefs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const savedSelectionRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleButtonClick = () => {
        if (!isOpen && editorId && editorRefs.current[editorId]) {
            const quill = editorRefs.current[editorId].getEditor();
            const selection = quill.getSelection();
            if (selection) {
                savedSelectionRef.current = { index: selection.index, length: selection.length };
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue) => {
        if (editorId && editorRefs.current[editorId]) {
            const quill = editorRefs.current[editorId].getEditor();
            const selection = savedSelectionRef.current;

            if (selection) {
                // Focus and restore selection
                quill.focus();
                quill.setSelection(selection.index, selection.length);

                // FIX: Use 'user' source to ensure history tracking
                if (selection.length > 0) {
                    quill.formatText(selection.index, selection.length, format, optionValue, 'user');
                } else {
                    quill.format(format, optionValue, 'user');
                }
            }
        }
        onChange(optionValue);
        setIsOpen(false);
        savedSelectionRef.current = null;
    };

    return (
        <div className={`relative inline-block`} ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center justify-center py-1 px-1.5 sm:px-2 rounded bg-transparent cursor-pointer transition-all duration-200 min-w-[50px] sm:min-w-[60px] h-8 sm:h-10 gap-1 sm:gap-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleButtonClick}
                title={label}
            >
                <div className="flex items-center gap-0.5">
                    {icon && (
                        <div className="text-textSecondary  hover:text-primary text-sm sm:text-md font-[800]">
                            {icon}
                        </div>
                    )}
                    <TiArrowSortedDown className={`text-gray-400  hover:text-primary text-sm sm:text-base font-[800] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white  rounded-[4px] shadow-lg z-10 w-full max-h-52 overflow-y-auto border border-gray-100  editor-scrollbar">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`px-2 sm:px-3 py-2 cursor-pointer text-center text-xs sm:text-sm text-gray-700  hover:bg-gray-100  ${value === option.value ? 'bg-green-100 text-primary font-medium' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom Align Dropdown
const AlignDropdown = ({ value, onChange, editorId, editorRefs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const savedSelectionRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const alignOptions = [
        { value: '', icon: <MdFormatAlignLeft /> },
        { value: 'center', icon: <MdFormatAlignCenter /> },
        { value: 'right', icon: <MdFormatAlignRight /> },
        { value: 'justify', icon: <MdFormatAlignJustify /> },
    ];

    const handleButtonClick = () => {
        if (!isOpen && editorId && editorRefs.current[editorId]) {
            const quill = editorRefs.current[editorId].getEditor();
            const selection = quill.getSelection();
            if (selection) {
                savedSelectionRef.current = { index: selection.index, length: selection.length };
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue) => {
        if (editorId && editorRefs.current[editorId]) {
            const quill = editorRefs.current[editorId].getEditor();
            const selection = savedSelectionRef.current;

            if (selection) {
                quill.focus();
                quill.setSelection(selection.index, selection.length);
                quill.formatLine(selection.index, selection.length || 1, 'align', optionValue || false, 'user');
            }
        }
        onChange(optionValue);
        setIsOpen(false);
        savedSelectionRef.current = null;
    };

    const currentAlign = alignOptions.find(opt => opt.value === value) || alignOptions[0];

    return (
        <div className={`relative inline-block`} ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center justify-center py-1 px-1.5 sm:px-2 rounded bg-transparent cursor-pointer transition-all duration-200 min-w-[40px] sm:min-w-[50px] h-8 sm:h-10 gap-1 sm:gap-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleButtonClick}
                title="Text Align"
            >
                <div className="text-textSecondary  hover:text-primary text-sm sm:text-md font-[800] flex items-center justify-center">
                    {currentAlign.icon}
                </div>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white  rounded-[4px] shadow-lg z-10 w-full max-h-52 overflow-y-auto border border-gray-100 ">
                    {alignOptions.map((option) => (
                        <div
                            key={option.value}
                            className={`px-2 sm:px-3 py-2 flex justify-center items-center gap-2 cursor-pointer text-xs sm:text-sm text-gray-700  hover:bg-gray-100  ${value === option.value ? 'bg-green-100 text-primary font-medium' : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span className="flex items-center text-sm sm:text-base">{option.icon}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom Color Picker
const AdvancedColorPicker = ({ onSelect, onClose, initialColor = '#000000' }) => {
    const [color, setColor] = useState(initialColor);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        setColor(initialColor || '#000000');
    }, [initialColor]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div className="bg-white  rounded-[4px] p-2 sm:p-4 w-52 sm:w-64 shadow-2xl border border-gray-200  absolute top-10 sm:top-12 left-0 sm:left-auto sm:right-0 z-[1000] mt-2 animate-in fade-in zoom-in duration-200" ref={pickerRef}>
            <div className={`grid grid-cols-6 gap-2 ${showAdvanced ? 'mb-3 sm:mb-4' : 'mb-0'}`}>
                {['#000000', '#ffffff', '#ffa500', '#ffff00', '#008000'].map(c => (
                    <div
                        key={c}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full cursor-pointer border border-gray-200  transition-all duration-200 shadow-sm hover:scale-110 hover:shadow-md"
                        style={{ backgroundColor: c }}
                        onClick={() => onSelect(c)}
                        title={c}
                    />
                ))}
                <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full cursor-pointer border-2 border-gray-300 transition-all duration-200 shadow-sm hover:scale-110 hover:shadow-md hover:border-gray-500"
                    style={{ background: 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' }}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    title="Custom Color Picker"
                />
            </div>

            {showAdvanced && (
                <>
                    <div className="w-full mt-2 mb-2 flex justify-center">
                        <HexColorPicker color={color} onChange={setColor} />
                    </div>

                    <div className="flex items-center gap-2 mt-3 p-1 bg-gray-50  rounded-lg">
                        <div
                            className="w-8 h-8 rounded-md border border-gray-200  shadow-sm"
                            style={{ backgroundColor: color }}
                        />
                        <input
                            type="text"
                            value={color.toUpperCase()}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^#?[0-9A-Fa-f]{0,6}$/i.test(val)) {
                                    setColor(val.startsWith('#') ? val : '#' + val);
                                }
                            }}
                            className="flex-1 min-w-0 bg-transparent border-none text-xs text-gray-700  outline-none font-mono"
                            placeholder="#000000"
                        />
                        <button
                            className="bg-primary text-primary rounded-md p-1.5 cursor-pointer transition-colors duration-200 hover:bg-primaryHover"
                            onClick={() => onSelect(color)}
                        >
                            <FaCheck size={12} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const Termscondition = () => {
    const dispatch = useDispatch();
    const { loading, terms } = useSelector((state) => state.terms);

    const [focusedEditor, setFocusedEditor] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [savedSelection, setSavedSelection] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkData, setLinkData] = useState({
        url: '',
        text: '',
        editorId: null,
        range: null
    });
    const [fontSize, setFontSize] = useState('14px');
    const [fontWeight, setFontWeight] = useState('400');
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [textAlign, setTextAlign] = useState('');
    const [uploadingSections, setUploadingSections] = useState({});
    const [showSidebar, setShowSidebar] = useState(false);
    const editorRefs = useRef({});
    const [sections, setSections] = useState([]);

    const fontSizeOptions = useMemo(() => [
        { value: '10px', label: '10' },
        { value: '12px', label: '12' },
        { value: '13px', label: '13' },
        { value: '14px', label: '14' },
        { value: '16px', label: '16' },
        { value: '18px', label: '18' },
        { value: '20px', label: '20' },
        { value: '24px', label: '24' },
        { value: '32px', label: '32' },
    ], []);

    const fontWeightOptions = useMemo(() => [
        { value: '100', label: '100' },
        { value: '200', label: '200' },
        { value: '300', label: '300' },
        { value: '400', label: '400' },
        { value: '500', label: '500' },
        { value: '600', label: '600' },
        { value: '700', label: '700' },
        { value: '800', label: '800' },
        { value: '900', label: '900' },
    ], []);

    const quillModules = useMemo(() => ({
        toolbar: {
            container: '#common-toolbar'
        },
        history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true
        },
    }), []);

    const quillFormats = useMemo(() => ([
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet', 'indent',
        'link', 'image', 'align', 'blockquote', 'code-block',
        'header', 'size', 'weight'
    ]), []);

    const handleSectionChange = useCallback((id, newContent) => {
        setSections(prev => prev.map(section =>
            section.id === id ? { ...section, content: newContent } : section
        ));
    }, []);

    const handleDeleteSection = useCallback((id) => {
        setSections(prev => prev.filter(section => section.id !== id));
    }, []);

    const handleCopySection = useCallback((id) => {
        setSections(prev => {
            const index = prev.findIndex(s => s.id === id);
            if (index === -1) return prev;

            const sectionToCopy = prev[index];
            const newSection = {
                ...sectionToCopy,
                id: Date.now() + Math.random(),
            };

            const updated = [...prev];
            updated.splice(index + 1, 0, newSection);

            return updated;
        });
    }, []);

    const handleAddSection = useCallback((type = 'text') => {
        const sectionTemplates = {
            title: {
                id: Date.now(),
                type: 'title',
            },
            points: {
                id: Date.now(),
                type: 'points',
                content: '<ul><li></li></ul>'
            },
            image: {
                id: Date.now(),
                type: 'image',
                content: ''
            },
            text: {
                id: Date.now(),
                type: 'text',
                content: ''
            }
        };

        const newSection = sectionTemplates[type] || sectionTemplates.text;

        setSections(prev => {
            let updated = [...prev];
            return [...updated, newSection];
        });

        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    }, []);

    const handleEditorFocus = useCallback((id) => {
        setFocusedEditor(id);
        if (editorRefs.current[id]) {
            const quill = editorRefs.current[id].getEditor();
            const selection = quill.getSelection();
            if (selection) {
                const formats = quill.getFormat(selection);
                if (formats.size) {
                    setFontSize(formats.size || '14px');
                }
                if (formats.weight) {
                    setFontWeight(formats.weight || '400');
                }
                setIsItalic(!!formats.italic);
                setIsUnderline(!!formats.underline);
                setTextAlign(formats.align || '');
            }
        }
    }, []);

    const saveSelection = useCallback(() => {
        if (focusedEditor && editorRefs.current[focusedEditor]) {
            const quill = editorRefs.current[focusedEditor].getEditor();
            const selection = quill.getSelection();
            if (selection) {
                setSavedSelection({
                    editorId: focusedEditor,
                    range: selection
                });
            }
        }
    }, [focusedEditor]);

    const applyFormat = useCallback((format, value) => {
        if (savedSelection && editorRefs.current[savedSelection.editorId]) {
            const quill = editorRefs.current[savedSelection.editorId].getEditor();
            quill.focus();
            quill.setSelection(savedSelection.range);

            if (savedSelection.range.length > 0) {
                quill.formatText(savedSelection.range.index, savedSelection.range.length, format, value, 'user');
            } else {
                quill.format(format, value, 'user');
            }

            setSavedSelection(null);
        }
    }, [savedSelection]);

    const handleUndo = useCallback(() => {
        if (focusedEditor && editorRefs.current[focusedEditor]) {
            const quill = editorRefs.current[focusedEditor].getEditor();
            quill.history.undo();
        }
    }, [focusedEditor]);

    const handleRedo = useCallback(() => {
        if (focusedEditor && editorRefs.current[focusedEditor]) {
            const quill = editorRefs.current[focusedEditor].getEditor();
            quill.history.redo();
        }
    }, [focusedEditor]);

    const handleOpenLinkModal = useCallback(() => {
        if (savedSelection && savedSelection.range && savedSelection.range.length > 0 && editorRefs.current[savedSelection.editorId]) {
            const quill = editorRefs.current[savedSelection.editorId].getEditor();
            const selectedText = quill.getText(savedSelection.range.index, savedSelection.range.length);

            setLinkData({
                url: '',
                text: selectedText,
                editorId: savedSelection.editorId,
                range: savedSelection.range
            });
            setShowLinkModal(true);
            return;
        }

        const editorId = focusedEditor || (sections[0] && sections[0].id);
        if (!editorId || !editorRefs.current[editorId]) {
            import('sonner').then(({ toast }) => {
                toast.info('Please select an editor first');
            });
            return;
        }

        const quill = editorRefs.current[editorId].getEditor();
        const range = quill.getSelection();

        if (!range || range.length === 0) {
            import('sonner').then(({ toast }) => {
                toast.info('Please select text first to add a link');
            });
            return;
        }

        const selectedText = quill.getText(range.index, range.length);

        setLinkData({
            url: '',
            text: selectedText,
            editorId,
            range
        });
        setShowLinkModal(true);
    }, [savedSelection, focusedEditor, sections]);

    const handleApplyLink = useCallback(() => {
        if (!linkData.url || !linkData.editorId || !linkData.range || !editorRefs.current[linkData.editorId]) {
            setShowLinkModal(false);
            return;
        }

        const quill = editorRefs.current[linkData.editorId].getEditor();
        quill.focus();
        quill.setSelection(linkData.range);

        if (linkData.range.length === 0) {
            const textToInsert = linkData.text || linkData.url;
            quill.insertText(linkData.range.index, textToInsert, 'user');
            quill.formatText(linkData.range.index, textToInsert.length, 'link', linkData.url, 'user');
            quill.setSelection(linkData.range.index + textToInsert.length, 0);
        } else {
            quill.formatText(linkData.range.index, linkData.range.length, 'link', linkData.url, 'user');
            quill.setSelection(linkData.range.index + linkData.range.length, 0);
        }

        setShowLinkModal(false);
    }, [linkData]);

    const handleListFormat = useCallback((listType) => {
        if (focusedEditor && editorRefs.current[focusedEditor]) {
            const quill = editorRefs.current[focusedEditor].getEditor();
            const selection = quill.getSelection();
            if (selection) {
                const currentFormat = quill.getFormat(selection);
                const newValue = currentFormat.list === listType ? false : listType;
                quill.formatLine(selection.index, selection.length || 1, 'list', newValue, 'user');
            }
        }
    }, [focusedEditor]);

    const handleIndent = useCallback((direction) => {
        if (focusedEditor && editorRefs.current[focusedEditor]) {
            const quill = editorRefs.current[focusedEditor].getEditor();
            const selection = quill.getSelection();
            if (selection) {
                quill.formatLine(selection.index, selection.length || 1, 'indent', direction, 'user');
            }
        }
    }, [focusedEditor]);

    useEffect(() => {
        dispatch(getAllTerms())
    }, [dispatch]);

    useEffect(() => {
        if (terms && terms.length > 0) {
            const termsAsSections = terms.map((policy) => ({
                id: policy._id || policy.id,
                type: policy.type || 'text',
                content: policy.description || '',
            }));
            setSections(termsAsSections);
        }
    }, [terms]);

    const handleSaveAll = useCallback(() => {
        const termsData = sections.map(section => ({
            description: section.content,
            type: section.type
        }));
        dispatch(saveAllTerms(termsData));
    }, [sections, dispatch]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .ql-editor.ql-blank::before {
                color: #6b7280 !important;
                font-style: normal !important;
            }
            
            .ql-editor:focus {
                border: 2px dashed #228B22 !important;
                border-radius: 4px !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (loading) {
        return <AdminLoader  message="Loading terms and conditions..." icon={FiShoppingCart} />;
    }

    return (
        <>
            <div className="flex justify-between items-center md:my-6 my-4 px-2 sm:px-0">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Terms & Condition</h2>
                </div>
                <button
                    onClick={handleSaveAll}
                    className="flex items-center justify-center gap-2 text-white bg-primary hover:bg-primaryHover p-2.5 sm:px-6 sm:py-2.5 aspect-square sm:aspect-auto rounded-[4px] transition-all font-medium text-sm shadow-md active:scale-95"
                >
                    <FaRegCheckCircle className="text-xl sm:text-lg" />
                    <span className="hidden sm:inline">Save Changes</span>
                </button>
            </div>

            <div className="bg-white rounded-[4px] shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-150px)] md:h-[calc(100vh-180px)] overflow-hidden">
                {/* Unified Sticky Header Area */}
                <div className="relative z-30 bg-white border-b border-gray-100 rounded-t-[4px] shadow-sm shrink-0">

                    {/* Elementor Insert Bar */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-2 px-3 sm:px-6 py-4 sm:py-3 border-b border-gray-50 bg-gray-50/80">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-[12px] font-bold text-textSecondary uppercase tracking-widest">Insert Blocks:</span>

                            <button
                                onClick={() => handleAddSection('title')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-[4px] bg-white border border-gray-200 text-textSecondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium shadow-sm active:scale-95"
                            >
                                <TbTextSize className="text-sm" />
                                Title
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center">
                            {[
                                { type: 'text', icon: TbTextSize, label: 'Text' },
                                { type: 'points', icon: AiOutlineBars, label: 'Points' },
                                { type: 'image', icon: FaRegImage, label: 'Image' },
                            ].map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    onClick={() => handleAddSection(type)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-[4px] bg-white border border-gray-200 text-textSecondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium shadow-sm active:scale-95 w-full sm:w-auto"
                                >
                                    <Icon className="text-sm" />
                                    {label}
                                </button>
                            ))}

                            <div className="w-px h-5 bg-gray-300 mx-2 hidden sm:block"></div>

                            <button
                                onMouseDown={saveSelection}
                                onClick={handleOpenLinkModal}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-[4px] bg-white border border-gray-200 text-textSecondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium shadow-sm active:scale-95 w-full sm:w-auto"
                            >
                                <IoIosLink className="text-sm" />
                                Add Link
                            </button>
                        </div>
                    </div>

                    {/* Quill Toolbar */}
                    <div id="common-toolbar" className="p-2 sm:p-3 bg-white flex flex-wrap gap-1 md:gap-2 justify-center border-none">
                        {/* Font Weight & Text Styles */}
                        <span className="ql-formats flex flex-wrap gap-1">
                            <CustomDropdown
                                options={fontSizeOptions}
                                value={fontSize}
                                onChange={setFontSize}
                                label="Font Size"
                                icon={<TbTextSize />}
                                editorId={focusedEditor}
                                format="size"
                                editorRefs={editorRefs}
                            />
                            <CustomDropdown
                                options={fontWeightOptions}
                                value={fontWeight}
                                onChange={setFontWeight}
                                label="Font Weight"
                                icon={<MdFormatBold />}
                                editorId={focusedEditor}
                                format="weight"
                                editorRefs={editorRefs}
                            />
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Italic"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    if (focusedEditor && editorRefs.current[focusedEditor]) {
                                        const quill = editorRefs.current[focusedEditor].getEditor();
                                        const selection = quill.getSelection();
                                        if (selection) {
                                            const newItalicState = !isItalic;
                                            setIsItalic(newItalicState);
                                            if (selection.length > 0) {
                                                quill.formatText(selection.index, selection.length, 'italic', newItalicState, 'user');
                                            } else {
                                                quill.format('italic', newItalicState, 'user');
                                            }
                                        }
                                    }
                                }}
                            >
                                <MdFormatItalic />
                            </button>
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Underline"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    if (focusedEditor && editorRefs.current[focusedEditor]) {
                                        const quill = editorRefs.current[focusedEditor].getEditor();
                                        const selection = quill.getSelection();
                                        if (selection) {
                                            const newUnderlineState = !isUnderline;
                                            setIsUnderline(newUnderlineState);
                                            if (selection.length > 0) {
                                                quill.formatText(selection.index, selection.length, 'underline', newUnderlineState, 'user');
                                            } else {
                                                quill.format('underline', newUnderlineState, 'user');
                                            }
                                        }
                                    }
                                }}
                            >
                                <MdFormatUnderlined />
                            </button>
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Strikethrough"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    if (focusedEditor && editorRefs.current[focusedEditor]) {
                                        const quill = editorRefs.current[focusedEditor].getEditor();
                                        const selection = quill.getSelection();
                                        if (selection) {
                                            const currentFormat = quill.getFormat(selection);
                                            const newValue = !currentFormat.strike;
                                            if (selection.length > 0) {
                                                quill.formatText(selection.index, selection.length, 'strike', newValue, 'user');
                                            } else {
                                                quill.format('strike', newValue, 'user');
                                            }
                                        }
                                    }
                                }}
                            >
                                <PiTextStrikethroughBold />
                            </button>
                        </span>

                        {/* Colors */}
                        <span className="ql-formats relative flex gap-1">
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Text Color"
                                onClick={() => {
                                    saveSelection();
                                    setShowColorPicker(!showColorPicker);
                                    setShowBgPicker(false);
                                }}
                            >
                                <AiOutlineFontColors />
                            </button>
                            {showColorPicker && (
                                <AdvancedColorPicker
                                    onSelect={(c) => {
                                        applyFormat('color', c);
                                        setShowColorPicker(false);
                                    }}
                                    onClose={() => setShowColorPicker(false)}
                                />
                            )}
                        </span>
                        <span className="ql-formats relative flex gap-1">
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Background Color"
                                onClick={() => {
                                    saveSelection();
                                    setShowBgPicker(!showBgPicker);
                                    setShowColorPicker(false);
                                }}
                            >
                                <CgColorPicker />
                            </button>
                            {showBgPicker && (
                                <AdvancedColorPicker
                                    onSelect={(c) => {
                                        applyFormat('background', c);
                                        setShowBgPicker(false);
                                    }}
                                    onClose={() => setShowBgPicker(false)}
                                />
                            )}
                        </span>

                        {/* Text Align */}
                        <span className="ql-formats flex gap-1">
                            <AlignDropdown
                                value={textAlign}
                                onChange={setTextAlign}
                                editorId={focusedEditor}
                                editorRefs={editorRefs}
                            />
                        </span>

                        {/* Lists */}
                        <span className="ql-formats flex gap-1">
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Bullet List"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleListFormat('bullet')}
                            >
                                <MdFormatListBulleted />
                            </button>
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Numbered List"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleListFormat('ordered')}
                            >
                                <MdFormatListNumbered />
                            </button>
                        </span>

                        {/* Indent */}
                        <span className="ql-formats flex gap-1">
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Decrease Indent"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleIndent('-1')}
                            >
                                <MdFormatIndentDecrease />
                            </button>
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Increase Indent"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleIndent('+1')}
                            >
                                <MdFormatIndentIncrease />
                            </button>
                        </span>

                        {/* Image & Link */}
                        <span className="ql-formats flex gap-1">
                            <button
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Insert Image"
                                onClick={() => handleAddSection('image')}
                            >
                                <FaRegImage />
                            </button>
                            <button
                                type="button"
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                                title="Insert Link"
                                onMouseDown={saveSelection}
                                onClick={handleOpenLinkModal}
                            >
                                <MdLink />
                            </button>
                        </span>

                        {/* Undo/Redo */}
                        <span className="ql-formats flex gap-1">
                            <button
                                onClick={handleUndo}
                                title="Undo"
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                            >
                                <MdUndo />
                            </button>
                            <button
                                onClick={handleRedo}
                                title="Redo"
                                className="p-1.5 sm:p-2 rounded-[4px] transition-colors duration-200 cursor-pointer flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-7 sm:h-9 [&>svg]:w-[16px] [&>svg]:h-[16px] sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] text-textSecondary hover:text-primary hover:bg-green-100"
                            >
                                <MdRedo />
                            </button>
                        </span>
                    </div>
                </div>

                {/* Editor Area (Scrollable Sections) */}
                <div className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 md:p-10 no-scrollbar">
                    <div className="max-w-full mx-auto space-y-6 pb-20">
                        {(!sections || sections.length === 0) ? (
                            <div className="text-center py-16 text-gray-400 bg-white rounded-[4px] border border-dashed border-gray-200 shadow-sm transition-all hover:bg-gray-50 flex flex-col items-center">
                                <p className="text-base font-medium">No Terms & Condition policy sections found.</p>
                                <p className="text-sm mt-1 mb-6 text-gray-400">Add sections using the block tools above.</p>
                                <button onClick={() => handleAddSection('text')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-[4px] font-semibold text-sm transition-colors">
                                    <TbTextSize /> Start with Text Block
                                </button>
                            </div>
                        ) : (
                            sections.map((section) => (
                                <div key={section.id} className="relative group bg-white border border-transparent hover:border-gray-200 hover:shadow-md rounded-[4px] transition-all duration-200">
                                    {/* Action Buttons */}
                                    <div className="absolute -right-3 -top-3 hidden group-hover:flex items-center gap-1.5 z-10 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => handleCopySection(section.id)} className="p-2 bg-white rounded-[4px] shadow-lg border border-gray-100 text-textSecondary hover:text-primary hover:bg-gray-50 transition-colors" title="Duplicate">
                                            <MdOutlineContentCopy size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteSection(section.id)} className="p-2 bg-white rounded-[4px] shadow-lg border border-gray-100 text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Content Block */}
                                    <div className="p-4 md:p-6 pb-2 md:pb-3 relative">
                                        {/* Tag Label */}
                                        <div className="absolute -left-3 top-4 hidden md:flex items-center justify-center p-1.5 bg-gray-100 text-textSecondary rounded-[4px] shadow-sm opacity-50 group-hover:opacity-100 transition-opacity" title={section.type}>
                                            {section.type === 'title' && <TbTextSize size={14} />}
                                            {section.type === 'text' && <TbTextSize size={14} />}
                                            {section.type === 'points' && <AiOutlineBars size={14} />}
                                            {section.type === 'image' && <FaRegImage size={14} />}
                                        </div>

                                        {section.type === 'image' ? (
                                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-[4px] bg-white relative min-h-[200px] transition-all hover:border-primary/30">
                                                {uploadingSections[section.id] && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-[4px] backdrop-blur-sm bg-white/50">
                                                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                                                    </div>
                                                )}

                                                {section.content ? (
                                                    <div className="mb-4 max-w-full overflow-hidden rounded-[4px] shadow-sm relative border border-gray-100">
                                                        <img src={section.content} alt="Terms & Condition" className="max-w-full" />
                                                    </div>
                                                ) : (
                                                    <div className="mb-6 flex flex-col items-center justify-center text-gray-400">
                                                        <MdOutlineFileUpload className="text-5xl mb-3 opacity-30" />
                                                        <p className="text-sm font-medium">Drop an image here or click to upload</p>
                                                    </div>
                                                )}
                                                <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-sm font-bold text-white bg-primary hover:bg-primaryHover hover:text-white cursor-pointer transition-all shadow-sm active:scale-95">
                                                    <MdOutlineFileUpload className="text-xl" />
                                                    <span className="uppercase tracking-wider">{section.content ? 'Change Image' : 'Upload Image'}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingSections[section.id]}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setUploadingSections(prev => ({ ...prev, [section.id]: true }));
                                                                dispatch(uploadTermImage(file)).then((action) => {
                                                                    if (action.payload) {
                                                                        handleSectionChange(section.id, action.payload);
                                                                    }
                                                                    setUploadingSections(prev => ({ ...prev, [section.id]: false }));
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="quill-editor-wrapper-no-toolbar" data-section-type={section.type}>
                                                <ReactQuill
                                                    ref={(el) => { editorRefs.current[section.id] = el; }}
                                                    value={section.content}
                                                    onChange={(content) => handleSectionChange(section.id, content)}
                                                    onFocus={() => handleEditorFocus(section.id)}
                                                    onSelectionChange={(range) => {
                                                        if (range && editorRefs.current[section.id]) {
                                                            const quill = editorRefs.current[section.id].getEditor();
                                                            const formats = quill.getFormat(range);
                                                            if (formats.size) setFontSize(formats.size);
                                                            if (formats.weight) setFontWeight(formats.weight);
                                                            setIsItalic(!!formats.italic);
                                                            setIsUnderline(!!formats.underline);
                                                            setTextAlign(formats.align || '');
                                                        }
                                                    }}
                                                    modules={quillModules}
                                                    formats={quillFormats}
                                                    theme="snow"
                                                    className={`rounded-[4px] bg-white border-none transition-colors text-textPrimary ${section.type === 'text' ? 'text-gray-700' : "font-bold text-gray-900"}`}
                                                    placeholder={section.type === 'title' ? 'Enter title...' : section.type === 'points' ? 'Enter points...' : 'Enter content...'}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md mx-4 border border-gray-100 animate-in zoom-in duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-[4px] text-primary">
                                    <IoMdLink className='text-xl' />
                                </div>
                                <span className="text-xl font-bold text-textPrimary font-jost">Add Link</span>
                            </div>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-red-500 p-2 hover:bg-gray-100 rounded-[4px] transition-all"
                                onClick={() => setShowLinkModal(false)}
                            >
                                <IoMdClose className='text-xl' />
                            </button>
                        </div>
                        <div className="px-6 py-6 space-y-6">
                            <div className="space-y-2">
                                <div className="bg-gray-50 border border-gray-100 rounded-[4px] px-4 py-4">
                                    <p className='uppercase text-[10px] text-gray-400 mb-2 font-bold tracking-widest'>Selected Text</p>
                                    <p className='text-sm text-gray-700 font-medium'>{linkData.text || 'No text selected'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Target URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 border border-gray-200 rounded-[4px] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder-gray-400"
                                    placeholder="https://example.com"
                                    value={linkData.url}
                                    onChange={(e) =>
                                        setLinkData((prev) => ({ ...prev, url: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-5 bg-gray-50/50 rounded-b-3xl border-t border-gray-100">
                            <button
                                type="button"
                                className="px-5 py-2.5 text-sm font-bold text-textSecondary hover:text-gray-700 transition-colors"
                                onClick={() => setShowLinkModal(false)}
                            >
                                CANCEL
                            </button>
                            <button
                                type="button"
                                className="px-8 py-2.5 bg-primary hover:bg-primaryHover text-white text-sm font-bold rounded-[4px] transition-all shadow-md active:scale-95"
                                onClick={handleApplyLink}
                            >
                                APPLY
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Termscondition;
