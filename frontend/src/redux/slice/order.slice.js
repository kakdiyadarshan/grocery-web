import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    orders: [],
    allorders: [],
    currentOrder: null,
    loading: false,
    error: null,
};

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${BASE_URL}/createOrder`, orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const fetchOrders = createAsyncThunk(
    'order/fetchOrders',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getallorders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getUserOrders = createAsyncThunk(
    'order/getUserOrders',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getUserOrders`, {
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

export const getOrderById = createAsyncThunk(
    'order/getOrderById',
    async (orderId, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getOrder/${orderId}`, {
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

export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async (orderId, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/cancelOrder/${orderId}`, {}, {
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

export const updateOrderStatus = createAsyncThunk(
    'order/updateOrderStatus',
    async ({ id, status }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/updateOrderStatus/${id}`, { status }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: 'Order status updated successfully', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'order/deleteOrder',
    async (orderId, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/deleteOrder/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: 'Order deleted successfully', type: 'success' }));
            return orderId;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


const orderSlice = createSlice({

    name: 'order',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.allorders = action.payload.data;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createOrder.pending, (state) => { state.loading = true; })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload.data;
                state.currentOrder = data?.order || data;
            })

            .addCase(createOrder.rejected, (state) => { state.loading = false; })
            .addCase(getUserOrders.pending, (state) => { state.loading = true; })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getUserOrders.rejected, (state) => { state.loading = false; })

            .addCase(getOrderById.pending, (state) => { state.loading = true; })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(getOrderById.rejected, (state) => { state.loading = false; })

            .addCase(cancelOrder.rejected, (state) => { state.loading = false; })
            .addCase(updateOrderStatus.pending, (state) => { state.loading = true; })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = { ...state.currentOrder, ...action.payload };
                state.allorders = state.allorders.map(order =>
                    order._id === action.payload._id ? { ...order, ...action.payload } : order
                );
            })
            .addCase(updateOrderStatus.rejected, (state) => { state.loading = false; })
            .addCase(deleteOrder.pending, (state) => { state.loading = true; })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.allorders = state.allorders.filter(order => order._id !== action.payload);
            })
            .addCase(deleteOrder.rejected, (state) => { state.loading = false; });


    }
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
