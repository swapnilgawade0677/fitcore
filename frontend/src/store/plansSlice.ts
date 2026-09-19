import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MembershipPlan, MembershipPlanCreate, MembershipPlanUpdate } from '../types';
import { plansApi } from '../services/api';

interface PlansState {
  items: MembershipPlan[];
  selected: MembershipPlan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk('plans/fetchAll', async (activeOnly: boolean = true, { rejectWithValue }) => {
  try {
    const response = await plansApi.list({ active_only: activeOnly });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch plans');
  }
});

export const fetchPlan = createAsyncThunk('plans/fetchOne', async (id: number, { rejectWithValue }) => {
  try {
    const response = await plansApi.get(id);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch plan');
  }
});

export const createPlan = createAsyncThunk('plans/create', async (data: MembershipPlanCreate, { rejectWithValue }) => {
  try {
    const response = await plansApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create plan');
  }
});

export const updatePlan = createAsyncThunk('plans/update', async ({ id, data }: { id: number; data: MembershipPlanUpdate }, { rejectWithValue }) => {
  try {
    const response = await plansApi.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update plan');
  }
});

export const deletePlan = createAsyncThunk('plans/delete', async (id: number, { rejectWithValue }) => {
  try {
    await plansApi.delete(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to delete plan');
  }
});

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<MembershipPlan[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchPlans.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(fetchPlan.fulfilled, (state, action: PayloadAction<MembershipPlan>) => { state.selected = action.payload; })
      .addCase(createPlan.fulfilled, (state, action: PayloadAction<MembershipPlan>) => { state.items.unshift(action.payload); })
      .addCase(updatePlan.fulfilled, (state, action: PayloadAction<MembershipPlan>) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deletePlan.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearError } = plansSlice.actions;
export default plansSlice.reducer;