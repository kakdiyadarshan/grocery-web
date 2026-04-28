import React, { useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';

const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded shadow-xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
                        <FiLogOut size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Confirm Logout
                    </h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to Logout? This action cannot be undone.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-hover)] transition disabled:opacity-50"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;