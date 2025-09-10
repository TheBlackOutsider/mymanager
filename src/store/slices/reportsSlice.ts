import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Report } from '../../types';
import { reportsApi } from '../../services/api';

interface ReportsState {
  reports: Report[];
  currentReport: Report | null;
  loading: boolean;
  error: string | null;
  analytics: {
    eventsPerMonth: any[];
    attendanceRate: number;
    leaveStats: any[];
    participationRate: number;
  };
}

const initialState: ReportsState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  analytics: {
    eventsPerMonth: [],
    attendanceRate: 0,
    leaveStats: [],
    participationRate: 0,
  },
};

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async () => {
    const response = await reportsApi.getAll();
    return response.data;
  }
);

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (params: { type: string; startDate?: string; endDate?: string }) => {
    const response = await reportsApi.generate(params);
    return response.data;
  }
);

export const fetchAnalytics = createAsyncThunk(
  'reports/fetchAnalytics',
  async (params: { startDate?: string; endDate?: string }) => {
    const response = await reportsApi.getAnalytics(params);
    return response.data;
  }
);

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async ({ id, format }: { id: string; format: 'pdf' | 'csv' }) => {
    const response = await reportsApi.export(id, format);
    return response.data;
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<Report[]>) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      })
      .addCase(generateReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearCurrentReport, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;