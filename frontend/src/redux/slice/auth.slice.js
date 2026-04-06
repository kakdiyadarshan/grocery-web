import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';
// import axiosInstance from '../../Utils/axiosInstance';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, type: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    user: null,
    users: [],
    isAuthenticated: false,
    loading: false,
    error: null,
    loggedIn: false,
    isLoggedOut: false,
    message: null,
};


export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/userlogin`, userData, { withCredentials: true });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.data._id);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/getusersById`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.data;
        } catch (error) {
            if (error.response?.status === 401) {
                dispatch({ type: 'auth/logout', payload: { message: 'Session expired. Please login again.' } });
                return rejectWithValue('Session expired');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchAllUsers = createAsyncThunk(
    'user/fetchAllUsers',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/users`, {
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

export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/update-profile`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, userData);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data; // return full response so message is available
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (verifyData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify-otp`, verifyData);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.data._id);
            }
            
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/resend-otp`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/forgot-password`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const forgotVerifyOtp = createAsyncThunk(
    'auth/forgotVerifyOtp',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/forgotverifyotp`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/reset-password`, data);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/change-password`, data, {
                headers: {
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
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/logout`);
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setauth: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.loggedIn = true;
                state.isLoggedOut = false;
                state.user = action.payload;
                state.message = action.payload.message || "Login Successfully";
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.loggedIn = false;
                state.error = action.payload?.message || "Login failed";
            })
            .addCase(fetchUserProfile.pending, (state) => {
                if (!state.user) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
                state.message = action.payload.message || "User Profile Fetched Successfully";
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.message = action.payload.message || "User Profile Fetch Failed";
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.message = "Profile updated successfully";
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Profile update failed";
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Registration successful";
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Registration failed";
            })
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.loggedIn = true;
                state.isLoggedOut = false;
                state.user = action.payload?.data;
                state.message = action.payload?.message || "Account verified successfully.";
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Verification failed";
            })
            .addCase(resendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "OTP resent successfully";
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Resend OTP failed";
            })
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Forgot password OTP sent";
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Forgot password failed";
            })
            .addCase(forgotVerifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotVerifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Forgot OTP verified successfully";
            })
            .addCase(forgotVerifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Forgot OTP verification failed";
            })
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload; // Store fetched users
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Password Reset Successfully..!";
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Reset password failed";
            })
            .addCase(changePassword.pending, (state) => {
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Password Changed Successfully";
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Change password failed";
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.loggedIn = false;
                state.isLoggedOut = true;
                state.user = null;
                state.message = action.payload?.message || "Logged out successfully";
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.sessionStorage.clear();
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Logout failed";
            });
    },
});

export const { setauth, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
