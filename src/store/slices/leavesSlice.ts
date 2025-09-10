import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LeaveRequest, PaginatedResponse } from '../../types';
import { leavesApi } from '../../services/api';

interface LeavesState {
  leaves: LeaveRequest[];
  currentLeave: LeaveRequest | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    type: string;
    status: string;
    employeeId: string;
  };
}

const initialState: LeavesState = {
  leaves: [],
  currentLeave: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    type: '',
    status: '',
    employeeId: '',
  },
};

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeaves',
  async (params: { page?: number; limit?: number; search?: string; type?: string; status?: string; employeeId?: string }) => {
    const response = await leavesApi.getAll(params);
    return response.data;
  }
);

export const fetchLeaveById = createAsyncThunk(
  'leaves/fetchLeaveById',
  async (id: string) => {
    const response = await leavesApi.getById(id);
    return response.data;
  }
);

export const createLeave = createAsyncThunk(
  'leaves/createLeave',
  async (leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await leavesApi.create(leave);
    return response.data;
  }
);

export const updateLeave = createAsyncThunk(
  'leaves/updateLeave',
  async ({ id, leave }: { id: string; leave: Partial<LeaveRequest> }) => {
    const response = await leavesApi.update(id, leave);
    return response.data;
  }
);

export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
    const response = await leavesApi.approve(id, approvedBy);
    return response.data;
  }
);

export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async ({ id, rejectionReason, rejectedBy }: { id: string; rejectionReason: string; rejectedBy: string }) => {
    const response = await leavesApi.reject(id, rejectionReason, rejectedBy);
    return response.data;
  }
);

export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeave',
  async (id: string) => {
    await leavesApi.delete(id);
    return id;
  }
);

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<LeavesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentLeave: (state) => {
      state.currentLeave = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action: PayloadAction<PaginatedResponse<LeaveRequest>>) => {
        state.loading = false;
        state.leaves = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leaves';
      })
      .addCase(fetchLeaveById.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.currentLeave = action.payload;
      })
      .addCase(createLeave.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.leaves.unshift(action.payload);
      })
      .addCase(updateLeave.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        if (state.currentLeave?.id === action.payload.id) {
          state.currentLeave = action.payload;
        }
      })
      .addCase(approveLeave.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        if (state.currentLeave?.id === action.payload.id) {
          state.currentLeave = action.payload;
        }
      })
      .addCase(rejectLeave.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        if (state.currentLeave?.id === action.payload.id) {
          state.currentLeave = action.payload;
        }
      })
      .addCase(deleteLeave.fulfilled, (state, action: PayloadAction<string>) => {
        state.leaves = state.leaves.filter(leave => leave.id !== action.payload);
        if (state.currentLeave?.id === action.payload) {
          state.currentLeave = null;
        }
      });
  },
});

export const { setFilters, clearCurrentLeave, clearError } = leavesSlice.actions;
export default leavesSlice.reducer;