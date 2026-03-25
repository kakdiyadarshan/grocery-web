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
    blogs: [],
    currentBlog: null,
    loading: false,
    submitLoading: false,
    error: null,
}

export const getBlogById = createAsyncThunk(
    'blog/getBlogById',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/blog/${id}`);
            return response.data.blog;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllBlogs = createAsyncThunk(
    'blog/getAllBlogs',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/all/blogs`, getAuthHeader());
            return response.data.blogs || [];
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createBlog = createAsyncThunk(
    'blog/createBlog',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/new/blog`, formData, {
                ...getAuthHeader(),
                headers: {
                    ...getAuthHeader().headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            dispatch(setAlert({ text: 'Blog published successfully!', type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateBlog = createAsyncThunk(
    'blog/updateBlog',
    async ({ id, formData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}/update/blog/${id}`, formData, {
                ...getAuthHeader(),
                headers: {
                    ...getAuthHeader().headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            dispatch(setAlert({ text: 'Blog updated successfully!', type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteBlog = createAsyncThunk(
    'blog/deleteBlog',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/delete/blog/${id}`, getAuthHeader());
            dispatch(setAlert({ text: 'Blog deleted successfully', type: 'success' }));
            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get All
            .addCase(getAllBlogs.pending, (state) => { state.loading = true; })
            .addCase(getAllBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = action.payload;
            })
            .addCase(getAllBlogs.rejected, (state) => { state.loading = false; })

            // Mutation loading states
            .addCase(createBlog.pending, (state) => { state.submitLoading = true; })
            .addCase(createBlog.fulfilled, (state) => { state.submitLoading = false; })
            .addCase(createBlog.rejected, (state) => { state.submitLoading = false; })

            .addCase(updateBlog.pending, (state) => { state.submitLoading = true; })
            .addCase(updateBlog.fulfilled, (state) => { state.submitLoading = false; })
            .addCase(updateBlog.rejected, (state) => { state.submitLoading = false; })

            .addCase(deleteBlog.pending, (state) => { state.submitLoading = true; })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
            })
            .addCase(deleteBlog.rejected, (state) => { state.submitLoading = false; })
            // Get By Id
            .addCase(getBlogById.pending, (state) => {
                state.loading = true;
                state.currentBlog = null;
            })
            .addCase(getBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBlog = action.payload;
            })
            .addCase(getBlogById.rejected, (state) => {
                state.loading = false;
            });
    }
})

export default blogSlice.reducer;
