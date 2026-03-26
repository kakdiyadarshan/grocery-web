import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const getToken = () => localStorage.getItem('token');

const initialState = {
    addresses: [],
    loading: false,
    submitLoading: false,
    error: null,
};

// Fetch all addresses
export const fetchAddresses = createAsyncThunk(
    'address/fetchAddresses',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/addresses`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Add new address
export const addAddress = createAsyncThunk(
    'address/addAddress',
    async (addressData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/address`, addressData, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            dispatch(setAlert({ text: 'Address added successfully!', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Update an address
export const updateAddress = createAsyncThunk(
    'address/updateAddress',
    async ({ addressId, addressData }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/address/${addressId}`, addressData, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            dispatch(setAlert({ text: 'Address updated successfully!', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Delete an address
export const deleteAddress = createAsyncThunk(
    'address/deleteAddress',
    async (addressId, { dispatch, rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/address/${addressId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            dispatch(setAlert({ text: 'Address deleted successfully!', type: 'success' }));
            return addressId;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Set default address
export const setDefaultAddress = createAsyncThunk(
    'address/setDefaultAddress',
    async (addressId, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/address-default/${addressId}`, {}, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            dispatch(setAlert({ text: 'Default address updated!', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchAddresses
            .addCase(fetchAddresses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // addAddress
            .addCase(addAddress.pending, (state) => { state.submitLoading = true; })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.submitLoading = false;
                // If the new address is default, unset others
                if (action.payload.isDefault) {
                    state.addresses = state.addresses.map(a => ({ ...a, isDefault: false }));
                }
                state.addresses.unshift(action.payload);
            })
            .addCase(addAddress.rejected, (state) => { state.submitLoading = false; })

            // updateAddress
            .addCase(updateAddress.pending, (state) => { state.submitLoading = true; })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.submitLoading = false;
                if (action.payload.isDefault) {
                    state.addresses = state.addresses.map(a => ({ ...a, isDefault: false }));
                }
                const idx = state.addresses.findIndex(a => a._id === action.payload._id);
                if (idx !== -1) state.addresses[idx] = action.payload;
            })
            .addCase(updateAddress.rejected, (state) => { state.submitLoading = false; })

            // deleteAddress
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.addresses = state.addresses.filter(a => a._id !== action.payload);
            })

            // setDefaultAddress
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.addresses = state.addresses.map(a => ({
                    ...a,
                    isDefault: a._id === action.payload._id,
                }));
            });
    },
});

export default addressSlice.reducer;
