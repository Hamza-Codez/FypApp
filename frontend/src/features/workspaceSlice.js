import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchProjects = createAsyncThunk('workspace/fetchProjects', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/projects/');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchEmployees = createAsyncThunk('workspace/fetchEmployees', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/users/employees');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const createProject = createAsyncThunk('workspace/createProject', async (projectData, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.post('/projects/', projectData);
        dispatch(fetchProjects());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const addEmployee = createAsyncThunk('workspace/addEmployee', async (employeeData, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.post('/users/employee', employeeData);
        dispatch(fetchEmployees());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const uploadEmployeesCSV = createAsyncThunk('workspace/uploadEmployeesCSV', async (file, { rejectWithValue, dispatch }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/users/employee/csv', formData);
        dispatch(fetchEmployees());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateTaskStatus = createAsyncThunk('workspace/updateTaskStatus', async ({ taskId, status }, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.put(`/projects/tasks/${taskId}/status`, { status });
        dispatch(fetchProjects());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const createTask = createAsyncThunk('workspace/createTask', async (taskData, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.post('/projects/tasks', taskData);
        dispatch(fetchProjects());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateProject = createAsyncThunk('workspace/updateProject', async ({ id, ...updateData }, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.put(`/projects/${id}`, updateData);
        dispatch(fetchProjects());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const initialState = {
    projects: [],
    employees: [],
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            const ws = state.workspaces.find(w => w.id === action.payload);
            if (ws) state.currentWorkspace = ws;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => { state.loading = true; })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.employees = action.payload;
            })
            .addCase('auth/login/fulfilled', (state, action) => {
                if (action.payload.user?.organization_name) {
                    state.currentWorkspace = {
                        id: "1",
                        name: action.payload.user.organization_name,
                        image_url: action.payload.user.org_logo || "https://via.placeholder.com/150",
                        membersCount: 0
                    };
                    state.workspaces = [state.currentWorkspace];
                }
            })
            .addCase('auth/fetchMe/fulfilled', (state, action) => {
                if (action.payload.organization_name) {
                    state.currentWorkspace = {
                        id: "1",
                        name: action.payload.organization_name,
                        image_url: action.payload.org_logo || "https://via.placeholder.com/150",
                        membersCount: 0
                    };
                    state.workspaces = [state.currentWorkspace];
                }
            });
    }
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;