import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import authReducer from '../../../store/slices/authSlice';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        permissions: [],
        loginMethod: null,
        sessionExpiry: null,
        lastActivity: new Date().toISOString(),
        securityLevel: 'low',
        ...initialState,
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

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with logo and title', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('HRlead')).toBeInTheDocument();
    expect(screen.getByText('Gestion RH & Événements')).toBeInTheDocument();
  });

  it('renders navigation menu when user is authenticated', () => {
    const initialState = {
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
    };

    renderWithProviders(<Header />, initialState);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employés')).toBeInTheDocument();
    expect(screen.getByText('Événements')).toBeInTheDocument();
    expect(screen.getByText('Congés')).toBeInTheDocument();
    expect(screen.getByText('Présence')).toBeInTheDocument();
    expect(screen.getByText('Rapports')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Calendrier')).toBeInTheDocument();
    expect(screen.getByText('Départements')).toBeInTheDocument();
    expect(screen.getByText('Quotas')).toBeInTheDocument();
  });

  it('does not render navigation menu when user is not authenticated', () => {
    renderWithProviders(<Header />);
    
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Employés')).not.toBeInTheDocument();
    expect(screen.queryByText('Événements')).not.toBeInTheDocument();
  });

  it('renders user profile section when authenticated', () => {
    const initialState = {
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
    };

    renderWithProviders(<Header />, initialState);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('HR Officer')).toBeInTheDocument();
  });

  it('renders user avatar when available', () => {
    const initialState = {
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
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isAuthenticated: true,
    };

    renderWithProviders(<Header />, initialState);
    
    const avatar = screen.getByAltText('Avatar de John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders default avatar when no avatar is provided', () => {
    const initialState = {
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
    };

    renderWithProviders(<Header />, initialState);
    
    const defaultAvatar = screen.getByText('JD');
    expect(defaultAvatar).toBeInTheDocument();
  });

  it('renders user role correctly', () => {
    const initialState = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'manager',
        department: 'Engineering',
        isActive: true,
        lastLogin: new Date().toISOString(),
        loginMethod: 'email',
        permissions: [],
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isAuthenticated: true,
    };

    renderWithProviders(<Header />, initialState);
    
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders department information', () => {
    const initialState = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'hr_officer',
        department: 'Human Resources',
        isActive: true,
        lastLogin: new Date().toISOString(),
        loginMethod: 'email',
        permissions: [],
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isAuthenticated: true,
    };

    renderWithProviders(<Header />, initialState);
    
    expect(screen.getByText('Human Resources')).toBeInTheDocument();
  });

  it('renders login method indicator', () => {
    const initialState = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'hr_officer',
        department: 'HR',
        isActive: true,
        lastLogin: new Date().toISOString(),
        loginMethod: 'ldap',
        permissions: [],
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isAuthenticated: true,
    };

    renderWithProviders(<Header />, initialState);
    
    expect(screen.getByText('LDAP')).toBeInTheDocument();
  });

  it('renders security level indicator', () => {
    const initialState = {
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
      securityLevel: 'high',
    };

    renderWithProviders(<Header />, initialState);
    
    expect(screen.getByText('Sécurité: Élevée')).toBeInTheDocument();
  });

  it('renders different security levels correctly', () => {
    const { rerender } = renderWithProviders(<Header />, {
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
      securityLevel: 'medium',
    });

    expect(screen.getByText('Sécurité: Moyenne')).toBeInTheDocument();

    rerender(
      <Provider store={createMockStore({
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
        securityLevel: 'critical',
      })}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Sécurité: Critique')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    const initialState = {
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
    };

    renderWithProviders(<Header />, initialState);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const employeesLink = screen.getByText('Employés').closest('a');
    const eventsLink = screen.getByText('Événements').closest('a');
    
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(employeesLink).toHaveAttribute('href', '/employees');
    expect(eventsLink).toHaveAttribute('href', '/events');
  });

  it('renders mobile menu toggle button', () => {
    const initialState = {
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
    };

    renderWithProviders(<Header />, initialState);
    
    const mobileMenuButton = screen.getByLabelText('Ouvrir le menu mobile');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    const initialState = {
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
    };

    renderWithProviders(<Header />, initialState);
    
    const mobileMenuButton = screen.getByLabelText('Ouvrir le menu mobile');
    fireEvent.click(mobileMenuButton);
    
    // The mobile menu should now be visible
    expect(screen.getByLabelText('Fermer le menu mobile')).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  it('renders loading state when auth is loading', () => {
    renderWithProviders(<Header />, { isLoading: true });
    
    // Should show loading indicator or skeleton
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error state when auth has error', () => {
    renderWithProviders(<Header />, { 
      error: 'Erreur d\'authentification',
      isAuthenticated: false 
    });
    
    expect(screen.getByText('Erreur d\'authentification')).toBeInTheDocument();
  });
}); 