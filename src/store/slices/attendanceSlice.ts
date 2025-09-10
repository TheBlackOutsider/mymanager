import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Attendance, AttendanceStats, PaginatedResponse } from '../../types';
import { attendanceApi } from '../../services/api';

interface AttendanceState {
  attendance: Attendance[];
  currentAttendance: Attendance | null;
  stats: AttendanceStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    eventId: string;
    employeeId: string;
    status: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

const initialState: AttendanceState = {
  attendance: [],
  currentAttendance: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    eventId: '',
    employeeId: '',
    status: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
};

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (params: { page?: number; limit?: number; eventId?: string; employeeId?: string; status?: string }) => {
    const response = await attendanceApi.getAll(params);
    return response.data;
  }
);

export const fetchAttendanceById = createAsyncThunk(
  'attendance/fetchAttendanceById',
  async (id: string) => {
    const response = await attendanceApi.getById(id);
    return response.data;
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async (eventId: string) => {
    const response = await attendanceApi.getStats(eventId);
    return response.data;
  }
);

export const registerForEvent = createAsyncThunk(
  'attendance/registerForEvent',
  async ({ eventId, employeeId }: { eventId: string; employeeId: string }) => {
    const response = await attendanceApi.register(eventId, employeeId);
    return response.data;
  }
);

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async ({ attendanceId, checkInTime }: { attendanceId: string; checkInTime: string }) => {
    const response = await attendanceApi.checkIn(attendanceId, checkInTime);
    return response.data;
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async ({ attendanceId, checkOutTime }: { attendanceId: string; checkOutTime: string }) => {
    const response = await attendanceApi.checkOut(attendanceId, checkOutTime);
    return response.data;
  }
);

export const updateAttendanceStatus = createAsyncThunk(
  'attendance/updateAttendanceStatus',
  async ({ attendanceId, status, notes }: { attendanceId: string; status: string; notes?: string }) => {
    const response = await attendanceApi.updateStatus(attendanceId, status, notes);
    return response.data;
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id: string) => {
    await attendanceApi.delete(id);
    return id;
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AttendanceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentAttendance: (state) => {
      state.currentAttendance = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<PaginatedResponse<Attendance>>) => {
        state.loading = false;
        state.attendance = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch attendance';
      })
      .addCase(fetchAttendanceById.fulfilled, (state, action: PayloadAction<Attendance>) => {
        state.currentAttendance = action.payload;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action: PayloadAction<AttendanceStats>) => {
        state.stats = action.payload;
      })
      .addCase(registerForEvent.fulfilled, (state, action: PayloadAction<Attendance>) => {
        state.attendance.unshift(action.payload);
      })
      .addCase(checkIn.fulfilled, (state, action: PayloadAction<Attendance>) => {
        const index = state.attendance.findIndex(att => att.id === action.payload.id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        if (state.currentAttendance?.id === action.payload.id) {
          state.currentAttendance = action.payload;
        }
      })
      .addCase(checkOut.fulfilled, (state, action: PayloadAction<Attendance>) => {
        const index = state.attendance.findIndex(att => att.id === action.payload.id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        if (state.currentAttendance?.id === action.payload.id) {
          state.currentAttendance = action.payload;
        }
      })
      .addCase(updateAttendanceStatus.fulfilled, (state, action: PayloadAction<Attendance>) => {
        const index = state.attendance.findIndex(att => att.id === action.payload.id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        if (state.currentAttendance?.id === action.payload.id) {
          state.currentAttendance = action.payload;
        }
      })
      .addCase(deleteAttendance.fulfilled, (state, action: PayloadAction<string>) => {
        state.attendance = state.attendance.filter(att => att.id !== action.payload);
        if (state.currentAttendance?.id === action.payload) {
          state.currentAttendance = null;
        }
      });
  },
});

export const { setFilters, clearCurrentAttendance, clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer; 