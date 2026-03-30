import React from 'react';
import { FiTrash2, FiAlertCircle, FiX } from 'react-icons/fi';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Close Button */}
                <div className="flex justify-end p-4 pb-0">
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
                        <FiTrash2 className="text-red-500" size={20} />
                    </div>

                    <h3 className="text-lg font-bold text-black mb-2">
                        {title || "Confirm Deletion"}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        {message || "Are you sure you want to delete this item? This action is permanent and cannot be undone."}
                    </p>

                    {/* Actions */}
                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 font-[600] rounded-[4px] text-sm tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-red-500 text-white font-[600] rounded-[4px] text-sm tracking-widest shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : ("Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
