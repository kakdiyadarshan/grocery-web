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
    cart: null,
    loading: false,
    error: null,
    appliedCoupon: null,
};

export const getCart = createAsyncThunk(
    'cart/getCart',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.cart;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId,variantId, quantity }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/cart/add`, { productId, variantId, quantity }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.cart;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateCartQuantity = createAsyncThunk(
    'cart/updateCartQuantity',
    async ({ productId, variantId, quantity }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/cart/update`, { productId, variantId, quantity }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.cart;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async ({ productId, variantId }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/cart/remove/${productId}${variantId ? `?variantId=${variantId}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.cart;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const applyCouponFromServer = createAsyncThunk(
    'cart/applyCouponFromServer',
    async ({ id }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/applyCoupon`, { id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Unable to apply coupon.';
            return rejectWithValue(errorMessage);
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/cart/clear`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.cart;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);



const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        applyCoupon: (state, action) => {
            state.appliedCoupon = action.payload;
        },
        removeCoupon: (state) => {
            state.appliedCoupon = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCart.pending, (state) => { state.loading = true; })
            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
            })
            .addCase(getCart.rejected, (state) => { state.loading = false; })
            .addCase(addToCart.pending, (state) => { state.loading = true; })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
            })
            .addCase(addToCart.rejected, (state) => { state.loading = false; })
            .addCase(updateCartQuantity.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.cart = action.payload;
            })
            .addCase(applyCouponFromServer.pending, (state) => { state.loading = true; })
            .addCase(applyCouponFromServer.fulfilled, (state, action) => {
                state.loading = false;
                state.appliedCoupon = action.payload;
            })
            .addCase(applyCouponFromServer.rejected, (state) => { state.loading = false; });

    }
});

export const { applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
