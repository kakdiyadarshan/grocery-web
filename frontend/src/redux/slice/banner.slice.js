import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const handleError = (error, dispatch, rejectWithValue) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    dispatch(setAlert({ text: message, type: 'error' }));
    return rejectWithValue(message);
};

export const fetchBanners = createAsyncThunk(
    'banner/fetchBanners',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getbanners`);
            return response.data;
        } catch (error) {
            return handleError(error, dispatch, rejectWithValue);
        }
    }
);

export const createBanner = createAsyncThunk(
    'banner/createBanner',
    async (bannerData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/createbanner`, bannerData, {
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

export const updateBanner = createAsyncThunk(
    'banner/updateBanner',
    async ({ id, bannerData }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/updatebanner/${id}`, bannerData, {
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

export const deleteBanner = createAsyncThunk(
    'banner/deleteBanner',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BASE_URL}/deletebanner/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: 'Banner deleted successfully', type: 'success' }));
            return id;
        } catch (error) {
            return handleError(error, dispatch, rejectWithValue);
        }
    }
);

const bannerSlice = createSlice({
    name: 'banner',
    initialState: {
        banners: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createBanner.fulfilled, (state, action) => {
                state.banners.push(action.payload);
            })
            .addCase(updateBanner.fulfilled, (state, action) => {
                const index = state.banners.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.banners[index] = action.payload;
                }
            })
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter(b => b._id !== action.payload);
            });
    }
});

export default bannerSlice.reducer;
