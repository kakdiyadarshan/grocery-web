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
    loading: false,
    error: null,
    onboardingStep: 0,
    gstDetails: null,
    brandDetails: null,
    bankDetails: null,
    pickupAddress: null,
    isOnboardingCompleted: false,
    status: null,
};

export const verifyGst = createAsyncThunk(
    'seller/verifyGst',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/seller/verify-gst`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const sendOnboardingOtp = createAsyncThunk(
    'seller/sendOtp',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/seller/send-otp`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const verifyOnboardingOtp = createAsyncThunk(
    'seller/verifyOtp',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/seller/verify-otp`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateBrandDetails = createAsyncThunk(
    'seller/updateBrandDetails',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/seller/brand-details`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateBankDetails = createAsyncThunk(
    'seller/updateBankDetails',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/seller/bank-details`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updatePickupAddress = createAsyncThunk(
    'seller/updatePickupAddress',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/seller/pickup-address`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const submitAgreement = createAsyncThunk(
    'seller/submitAgreement',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/seller/submit-agreement`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const sellerSlice = createSlice({
    name: 'seller',
    initialState,
    reducers: {
        resetSellerState: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // Verify GST
            .addCase(verifyGst.pending, (state) => { state.loading = true; })
            .addCase(verifyGst.fulfilled, (state, action) => {
                state.loading = false;
                state.onboardingStep = action.payload.onboardingStep;
                state.gstDetails = action.payload.gstDetails;
            })
            .addCase(verifyGst.rejected, (state) => { state.loading = false; })
            
            // Onboarding OTP
            .addCase(verifyOnboardingOtp.pending, (state) => { state.loading = true; })
            .addCase(verifyOnboardingOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.onboardingStep = action.payload.onboardingStep;
            })
            .addCase(verifyOnboardingOtp.rejected, (state) => { state.loading = false; })

            // Brand Details
            .addCase(updateBrandDetails.pending, (state) => { state.loading = true; })
            .addCase(updateBrandDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.onboardingStep = action.payload.onboardingStep;
            })
            .addCase(updateBrandDetails.rejected, (state) => { state.loading = false; })

            // Bank Details
            .addCase(updateBankDetails.pending, (state) => { state.loading = true; })
            .addCase(updateBankDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.onboardingStep = action.payload.onboardingStep;
            })
            .addCase(updateBankDetails.rejected, (state) => { state.loading = false; })

            // Pickup Address
            .addCase(updatePickupAddress.pending, (state) => { state.loading = true; })
            .addCase(updatePickupAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.onboardingStep = action.payload.onboardingStep;
            })
            .addCase(updatePickupAddress.rejected, (state) => { state.loading = false; })

            // Submit Agreement
            .addCase(submitAgreement.pending, (state) => { state.loading = true; })
            .addCase(submitAgreement.fulfilled, (state, action) => {
                state.loading = false;
                state.onboardingStep = action.payload.onboardingStep;
                state.isOnboardingCompleted = true;
            })
            .addCase(submitAgreement.rejected, (state) => { state.loading = false; });
    },
});

export const { resetSellerState } = sellerSlice.actions;
export default sellerSlice.reducer;
