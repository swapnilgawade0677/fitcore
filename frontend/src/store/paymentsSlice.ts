import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Payment, PaymentCreate, PaymentUpdate } from '../types';
import { paymentsApi } from '../services/api';

interface PaymentsState {
  items: Payment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk('payments/fetchAll', async (params: any = {}, { rejectWithValue }) => {
  try {
    const response = await paymentsApi.list(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch payments');
  }
});

export const createPayment = createAsyncThunk('payments/create', async (data: PaymentCreate, { rejectWithValue }) => {
  try {
    const response = await paymentsApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create payment');
  }
});

export const updatePayment = createAsyncThunk('payments/update', async ({ id, data }: { id: number; data: PaymentUpdate }, { rejectWithValue }) => {
  try {
    const response = await paymentsApi.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update payment');
  }
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchPayments.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<Payment>) => { state.items.unshift(action.payload); })
      .addCase(updatePayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export const { clearError } = paymentsSlice.actions;
export default paymentsSlice.reducer;