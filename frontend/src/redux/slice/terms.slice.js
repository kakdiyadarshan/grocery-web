import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { BASE_URL } from '../../utils/baseUrl';

const handleErrors = (error, rejectWithValue) => {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  toast.error(errorMessage);
  return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllTerms = createAsyncThunk(
  'terms/getAllTerms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getallterms`);
      return response.data.data;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

export const saveAllTerms = createAsyncThunk(
  'terms/saveAllTerms',
  async (termsData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/saveallterms`,
        { terms: termsData },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      toast.success(response.data.message || 'All terms saved successfull..!', { className: "bg-green text-white border-green-700", });
      return response.data.data;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

export const uploadTermImage = createAsyncThunk(
  'terms/uploadTermImage',
  async (file, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${BASE_URL}/terms/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data.url;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

const termsSlice = createSlice({
  name: 'terms',
  initialState: {
    terms: [],
    message: '',
    loading: false,
    isError: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTerms.pending, (state) => {
        state.loading = true;
        state.message = 'Fetching terms...';
        state.isError = false;
      })
      .addCase(getAllTerms.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'terms fetched successfully..!';
        state.terms = action.payload;
        state.isError = false;
      })
      .addCase(getAllTerms.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch terms';
      })
      .addCase(saveAllTerms.pending, (state) => {
        state.loading = true;
        state.message = 'Saving all terms...';
        state.isError = false;
      })
      .addCase(saveAllTerms.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'All terms saved successfully..!';
        state.isError = false;
        state.terms = action.payload;
      })
      .addCase(saveAllTerms.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to save terms';
      });
  },
});

export default termsSlice.reducer;