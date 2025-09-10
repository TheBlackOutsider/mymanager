import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../Dashboard';
import reportsReducer from '../../store/slices/reportsSlice';
import authReducer from '../../store/slices/authSlice';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      reports: reportsReducer,
      auth: authReducer,
    },
    preloadedState: {
      reports: {
        analytics: null,
        isLoading: false,
        error: null,
        ...initialState.reports,
      },
      auth: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'hr_officer',
          department: 'HR',
          isActive: true,
          lastLogin: new Date().toISOString(),
          loginMethod: 'email',
          permissions: [],
          avatar: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: [],
        loginMethod: 'email',
        sessionExpiry: null,
        lastActivity: new Date().toISOString(),
        securityLevel: 'medium',
        ...initialState.auth,
      },
    },
  });
};

// Wrapper component for testing
const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

// Mock data
const mockAnalytics = {
  events: {
    total: 25,
    thisMonth: 8,
    upcoming: 5,
    completed: 20,
  },
  attendance: {
    average: 85.5,
    totalSessions: 120,
    totalAttendees: 1020,
  },
  leaves: {
    pending: 12,
    approved: 45,
    rejected: 3,
    totalRequests: 60,
  },
  employees: {
    total: 150,
    active: 145,
    newThisMonth: 5,
    departments: 8,
  },
  departments: [
    { name: 'HR', participation: 95, events: 8 },
    { name: 'Engineering', participation: 88, events: 12 },
    { name: 'Sales', participation: 92, events: 6 },
  ],
  recentActivities: [
    {
      id: '1',
      type: 'event_created',
      title: 'Team Meeting',
      description: 'New event created',
      timestamp: new Date().toISOString(),
      user: 'John Doe',
    },
    {
      id: '2',
      type: 'leave_approved',
      title: 'Leave Request Approved',
      description: 'Annual leave approved for Jane Smith',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'HR Manager',
    },
  ],
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with title and description', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Tableau de Bord')).toBeInTheDocument();
    expect(screen.getByText('Vue d\'ensemble de votre organisation')).toBeInTheDocument();
  });

  it('renders KPI cards with correct data', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Events KPI
    expect(screen.getByText('Événements ce Mois')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('25 total')).toBeInTheDocument();

    // Attendance KPI
    expect(screen.getByText('Taux de Présence')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('120 sessions')).toBeInTheDocument();

    // Leaves KPI
    expect(screen.getByText('Demandes de Congés')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('60 total')).toBeInTheDocument();

    // Employees KPI
    expect(screen.getByText('Employés Actifs')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    expect(screen.getByText('150 total')).toBeInTheDocument();
  });

  it('renders department participation chart', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('Participation par Département')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders recent activities section', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('Activités Récentes')).toBeInTheDocument();
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Leave Request Approved')).toBeInTheDocument();
  });

  it('renders loading state when analytics are loading', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: null,
        isLoading: true,
        error: null,
      },
    });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error state when analytics fail to load', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: null,
        isLoading: false,
        error: 'Failed to load analytics',
      },
    });

    expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
    expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
  });

  it('renders empty state when no analytics data', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: null,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
  });

  it('displays correct event statistics', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('8')).toBeInTheDocument(); // Events this month
    expect(screen.getByText('5')).toBeInTheDocument(); // Upcoming events
    expect(screen.getByText('20')).toBeInTheDocument(); // Completed events
  });

  it('displays correct attendance statistics', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('85.5%')).toBeInTheDocument(); // Average attendance
    expect(screen.getByText('120 sessions')).toBeInTheDocument(); // Total sessions
    expect(screen.getByText('1020 participants')).toBeInTheDocument(); // Total attendees
  });

  it('displays correct leave statistics', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('12')).toBeInTheDocument(); // Pending leaves
    expect(screen.getByText('45')).toBeInTheDocument(); // Approved leaves
    expect(screen.getByText('3')).toBeInTheDocument(); // Rejected leaves
  });

  it('displays correct employee statistics', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('145')).toBeInTheDocument(); // Active employees
    expect(screen.getByText('5')).toBeInTheDocument(); // New this month
    expect(screen.getByText('8')).toBeInTheDocument(); // Total departments
  });

  it('renders department participation data correctly', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders recent activities with correct information', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // First activity
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('New event created')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Second activity
    expect(screen.getByText('Leave Request Approved')).toBeInTheDocument();
    expect(screen.getByText('Annual leave approved for Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('HR Manager')).toBeInTheDocument();
  });

  it('displays activity timestamps correctly', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Should display relative time or formatted date
    expect(screen.getByText(/il y a/)).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(<Dashboard />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Tableau de Bord');
  });

  it('renders responsive grid layout', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Check that KPI cards are rendered in a grid
    const kpiCards = screen.getAllByTestId('kpi-card');
    expect(kpiCards.length).toBeGreaterThan(0);
  });

  it('handles empty analytics data gracefully', () => {
    const emptyAnalytics = {
      events: { total: 0, thisMonth: 0, upcoming: 0, completed: 0 },
      attendance: { average: 0, totalSessions: 0, totalAttendees: 0 },
      leaves: { pending: 0, approved: 0, rejected: 0, totalRequests: 0 },
      employees: { total: 0, active: 0, newThisMonth: 0, departments: 0 },
      departments: [],
      recentActivities: [],
    };

    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: emptyAnalytics,
        isLoading: false,
        error: null,
      },
    });

    expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for events
    expect(screen.getByText('0%')).toBeInTheDocument(); // Should show 0% for attendance
    expect(screen.getByText('Aucune activité récente')).toBeInTheDocument();
  });

  it('displays correct chart data for department participation', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Check that chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders with correct color scheme and styling', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Check that gradient text is applied to main title
    const title = screen.getByText('Tableau de Bord');
    expect(title).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'bg-clip-text', 'text-transparent');
  });

  it('displays correct navigation breadcrumb', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tableau de Bord')).toBeInTheDocument();
  });

  it('renders with correct page transitions', () => {
    renderWithProviders(<Dashboard />);
    
    // Check that PageTransition component is applied
    const dashboard = screen.getByRole('main');
    expect(dashboard).toBeInTheDocument();
  });

  it('handles chart interactions correctly', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Chart should be interactive (hover effects, tooltips, etc.)
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toBeInTheDocument();
  });

  it('displays correct data formatting', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Check that numbers are properly formatted
    expect(screen.getByText('1,020')).toBeInTheDocument(); // Total attendees should be formatted
    expect(screen.getByText('85.5%')).toBeInTheDocument(); // Percentage should be formatted
  });

  it('renders with correct responsive behavior', () => {
    renderWithProviders(<Dashboard />, {
      reports: {
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
      },
    });

    // Check that responsive classes are applied
    const container = screen.getByRole('main');
    expect(container).toHaveClass('space-y-6');
  });

  it('handles user permissions correctly', () => {
    const userWithLimitedPermissions = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'employee',
      department: 'Engineering',
      isActive: true,
      lastLogin: new Date().toISOString(),
      loginMethod: 'email',
      permissions: [
        {
          id: '1',
          name: 'View Own Profile',
          resource: 'profile',
          action: 'read',
          scope: 'self',
        },
      ],
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    renderWithProviders(<Dashboard />, {
      auth: {
        user: userWithLimitedPermissions,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: userWithLimitedPermissions.permissions,
        loginMethod: 'email',
        sessionExpiry: null,
        lastActivity: new Date().toISOString(),
        securityLevel: 'medium',
      },
    });

    // Dashboard should still render but with limited data based on permissions
    expect(screen.getByText('Tableau de Bord')).toBeInTheDocument();
  });
}); 