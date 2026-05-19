import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (limit = 5, { rejectWithValue }) => {
    try {
        const response = await api.get(`/notifications/?limit=${limit}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (notificationId, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        // We could fetch again, but specified optimistic update in requirements
        return { notificationId };
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async (_, { rejectWithValue }) => {
    try {
        const response = await api.post('/notifications/read-all');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const initialState = {
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    loading: false,
    error: null
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.unread_count;
                state.totalCount = action.payload.total_count;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload.notificationId);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.is_read = true);
                state.unreadCount = 0;
            });
    }
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
