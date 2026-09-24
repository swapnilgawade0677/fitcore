import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Equipment, EquipmentCreate, EquipmentUpdate } from '../types';
import { equipmentApi } from '../services/api';

interface EquipmentState {
  items: Equipment[];
  selected: Equipment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EquipmentState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const fetchEquipment = createAsyncThunk('equipment/fetchAll', async (params: any = {}, { rejectWithValue }) => {
  try {
    const response = await equipmentApi.list(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch equipment');
  }
});

export const fetchEquipmentById = createAsyncThunk('equipment/fetchOne', async (id: number, { rejectWithValue }) => {
  try {
    const response = await equipmentApi.get(id);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch equipment');
  }
});

export const createEquipment = createAsyncThunk('equipment/create', async (data: EquipmentCreate, { rejectWithValue }) => {
  try {
    const response = await equipmentApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create equipment');
  }
});

export const updateEquipment = createAsyncThunk('equipment/update', async ({ id, data }: { id: number; data: EquipmentUpdate }, { rejectWithValue }) => {
  try {
    const response = await equipmentApi.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update equipment');
  }
});

export const deleteEquipment = createAsyncThunk('equipment/delete', async (id: number, { rejectWithValue }) => {
  try {
    await equipmentApi.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to delete equipment');
  }
});

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchEquipment.fulfilled, (state, action: PayloadAction<Equipment[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchEquipment.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(fetchEquipmentById.fulfilled, (state, action: PayloadAction<Equipment>) => { state.selected = action.payload; })
      .addCase(createEquipment.fulfilled, (state, action: PayloadAction<Equipment>) => { state.items.unshift(action.payload); })
      .addCase(updateEquipment.fulfilled, (state, action: PayloadAction<Equipment>) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteEquipment.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearError } = equipmentSlice.actions;
export default equipmentSlice.reducer;