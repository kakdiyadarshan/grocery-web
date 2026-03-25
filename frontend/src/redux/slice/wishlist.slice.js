import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    wishlist: null,
    loading: false,
    error: null,
};

export const getWishlist = createAsyncThunk(
    'wishlist/getWishlist',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.wishlist;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/addToWishlist',
    async (productId, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/wishlist/add`, { productId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.wishlist;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (productId, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/wishlist/remove/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.wishlist;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getWishlist.pending, (state) => { state.loading = true; })
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload;
            })
            .addCase(getWishlist.rejected, (state) => { state.loading = false; })
            .addCase(addToWishlist.pending, (state) => { state.loading = true; })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload;
            })
            .addCase(addToWishlist.rejected, (state) => { state.loading = false; })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.wishlist = action.payload;
            });
    }
});

export default wishlistSlice.reducer;
