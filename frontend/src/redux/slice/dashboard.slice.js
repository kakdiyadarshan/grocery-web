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

export const fetchOrderMonthlyAnalytics = createAsyncThunk(
    'dashboard/fetchOrderMonthlyAnalytics',
    async (year, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const url = year ? `${BASE_URL}/order-monthly-analytics?year=${year}` : `${BASE_URL}/order-monthly-analytics`;
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

export const fetchRevenueAnalytics = createAsyncThunk(
    'dashboard/fetchRevenueAnalytics',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/revenue-analytics`, {
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

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderMonthlyAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchOrderMonthlyAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.monthlyAnalytics = action.payload.data;
            })
            .addCase(fetchOrderMonthlyAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchRevenueAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.revenueAnalytics = action.payload.data;
            })
            .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default dashboardSlice.reducer;
