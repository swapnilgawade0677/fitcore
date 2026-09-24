import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Member, MemberCreate, MemberUpdate } from '../types';
import { membersApi } from '../services/api';

interface MembersState {
  items: Member[];
  selected: Member | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: MembersState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 100, total: 0 },
};

export const fetchMembers = createAsyncThunk(
  'members/fetchAll',
  async (params: { skip?: number; limit?: number; status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await membersApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch members');
    }
  }
);

export const fetchMember = createAsyncThunk(
  'members/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await membersApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch member');
    }
  }
);

export const createMember = createAsyncThunk(
  'members/create',
  async (data: MemberCreate, { rejectWithValue }) => {
    try {
      const response = await membersApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create member');
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/update',
  async ({ id, data }: { id: number; data: MemberUpdate }, { rejectWithValue }) => {
    try {
      const response = await membersApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update member');
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await membersApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete member');
    }
  }
);

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action: PayloadAction<Member[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMember.fulfilled, (state, action: PayloadAction<Member>) => {
        state.selected = action.payload;
      })
      .addCase(createMember.fulfilled, (state, action: PayloadAction<Member>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateMember.fulfilled, (state, action: PayloadAction<Member>) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteMember.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearSelected, clearError } = membersSlice.actions;
export default membersSlice.reducer;