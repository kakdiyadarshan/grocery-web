import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    monthlyAnalytics: [],
    revenueAnalytics: null,
    loading: false,
    error: null,
};

export const fetchSellerOrderMonthlyAnalytics = createAsyncThunk(
    'sellerDashboard/fetchSellerOrderMonthlyAnalytics',
    async (year, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const url = year ? `${BASE_URL}/seller/order-monthly-analytics?year=${year}` : `${BASE_URL}/seller/order-monthly-analytics`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const fetchSellerRevenueAnalytics = createAsyncThunk(
    'sellerDashboard/fetchSellerRevenueAnalytics',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/seller/revenue-analytics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const sellerDashboardSlice = createSlice({
    name: 'sellerDashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSellerOrderMonthlyAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchSellerOrderMonthlyAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.monthlyAnalytics = action.payload.data;
            })
            .addCase(fetchSellerOrderMonthlyAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSellerRevenueAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchSellerRevenueAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.revenueAnalytics = action.payload.data;
            })
            .addCase(fetchSellerRevenueAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default sellerDashboardSlice.reducer;
