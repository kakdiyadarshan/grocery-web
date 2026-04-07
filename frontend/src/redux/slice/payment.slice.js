import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const getToken = () => localStorage.getItem('token');

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    payments: [],
    loading: false,
    error: null,
};

// Fetch all payments (for admin)
export const fetchPayments = createAsyncThunk(
    'payment/fetchPayments',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getAllPayments`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Fetch seller payments
export const fetchSellerPayments = createAsyncThunk(
    'payment/fetchSellerPayments',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getSellerPayments`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


// Update payment status (for admin)
export const updatePaymentStatus = createAsyncThunk(
    'payment/updatePaymentStatus',
    async ({ id, status }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/updatePaymentStatus/${id}`, { status }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            dispatch(setAlert({ text: 'Payment status updated successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSellerPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSellerPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload;
            })
            .addCase(fetchSellerPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updatePaymentStatus.pending, (state) => {
                // Do not set loading to true to prevent UI flash/refresh on inline status change
            })
            .addCase(updatePaymentStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.payments.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.payments[index] = action.payload;
                }
            })
            .addCase(updatePaymentStatus.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default paymentSlice.reducer;
