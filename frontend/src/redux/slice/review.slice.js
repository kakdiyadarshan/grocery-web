import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { toast } from 'sonner';

export const fetchReviews = createAsyncThunk(
    'review/fetchReviews',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getAllReviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.reviews;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const fetchSellerReviews = createAsyncThunk(
    'review/fetchSellerReviews',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getSellerReviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.reviews;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'review/deleteReview',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BASE_URL}/deleteReview/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Review deleted successfully');
            return id;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete review');
            return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
        }
    }
);

export const createReview = createAsyncThunk(
    'review/createReview',
    async (formData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/addReview`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Review added successfully');
            return response.data.review;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
            return rejectWithValue(error.response?.data?.message || 'Failed to add review');
        }
    }
);

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviews: [],
        userreviews: [],
        productReviews: [],
        productWiseReviews: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Reviews
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Seller Reviews
            .addCase(fetchSellerReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSellerReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchSellerReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteReview.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Create Review
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews.unshift(action.payload);
            })
            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default reviewSlice.reducer;
