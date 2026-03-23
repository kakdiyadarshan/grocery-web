import { toast } from 'sonner';

// Helper function to show toast notifications using Sonner
// This replaces the old Redux-based alert system

export const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    warning: (message) => toast.warning(message),
    default: (message) => toast(message),
};

// For backward compatibility with existing code that uses setAlert
// This function can be called directly without dispatch
export const setAlert = (payload) => {
    const { text, color, type } = payload;
    const alertType = color || type || 'default';

    switch (alertType) {
        case 'success':
            toast.success(text);
            break;
        case 'error':
            toast.error(text);
            break;
        case 'info':
            toast.info(text);
            break;
        case 'warning':
            toast.warning(text);
            break;
        default:
            toast(text);
            break;
    }

    // Return a dummy action for Redux compatibility
    return { type: 'alert/setAlert', payload };
};

export const resetAlert = () => {
    toast.dismiss();
    return { type: 'alert/resetAlert' };
};

// Default export for Redux store compatibility (empty reducer)
const alertReducer = (state = { text: '', type: 'default' }, action) => {
    return state;
};

export default alertReducer;