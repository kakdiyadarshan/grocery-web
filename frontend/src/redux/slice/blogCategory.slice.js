import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/baseUrl';
import axios from 'axios';
import { setAlert } from './alert.slice';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    blogCategory: [],
    loading: false,
    submitLoading: false,
    error: null,
}

export const getAllBlogCategory = createAsyncThunk(
    'blogCategory/getAllBlogCategory',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/all/category`, getAuthHeader());
            return response.data.result?.blogsCategory || response.data.result || [];
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createBlogCategory = createAsyncThunk(
    'blogCategory/createBlogCategory',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/new/blogCategory`, formData, getAuthHeader());
            dispatch(setAlert({ text: 'Category added successfully', type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateBlogCategory = createAsyncThunk(
    'blogCategory/updateBlogCategory',
    async ({ id, formData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}/update/blogCategory/${id}`, formData, getAuthHeader());
            dispatch(setAlert({ text: 'Category updated successfully', type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteBlogCategory = createAsyncThunk(
    'blogCategory/deleteBlogCategory',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/delete/blogCategory/${id}`, getAuthHeader());
            dispatch(setAlert({ text: 'Category deleted successfully', type: 'success' }));
            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const blogCategorySlice = createSlice({
    name: "blogCategory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get All
            .addCase(getAllBlogCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllBlogCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.blogCategory = action.payload;
            })
            .addCase(getAllBlogCategory.rejected, (state) => {
                state.loading = false;
            })
            // Create
            .addCase(createBlogCategory.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(createBlogCategory.fulfilled, (state) => {
                state.submitLoading = false;
            })
            .addCase(createBlogCategory.rejected, (state) => {
                state.submitLoading = false;
            })
            // Update
            .addCase(updateBlogCategory.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(updateBlogCategory.fulfilled, (state) => {
                state.submitLoading = false;
            })
            .addCase(updateBlogCategory.rejected, (state) => {
                state.submitLoading = false;
            })
            // Delete
            .addCase(deleteBlogCategory.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(deleteBlogCategory.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.blogCategory = state.blogCategory.filter(cat => cat._id !== action.payload);
            })
            .addCase(deleteBlogCategory.rejected, (state) => {
                state.submitLoading = false;
            });
    }
})

export default blogCategorySlice.reducer;

