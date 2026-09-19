import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Attendance, AttendanceCreate } from '../types';
import { attendanceApi } from '../services/api';

interface AttendanceState {
  items: Attendance[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchAttendance = createAsyncThunk('attendance/fetchAll', async (params: any = {}, { rejectWithValue }) => {
  try {
    const response = await attendanceApi.list(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch attendance');
  }
});

export const markAttendance = createAsyncThunk('attendance/mark', async (data: AttendanceCreate, { rejectWithValue }) => {
  try {
    const response = await attendanceApi.mark(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to mark attendance');
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<Attendance[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchAttendance.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(markAttendance.fulfilled, (state, action: PayloadAction<Attendance>) => { state.items.unshift(action.payload); });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;