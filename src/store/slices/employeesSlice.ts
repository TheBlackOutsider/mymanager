import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee, PaginatedResponse } from '../../types';
import { employeesApi } from '../../services/api';

interface EmployeesState {
  employees: Employee[];
  currentEmployee: Employee | null;
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
    department: string;
    role: string;
  };
}

const initialState: EmployeesState = {
  employees: [],
  currentEmployee: null,
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
    department: '',
    role: '',
  },
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params: { page?: number; limit?: number; search?: string; department?: string; role?: string }) => {
    const response = await employeesApi.getAll(params);
    return response.data;
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string) => {
    const response = await employeesApi.getById(id);
    return response.data;
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await employeesApi.create(employee);
    return response.data;
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employee }: { id: string; employee: Partial<Employee> }) => {
    const response = await employeesApi.update(id, employee);
    return response.data;
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string) => {
    await employeesApi.delete(id);
    return id;
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EmployeesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<PaginatedResponse<Employee>>) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.currentEmployee = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.employees.unshift(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action: PayloadAction<string>) => {
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
      });
  },
});

export const { setFilters, clearCurrentEmployee, clearError } = employeesSlice.actions;
export default employeesSlice.reducer;