import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/baseUrl';
import { setAlert } from './alert.slice';

const formatMessage = (n) => {
  const t = n?.type || n?.payload?.type || '';
  const p = n?.payload || {};
  if (n?.message) return n.message;
  if (p?.message) return p.message;
  if (t === 'table_status_changed') {
    const title = p.tableTitle || p.tableId || '';
    const status = p.status || '';
    return `Table ${title} status changed to ${status}`.trim();
  }
  if (t === 'new_order') {
    const title = p.tableTitle || p.tableId || '';
    const items = Array.isArray(p.items) ? p.items.filter(Boolean) : [];
    const list = items
      .map((it) => {
        const nm = it?.name || it?.product?.name || '';
        const q = it?.qty ?? it?.quantity ?? 1;
        return nm ? `${nm} x${q}` : '';
      })
      .filter(Boolean)
      .join(', ');
    const suffix = list ? `: ${list}` : '';
    return `New order arise on ${title}${suffix}`.trim();
  }
  if (t === 'item_ready') {
    const title = p.tableTitle || p.tableId || '';
    const itemName = p.itemName || '';
    return `${itemName} is ready on ${title}`.trim();
  }
  if (t === 'order_paid') {
    const title = p.tableTitle || p.tableId || '';
    return `Order paid for ${title}`.trim();
  }
  return 'Notification';
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];
      const res = await axios.get(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const server = Array.isArray(res.data?.data) ? res.data.data : [];

      const map = new Map();
      server.forEach((n) => {
        const key = n._id || `${n.type}-${n.message}-${n.createdAt}`;
        if (!map.has(key)) map.set(key, n);
      });
      const mergedAll = Array.from(map.values())
        .map((n) => ({ ...n, message: formatMessage(n) }))
        .sort((a, b) => {
          // Sort by _id timestamp if available (MongoDB ObjectId contains creation timestamp)
          if (a._id && b._id) {
            const aTimestamp = parseInt(a._id.substring(0, 8), 16);
            const bTimestamp = parseInt(b._id.substring(0, 8), 16);
            return bTimestamp - aTimestamp;
          }
          // Fallback to createdAt if _id is not available
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 100);
      return mergedAll;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch notifications';
      dispatch(setAlert({ text: msg, color: 'error' }));
      return rejectWithValue(error.response?.data || { message: msg });
    }
  }
);

export const markNotificationSeen = createAsyncThunk(
  'notifications/markSeen',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      if (!id) return;
      const token = localStorage.getItem('token');
      if (!token) return id;
      await axios.put(`${BASE_URL}/notifications/${id}/seen`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to mark notification as seen';
      dispatch(setAlert({ text: msg, color: 'error' }));
      return rejectWithValue(error.response?.data || { message: msg });
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return true;
      }
      await axios.put(`${BASE_URL}/notifications`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to clear notifications';
      dispatch(setAlert({ text: msg, color: 'error' }));
      return rejectWithValue(error.response?.data || { message: msg });
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unread: 0,
    loading: false,
    message: '',
    isError: false,
  },
  reducers: {
    receiveNotification: (state, action) => {
      const data = action.payload || {};
      const msg = formatMessage({ payload: data, type: data?.type, message: data?.message });

      // Preserve the original _id from the backend if present
      const item = {
        _id: data._id, // Retain the original MongoDB _id from backend
        message: msg,
        type: data?.type || 'notify',
        payload: data.payload || {},
        createdAt: data.createdAt || new Date().toISOString(),
        seen: false,
      };

      // Prevent duplicates
      if (item._id && state.items.some(existing => existing._id === item._id)) {
        return;
      }

      state.items = [item, ...state.items].slice(0, 100);
      state.unread = state.unread + 1;
    },
    resetNotifications: (state) => {
      state.items = [];
      state.unread = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.message = 'Fetching notifications...';
        state.isError = false;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.unread = state.items.filter((n) => !n.seen).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch notifications';
      })
      .addCase(markNotificationSeen.fulfilled, (state, action) => {
        const id = action.payload;
        // Update the seen status in the items list instead of removing it
        state.items = state.items.map(n => n._id === id ? { ...n, seen: true } : n);
        state.unread = state.items.filter(n => !n.seen).length;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.items = state.items.map(n => ({ ...n, seen: true }));
        state.unread = 0;
      });
  },
});

export const { receiveNotification, resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;

