import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Feedback, FeedbackCreate } from '../types';
import { feedbacksApi } from '../services/api';

interface FeedbacksState {
  items: Feedback[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedbacksState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchFeedbacks = createAsyncThunk('feedbacks/fetchAll', async (params: any = {}, { rejectWithValue }) => {
  try {
    const response = await feedbacksApi.list(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to fetch feedbacks');
  }
});

export const createFeedback = createAsyncThunk('feedbacks/create', async (data: FeedbackCreate, { rejectWithValue }) => {
  try {
    const response = await feedbacksApi.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Failed to create feedback');
  }
});

const feedbacksSlice = createSlice({
  name: 'feedbacks',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedbacks.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchFeedbacks.fulfilled, (state, action: PayloadAction<Feedback[]>) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchFeedbacks.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(createFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => { state.items.unshift(action.payload); });
  },
});

export const { clearError } = feedbacksSlice.actions;
export default feedbacksSlice.reducer;