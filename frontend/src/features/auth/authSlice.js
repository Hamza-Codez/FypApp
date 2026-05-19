import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('remember_me', credentials.rememberMe ? 'true' : 'false');
        const response = await api.post('/auth/login', formData);

        
        // Handle persistent vs session storage
        const storage = credentials.rememberMe ? localStorage : sessionStorage;
        const otherStorage = credentials.rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem('token');
        otherStorage.removeItem('role');

        storage.setItem('token', response.data.access_token);
        storage.setItem('role', response.data.role);
        
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const signupHR = createAsyncThunk('auth/signupHR', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/signup/hr', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const deleteWorkspace = createAsyncThunk('auth/deleteWorkspace', async (_, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.delete('/users/me');
        dispatch(logout());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
    try {
        const response = await api.put('/users/me', userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwordData, { rejectWithValue }) => {
    try {
        const response = await api.put('/users/me/password', passwordData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const initialState = {
    user: null,
    token: localStorage.getItem('token') || sessionStorage.getItem('token'),
    role: localStorage.getItem('role') || sessionStorage.getItem('role'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => { state.loading = true; })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.role = action.payload.role;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Login failed';
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.user = action.payload;
                state.role = action.payload.role;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(changePassword.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
