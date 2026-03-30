import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../utils/baseUrl";
import { setAlert } from "./alert.slice";


// Thunks

export const getAllCoupons = createAsyncThunk(
    'coupon/getAllCoupons',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getAllCoupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
        }
    }
)

export const createCoupon = createAsyncThunk(
    'coupon/createCoupon',
    async (couponData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/createCoupon`, couponData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: 'Coupon created successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create coupon';
            dispatch(setAlert({ text: message, type: 'error' }));
            return rejectWithValue(message);
        }
    }
)

export const updateCoupon = createAsyncThunk(
    'coupon/updateCoupon',
    async ({ id, couponData }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/updateCoupon/${id}`, couponData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: 'Coupon updated successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update coupon';
            dispatch(setAlert({ text: message, type: 'error' }));
            return rejectWithValue(message);
        }
    }
)

export const deleteCoupon = createAsyncThunk(
    'coupon/deleteCoupon',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BASE_URL}/deleteCoupon/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: 'Coupon deleted successfully', type: 'success' }));
            return id;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete coupon';
            dispatch(setAlert({ text: message, type: 'error' }));
            return rejectWithValue(message);
        }
    }
)

const couponSlice = createSlice({
    name: 'coupon',
    initialState: {
        coupons: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            //get all coupons
            .addCase(getAllCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
            })
            .addCase(getAllCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // create coupon
            .addCase(createCoupon.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons.unshift(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // update coupon
            .addCase(updateCoupon.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.coupons.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.coupons[index] = action.payload;
                }
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // delete coupon
            .addCase(deleteCoupon.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = state.coupons.filter(c => c._id !== action.payload);
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export default couponSlice.reducer;