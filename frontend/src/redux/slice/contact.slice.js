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
    contacts: [],
    loading: false,
    error: null,
};

export const getAllContacts = createAsyncThunk(
    'contact/getAllContacts',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/contacts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteContact = createAsyncThunk(
    'contact/deleteContact',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${BASE_URL}/contacts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch(setAlert({ text: response.data.message, type: 'success' }));
            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createContact = createAsyncThunk(
    'contact/createContact',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/contact`, formData);
            dispatch(setAlert({ text: 'Message sent successfully!', type: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllContacts.pending, (state) => { state.loading = true; })
            .addCase(getAllContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload;
            })
            .addCase(getAllContacts.rejected, (state) => { state.loading = false; })
            .addCase(deleteContact.fulfilled, (state, action) => {
                state.contacts = state.contacts.filter(c => c._id !== action.payload);
            })
            .addCase(createContact.pending, (state) => { state.loading = true; })
            .addCase(createContact.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts.push(action.payload);
            })
            .addCase(createContact.rejected, (state) => { state.loading = false; });
    }
});

export default contactSlice.reducer;
