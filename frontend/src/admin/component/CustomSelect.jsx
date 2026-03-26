import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';

const CustomSelect = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Select...',
    icon: Icon,
    className = "",
    buttonClassName = "",
    dropdownAlign = "left",
    required = false,
    searchable = true,
    dropdownClassName = "",
    optionClassName = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = searchable ? options.filter(option => {
        const optionLabel = typeof option === 'object' ? option.label : option;
        return optionLabel.toLowerCase().includes(searchTerm.toLowerCase());
    }) : options;

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

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    // Helper to get label to display
    const getDisplayLabel = () => {
        if (!value) return placeholder;
        // If options are objects, find the label
        if (options.length > 0 && typeof options[0] === 'object') {
            const selected = options.find(opt => opt.value === value);
            return selected ? selected.label : value;
        }
        return value;
    };

    // Helper to get icon if option object has one
    const getDisplayIcon = () => {
        if (!value) return Icon ? <Icon /> : null;
        if (options.length > 0 && typeof options[0] === 'object') {
            const selected = options.find(opt => opt.value === value);
            // specific option icon overrides prop icon
            if (selected && selected.icon) return selected.icon;
        }
        return Icon ? <Icon className={value === 'light' ? 'text-orange-400' : (value === 'dark' ? 'text-blue-400' : '')} /> : null;
    };

    return (
        <div className={`relative ${className} ${isOpen ? 'z-50' : ''}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {label} {required && <span className="text-primary font-bold">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 w-full px-4 py-2.5 bg-white border ${isOpen ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'} rounded-[4px] text-sm text-gray-700 hover:border-gray-300 transition-all outline-none ${buttonClassName}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {getDisplayIcon()}
                    <span className={`truncate ${!value ? 'text-gray-400' : 'font-medium'}`}>
                        {getDisplayLabel()}
                    </span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 text-gray-400 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute top-full ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} mt-1 w-full min-w-full bg-white rounded-[4px] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col z-50 ${dropdownClassName}`}>
                    {/* Search Input - Only show if searchable is true */}
                    {searchable && (
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-[4px] text-gray-700 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchTerm('');
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-40  no-scrollbar py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                {options.length === 0 ? "No options available" : `No results found for "${searchTerm}"`}
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const isObject = typeof option === 'object';
                                const optionValue = isObject ? option.value : option;
                                const optionLabel = isObject ? option.label : option;
                                const optionIcon = isObject ? option.icon : null;
                                const isSelected = value === optionValue;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(optionValue)}
                                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors text-left
                                            ${isSelected
                                                ? 'bg-primary/5 text-primary font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            } ${optionClassName}`}
                                    >
                                        {optionIcon && <span className={isSelected ? 'text-primary text-xs' : 'text-gray-400 text-xs'}>{optionIcon}</span>}
                                        <span className="truncate">{optionLabel}</span>
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

export default CustomSelect;
