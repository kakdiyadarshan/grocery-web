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
            });
    },
});

export default paymentSlice.reducer;
