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
    subscribers: [],
    loading: false,
    submitLoading: false,
    emailLoading: false,
    error: null,
};

export const getAllSubscribers = createAsyncThunk(
    'subscribe/getAllSubscribers',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/all-subscribers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const subscribeNewsletter = createAsyncThunk(
    'subscribe/subscribeNewsletter',
    async (email, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/subscribe`, { email });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteSubscriber = createAsyncThunk(
    'subscribe/deleteSubscriber',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/delete-subscriber/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const sendOfferEmail = createAsyncThunk(
    'subscribe/sendOfferEmail',
    async ({ subject, message }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/send-offer-email`, { subject, message }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const subscribeSlice = createSlice({
    name: 'subscribe',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get All Subscribers
            .addCase(getAllSubscribers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllSubscribers.fulfilled, (state, action) => {
                state.loading = false;
                state.subscribers = action.payload;
            })
            .addCase(getAllSubscribers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Subscriber
            .addCase(deleteSubscriber.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(deleteSubscriber.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.subscribers = state.subscribers.filter(s => s._id !== action.payload);
            })
            .addCase(deleteSubscriber.rejected, (state) => {
                state.submitLoading = false;
            })
            // Send Offer Email
            .addCase(sendOfferEmail.pending, (state) => {
                state.emailLoading = true;
            })
            .addCase(sendOfferEmail.fulfilled, (state) => {
                state.emailLoading = false;
            })
            .addCase(sendOfferEmail.rejected, (state) => {
                state.emailLoading = false;
            });
    },
});

export default subscribeSlice.reducer;
