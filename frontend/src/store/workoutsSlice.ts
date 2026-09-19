import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutPlan, WorkoutPlanCreate, WorkoutPlanUpdate } from '../types';
import { workoutsApi } from '../services/api';

interface WorkoutsState {
  items: WorkoutPlan[];
  selected: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkoutsState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const fetchWorkouts = createAsyncThunk('workouts/fetchAll', async (params: any = {}, { rejectWithValue }) => {
  try {
    const response = await workoutsApi.list(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch workouts');
  }
});

export const fetchWorkout = createAsyncThunk('workouts/fetchOne', async (id: number, { rejectWithValue }) => {
  try {
    const response = await workoutsApi.get(id);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch workout');
  }
});

export const createWorkout = createAsyncThunk('workouts/create', async (data: WorkoutPlanCreate, { rejectWithValue }) => {
  try {
    const response = await workoutsApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create workout');
  }
});

export const updateWorkout = createAsyncThunk('workouts/update', async ({ id, data }: { id: number; data: WorkoutPlanUpdate }, { rejectWithValue }) => {
  try {
    const response = await workoutsApi.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update workout');
  }
});

export const deleteWorkout = createAsyncThunk('workouts/delete', async (id: number, { rejectWithValue }) => {
  try {
    await workoutsApi.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to delete workout');
  }
});

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkouts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchWorkouts.fulfilled, (state, action: PayloadAction<WorkoutPlan[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchWorkouts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(fetchWorkout.fulfilled, (state, action: PayloadAction<WorkoutPlan>) => { state.selected = action.payload; })
      .addCase(createWorkout.fulfilled, (state, action: PayloadAction<WorkoutPlan>) => { state.items.unshift(action.payload); })
      .addCase(updateWorkout.fulfilled, (state, action: PayloadAction<WorkoutPlan>) => {
        const index = state.items.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteWorkout.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((w) => w.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearError } = workoutsSlice.actions;
export default workoutsSlice.reducer;