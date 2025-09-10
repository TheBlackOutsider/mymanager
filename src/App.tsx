import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Events from './pages/Events';
import Leaves from './pages/Leaves';
import MyLeaves from './pages/MyLeaves';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Attendance from './pages/Attendance';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={
                <ProtectedRoute requiredRoles={['hr_officer', 'hr_head']}>
                  <Employees />
                </ProtectedRoute>
              } />
              <Route path="events" element={
                <ProtectedRoute requiredRoles={['hr_officer', 'hr_head']}>
                  <Events />
                </ProtectedRoute>
              } />
              <Route path="leaves" element={
                <ProtectedRoute requiredRoles={['manager', 'hr_officer', 'hr_head']}>
                  <Leaves />
                </ProtectedRoute>
              } />
              <Route path="my-leaves" element={
                <ProtectedRoute requiredRoles={['employee', 'manager']}>
                  <MyLeaves />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute requiredRoles={['hr_officer', 'hr_head']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="notifications" element={<Notifications />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="attendance" element={
                <ProtectedRoute requiredRoles={['hr_officer', 'hr_head']}>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
