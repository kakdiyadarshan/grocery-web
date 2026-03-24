import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { BASE_URL } from '../../utils/baseUrl';

const handleErrors = (error, rejectWithValue) => {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  toast.error(errorMessage);
  return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllPrivacy = createAsyncThunk(
  'privacy/getAllPrivacy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getallprivacy`);
      return response.data.data;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

export const saveAllPrivacy = createAsyncThunk(
  'privacy/saveAllPrivacy',
  async (privacyData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/saveallprivacy`,
        { privacy: privacyData },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      toast.success(response.data.message || 'All privacy policies saved successfully..!', { className: "bg-green text-white border-green-700", });
      return response.data.data;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

export const uploadPrivacyImage = createAsyncThunk(
  'privacy/uploadPrivacyImage',
  async (file, { rejectWithValue }) => {

    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${BASE_URL}/privacy/upload-image`,
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

const privacySlice = createSlice({
  name: 'privacy',
  initialState: {
    privacy: [],
    message: '',
    loading: false,
    isError: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPrivacy.pending, (state) => {
        state.loading = true;
        state.message = 'Fetching privacy policies...';
        state.isError = false;
      })
      .addCase(getAllPrivacy.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Privacy policies fetched successfully..!';
        state.privacy = action.payload;
        state.isError = false;
      })
      .addCase(getAllPrivacy.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch privacy policies';
      })
      .addCase(saveAllPrivacy.pending, (state) => {
        state.loading = true;
        state.message = 'Saving all privacy policies...';
        state.isError = false;
      })
      .addCase(saveAllPrivacy.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'All privacy policies saved successfully..!';
        state.isError = false;
        state.privacy = action.payload;
      })
      .addCase(saveAllPrivacy.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to save privacy policies';
      });
  },
});

export default privacySlice.reducer;