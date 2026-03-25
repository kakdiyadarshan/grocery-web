import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX, FiCheck } from 'react-icons/fi';

const CustomMultiSelect = ({
    label,
    options,
    value = [],
    onChange,
    placeholder = 'Select items...',
    className = "",
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset search term when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const removeOption = (e, optionValue) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {label} {required && <span className="text-primary font-bold">*</span>}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex flex-wrap items-center gap-2 w-full min-h-[42px] px-3 py-2 bg-white border ${isOpen ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'} rounded-[4px] text-sm transition-all cursor-pointer outline-none`}
            >
                {value.length === 0 ? (
                    <span className="text-gray-400 px-1">{placeholder}</span>
                ) : (
                    <div className="flex flex-wrap gap-1.5 pt-0.5 pb-0.5 max-w-[calc(100%-24px)]">
                        {options.filter(opt => value.includes(opt.value)).map((opt, idx) => (
                            <span
                                key={idx}
                                className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded-[4px] text-xs font-medium"
                            >
                                <span className="truncate max-w-[150px]">{opt.label}</span>
                                <FiX
                                    className="cursor-pointer hover:text-red-500 text-gray-400 shrink-0"
                                    onClick={(e) => removeOption(e, opt.value)}
                                />
                            </span>
                        ))}
                    </div>
                )}
                <FiChevronDown className={`ml-auto transition-transform duration-200 text-gray-400 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-[4px] shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 pb-2 text-xs bg-gray-50 border border-gray-200 rounded-[4px] text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all pl-3"
                            />
                            {searchTerm && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchTerm('');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-52 no-scrollbar py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                {options.length === 0 ? "No options available" : `No results found for "${searchTerm}"`}
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleOption(option.value)}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors text-left
                                            ${isSelected
                                                ? 'bg-primary/5 text-primary font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="truncate pr-2">{option.label}</span>
                                        <div className="w-4 flex justify-center">
                                            {isSelected && <FiCheck className="text-primary shrink-0" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomMultiSelect;
