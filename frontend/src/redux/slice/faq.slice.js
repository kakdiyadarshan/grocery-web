import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { toast } from 'sonner';

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    toast.error(errorMessage);
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllFAQs = createAsyncThunk(
    'faq/getAllFAQs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getAllFaq`);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const getFAQById = createAsyncThunk(
    'faq/getFAQById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getFaqById/${id}`);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createFAQ = createAsyncThunk(
    'faq/createFAQ',
    async (faqData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/createFaq`, faqData,{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });           
            toast.success(response.data.message || 'FAQ created successfull..!');
            return response.data.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateFAQ = createAsyncThunk(
    'faq/updateFAQ',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/updateFaq/${id}`, data,{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            toast.success(response.data.message || 'FAQ updated successfull..!');
            return response.data.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteFAQ = createAsyncThunk(
    'faq/deleteFAQ',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${BASE_URL}/deleteFaq/${id}`,{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            toast.success(response.data.message || 'FAQ deleted successfull..!');
            return id;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

const faqSlice = createSlice({
    name: 'faq',
    initialState: {
        faqs: [],
        currentFAQ: null,
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllFAQs.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(getAllFAQs.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs = action.payload;
                state.message = action.payload.message || "FAQs fetched successfully..!";
            })
            .addCase(getAllFAQs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getFAQById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFAQById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentFAQ = action.payload;
                state.message = action.payload.message || "FAQ fetched successfully..!";
            })
            .addCase(getFAQById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createFAQ.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFAQ.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs.push(action.payload);
                state.message = action.payload.message || "FAQ created successfully..!";
            })
            .addCase(createFAQ.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateFAQ.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFAQ.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs = state.faqs.map(faq =>
                    faq._id === action.payload._id ? action.payload : faq
                );
                state.message = action.payload.message || "FAQ updated successfully..!";
            })
            .addCase(updateFAQ.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteFAQ.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteFAQ.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs = state.faqs.filter(faq => faq._id !== action.payload);
                state.message = action.payload.message || "FAQ deleted successfully..!";
            })
            .addCase(deleteFAQ.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default faqSlice.reducer;