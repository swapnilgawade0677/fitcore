import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats } from '../types';
import { dashboardApi } from '../services/api';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardApi.getStats();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard stats');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => { state.isLoading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;