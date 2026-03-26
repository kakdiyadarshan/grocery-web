import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const handleError = (error, dispatch, rejectWithValue) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    dispatch(setAlert({ text: message, type: 'error' }));
    return rejectWithValue(message);
};

export const fetchOfferBanners = createAsyncThunk(
    'banner/fetchBanners',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getofferbanners`);
            return response.data;
        } catch (error) {
            return handleError(error, dispatch, rejectWithValue);
        }
    }
);

export const createOfferBanner = createAsyncThunk(
    'banner/createofferbanner',
    async (bannerData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/createofferbanner`, bannerData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            dispatch(setAlert({ text: 'Banner created successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleError(error, dispatch, rejectWithValue);
        }
    }
);

export const updateOfferBanner = createAsyncThunk(
    'banner/updateofferbanner',
    async ({ id, bannerData }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/updateofferbanner/${id}`, bannerData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            dispatch(setAlert({ text: 'Banner updated successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleError(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteOfferBanner = createAsyncThunk(
    'banner/deleteofferbanner',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BASE_URL}/deleteofferbanner/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: 'OfferBanner deleted successfully', type: 'success' }));
            return id;
        } catch (error) {
            return handleError(error, dispatch, rejectWithValue);
        }
    }
);

const offerbannerSlice = createSlice({
    name: 'offerbanner',
    initialState: {
        offerbanners: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOfferBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOfferBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.offerbanners = action.payload;
            })
            .addCase(fetchOfferBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createOfferBanner.fulfilled, (state, action) => {
                state.offerbanners.push(action.payload);
            })
            .addCase(updateOfferBanner.fulfilled, (state, action) => {
                const index = state.offerbanners.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.offerbanners[index] = action.payload;
                }
            })
            .addCase(deleteOfferBanner.fulfilled, (state, action) => {
                state.offerbanners = state.offerbanners.filter(b => b._id !== action.payload);
            });
    }
});

export default offerbannerSlice.reducer;
