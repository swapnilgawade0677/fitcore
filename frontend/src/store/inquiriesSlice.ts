import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Inquiry, InquiryCreate, InquiryUpdate } from '../types';
import { inquiriesApi } from '../services/api';

interface InquiriesState {
  items: Inquiry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InquiriesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchInquiries = createAsyncThunk('inquiries/fetchAll', async (params: any = {}, { rejectWithValue }) => {
  try {
    const response = await inquiriesApi.list(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch inquiries');
  }
});

export const createInquiry = createAsyncThunk('inquiries/create', async (data: InquiryCreate, { rejectWithValue }) => {
  try {
    const response = await inquiriesApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create inquiry');
  }
});

export const updateInquiry = createAsyncThunk('inquiries/update', async ({ id, data }: { id: number; data: InquiryUpdate }, { rejectWithValue }) => {
  try {
    const response = await inquiriesApi.update(id, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to update inquiry');
  }
});

const inquiriesSlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInquiries.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchInquiries.fulfilled, (state, action: PayloadAction<Inquiry[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchInquiries.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(createInquiry.fulfilled, (state, action: PayloadAction<Inquiry>) => { state.items.unshift(action.payload); })
      .addCase(updateInquiry.fulfilled, (state, action: PayloadAction<Inquiry>) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export const { clearError } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;