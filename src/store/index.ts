import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeesReducer from './slices/employeesSlice';
import eventsReducer from './slices/eventsSlice';
import leavesReducer from './slices/leavesSlice';
import reportsReducer from './slices/reportsSlice';
import notificationsReducer from './slices/notificationsSlice';
import uiReducer from './slices/uiSlice';
import attendanceReducer from './slices/attendanceSlice';
import eventRegistrationReducer from './slices/eventRegistrationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    events: eventsReducer,
    leaves: leavesReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
    attendance: attendanceReducer,
    eventRegistration: eventRegistrationReducer, // Added event registration reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/openModal', 'ui/closeModal'],
        ignoredPaths: ['ui.modalContent'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;