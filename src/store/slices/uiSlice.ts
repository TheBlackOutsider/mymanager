import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentPage: string;
  modals: {
    employeeForm: boolean;
    eventForm: boolean;
    leaveForm: boolean;
    confirmDelete: boolean;
  };
  loading: {
    global: boolean;
  };
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  currentPage: 'dashboard',
  modals: {
    employeeForm: false,
    eventForm: false,
    leaveForm: false,
    confirmDelete: false,
  },
  loading: {
    global: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    openModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UiState['modals']] = false;
      });
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setCurrentPage,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;