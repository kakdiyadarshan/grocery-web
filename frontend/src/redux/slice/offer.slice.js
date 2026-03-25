import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

// Thunks
export const createOffer = createAsyncThunk(
    'offer/createOffer',
    async (offerData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/addoffer`, offerData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: 'Offer created successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create offer';
            dispatch(setAlert({ text: message, type: 'error' }));
            return rejectWithValue(message);
        }
    }
);

export const getAllOffers = createAsyncThunk(
    'offer/getAllOffers',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getoffers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
        }
    }
);

export const deleteOffer = createAsyncThunk(
    'offer/deleteOffer',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BASE_URL}/deleteoffer/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: 'Offer deleted successfully', type: 'success' }));
            return id;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete offer';
            dispatch(setAlert({ text: message, type: 'error' }));
            return rejectWithValue(message);
        }
    }
);

export const updateOffer = createAsyncThunk(
    'offer/updateOffer',
    async ({ id, data }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/updateoffer/${id}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: 'Offer updated successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update offer';
            dispatch(setAlert({ text: message, type: 'error' }));
            return rejectWithValue(message);
        }
    }
);

const offerSlice = createSlice({
    name: 'offer',
    initialState: {
        offers: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Create Offer
            .addCase(createOffer.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOffer.fulfilled, (state, action) => {
                state.loading = false;
                state.offers.push(action.payload);
            })
            .addCase(createOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get All Offers
            .addCase(getAllOffers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllOffers.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = action.payload;
            })
            .addCase(getAllOffers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Offer
            .addCase(updateOffer.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOffer.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.offers.findIndex(o => o._id === action.payload._id);
                if (index !== -1) {
                    state.offers[index] = action.payload;
                }
            })
            .addCase(updateOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Offer
            .addCase(deleteOffer.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOffer.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = state.offers.filter(offer => offer._id !== action.payload);
            })
            .addCase(deleteOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default offerSlice.reducer;
