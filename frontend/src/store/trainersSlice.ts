import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Trainer, TrainerCreate, TrainerUpdate } from '../types';
import { trainersApi } from '../services/api';

interface TrainersState {
  items: Trainer[];
  selected: Trainer | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TrainersState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const fetchTrainers = createAsyncThunk('trainers/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await trainersApi.list();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch trainers');
  }
});

export const fetchTrainer = createAsyncThunk('trainers/fetchOne', async (id: number, { rejectWithValue }) => {
  try {
    const response = await trainersApi.get(id);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch trainer');
  }
});

export const createTrainer = createAsyncThunk('trainers/create', async (data: TrainerCreate, { rejectWithValue }) => {
  try {
    const response = await trainersApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create trainer');
  }
});

export const updateTrainer = createAsyncThunk('trainers/update', async ({ id, data }: { id: number; data: TrainerUpdate }, { rejectWithValue }) => {
  try {
    const response = await trainersApi.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update trainer');
  }
});

export const deleteTrainer = createAsyncThunk('trainers/delete', async (id: number, { rejectWithValue }) => {
  try {
    await trainersApi.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to delete trainer');
  }
});

const trainersSlice = createSlice({
  name: 'trainers',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTrainers.fulfilled, (state, action: PayloadAction<Trainer[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchTrainers.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(fetchTrainer.fulfilled, (state, action: PayloadAction<Trainer>) => { state.selected = action.payload; })
      .addCase(createTrainer.fulfilled, (state, action: PayloadAction<Trainer>) => { state.items.unshift(action.payload); })
      .addCase(updateTrainer.fulfilled, (state, action: PayloadAction<Trainer>) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteTrainer.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearError } = trainersSlice.actions;
export default trainersSlice.reducer;