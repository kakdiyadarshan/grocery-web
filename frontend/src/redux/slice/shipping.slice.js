import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { BASE_URL } from '../../utils/baseUrl';

const handleErrors = (error, rejectWithValue) => {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  toast.error(errorMessage);
  return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllShipping = createAsyncThunk(
  'shipping/getAllShipping',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getallshipping`);
      return response.data.data;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

export const saveAllShipping = createAsyncThunk(
  'shipping/saveAllShipping',
  async (shippingData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/saveallshipping`,
        { shipping: shippingData },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      toast.success(response.data.message || 'All shipping policies saved successfully..!', { className: "bg-green text-white border-green-700", });
      return response.data.data;
    } catch (error) {
      return handleErrors(error, rejectWithValue);
    }
  }
);

export const uploadShippingImage = createAsyncThunk(
  'shipping/uploadShippingImage',
  async (file, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${BASE_URL}/shipping/upload-image`,
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

const shippingSlice = createSlice({
  name: 'shipping',
  initialState: {
    shipping: [],
    message: '',
    loading: false,
    isError: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllShipping.pending, (state) => {
        state.loading = true;
        state.message = 'Fetching shipping policies...';
        state.isError = false;
      })
      .addCase(getAllShipping.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Shipping policies fetched successfully..!';
        state.shipping = action.payload;
        state.isError = false;
      })
      .addCase(getAllShipping.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch shipping policies';
      })
      .addCase(saveAllShipping.pending, (state) => {
        state.loading = true;
        state.message = 'Saving all shipping policies...';
        state.isError = false;
      })
      .addCase(saveAllShipping.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'All shipping policies saved successfully..!';
        state.isError = false;
        state.shipping = action.payload;
      })
      .addCase(saveAllShipping.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to save shipping policies';
      });
  },
});

export default shippingSlice.reducer;
