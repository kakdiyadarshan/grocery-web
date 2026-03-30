import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, Calendar, ShoppingBag, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserOrders, cancelOrder } from '../redux/slice/order.slice';
import { toast } from 'sonner';

// ✅ Custom confirm dialog component
const ConfirmDialog = ({ isOpen, onConfirm, onCancel, orderId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-[4px] shadow-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Cancel order?</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-[4px] border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        Keep order
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-[4px] bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
                    >
                        Yes, cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;