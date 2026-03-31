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
    products: [],
    allProducts: [],
    totalProducts: 0,
    featuredProducts: [],
    product: null,
    loading: false,
    error: null,
};

export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/createProduct`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.product;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const importProducts = createAsyncThunk(
    'product/importProducts',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/importProducts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllProducts = createAsyncThunk(
    'product/getAllProducts',
    async (params = {}, { dispatch, rejectWithValue }) => {
        try {
            const { page, limit, paginate, search, category, minPrice, maxPrice, weights, availability, sort } = params;
            let url = `${BASE_URL}/getAllProducts`;
            const queryParams = new URLSearchParams();
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);
            if (paginate !== undefined) queryParams.append('paginate', paginate);
            if (search) queryParams.append('search', search);
            if (category) queryParams.append('category', category);
            if (minPrice) queryParams.append('minPrice', minPrice);
            if (maxPrice) queryParams.append('maxPrice', maxPrice);
            if (weights) queryParams.append('weights', weights);
            if (availability) queryParams.append('availability', availability);
            if (sort) queryParams.append('sort', sort);

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);



export const getProductById = createAsyncThunk(
    'product/getProductById',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getProductById/${id}`);
            return response.data.product;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async ({ id, formData }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/updateProduct/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.product;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/deleteProduct',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/deleteProduct/${id}`, {
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

export const getFeaturedProducts = createAsyncThunk(
    'product/getFeaturedProducts',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getFeaturedProducts`);
            return response.data.products;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createProduct.pending, (state) => { state.loading = true; })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state) => { state.loading = false; })
            .addCase(importProducts.pending, (state) => { state.loading = true; })
            .addCase(importProducts.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(importProducts.rejected, (state) => { state.loading = false; })
            .addCase(getAllProducts.pending, (state) => { state.loading = true; })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.totalProducts !== undefined) {
                    state.products = action.payload.products;
                    state.totalProducts = action.payload.totalProducts;
                } else {
                    state.products = action.payload.products;
                    state.allProducts = action.payload.products; // For shop filters
                    state.totalProducts = action.payload.products.length;
                }
            })
            .addCase(getAllProducts.rejected, (state) => { state.loading = false; })

            .addCase(getProductById.pending, (state) => { state.loading = true; })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload;
            })
            .addCase(getProductById.rejected, (state) => { state.loading = false; })
            .addCase(updateProduct.pending, (state) => { state.loading = true; })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.products[index] = action.payload;
            })
            .addCase(updateProduct.rejected, (state) => { state.loading = false; })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            })
            .addCase(getFeaturedProducts.pending, (state) => { state.loading = true; })
            .addCase(getFeaturedProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredProducts = action.payload;
            })
            .addCase(getFeaturedProducts.rejected, (state) => { state.loading = false; });
    }
});

export default productSlice.reducer;
