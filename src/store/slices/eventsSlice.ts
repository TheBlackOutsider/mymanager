import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Event, PaginatedResponse } from '../../types';
import { eventsApi } from '../../services/api';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
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
    dateRange: {
      start: string;
      end: string;
    };
  };
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
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
    dateRange: {
      start: '',
      end: '',
    },
  },
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params: { page?: number; limit?: number; search?: string; type?: string; status?: string }) => {
    const response = await eventsApi.getAll(params);
    return response.data;
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string) => {
    const response = await eventsApi.getById(id);
    return response.data;
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await eventsApi.create(event);
    return response.data;
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, event }: { id: string; event: Partial<Event> }) => {
    const response = await eventsApi.update(id, event);
    return response.data;
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string) => {
    await eventsApi.delete(id);
    return id;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EventsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<PaginatedResponse<Event>>) => {
        state.loading = false;
        state.events = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.currentEvent = action.payload;
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.events.unshift(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.events = state.events.filter(event => event.id !== action.payload);
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent = null;
        }
      });
  },
});

export const { setFilters, clearCurrentEvent, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;