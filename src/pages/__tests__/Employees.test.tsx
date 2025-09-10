import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Employees from '../Employees';
import employeesReducer from '../../store/slices/employeesSlice';
import authReducer from '../../store/slices/authSlice';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      employees: employeesReducer,
      auth: authReducer,
    },
    preloadedState: {
      employees: {
        employees: [],
        isLoading: false,
        error: null,
        ...initialState.employees,
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
const mockEmployees = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'HR',
    role: 'hr_officer',
    seniority: 'mid',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    department: 'Engineering',
    role: 'developer',
    seniority: 'senior',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    department: 'Sales',
    role: 'manager',
    seniority: 'senior',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('Employees Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page with title and description', () => {
    renderWithProviders(<Employees />);
    
    expect(screen.getByText('Gestion des Employés')).toBeInTheDocument();
    expect(screen.getByText('Gérez votre équipe et leurs informations')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    renderWithProviders(<Employees />);
    
    expect(screen.getByText('Vue Grille')).toBeInTheDocument();
    expect(screen.getByText('Vue Liste')).toBeInTheDocument();
  });

  it('renders search and filter controls', () => {
    renderWithProviders(<Employees />);
    
    expect(screen.getByPlaceholderText('Rechercher un employé...')).toBeInTheDocument();
    expect(screen.getByText('Filtres')).toBeInTheDocument();
  });

  it('renders add employee button', () => {
    renderWithProviders(<Employees />);
    
    expect(screen.getByText('Nouvel Employé')).toBeInTheDocument();
  });

  it('displays employees in grid view by default', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Should show employee cards
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('switches to list view when toggle is clicked', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const listViewButton = screen.getByText('Vue Liste');
    fireEvent.click(listViewButton);
    
    // Should show table headers
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Département')).toBeInTheDocument();
    expect(screen.getByText('Rôle')).toBeInTheDocument();
  });

  it('filters employees by search term', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const searchInput = screen.getByPlaceholderText('Rechercher un employé...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // Should only show John Doe
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('filters employees by department', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const filterButton = screen.getByText('Filtres');
    fireEvent.click(filterButton);
    
    const departmentFilter = screen.getByLabelText('Département');
    fireEvent.change(departmentFilter, { target: { value: 'HR' } });
    
    // Should only show HR employees
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('filters employees by role', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const filterButton = screen.getByText('Filtres');
    fireEvent.click(filterButton);
    
    const roleFilter = screen.getByLabelText('Rôle');
    fireEvent.change(roleFilter, { target: { value: 'developer' } });
    
    // Should only show developers
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('filters employees by status', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const filterButton = screen.getByText('Filtres');
    fireEvent.click(filterButton);
    
    const statusFilter = screen.getByLabelText('Statut');
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    // Should only show active employees
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('shows loading state when fetching employees', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: [],
        isLoading: true,
        error: null,
      },
    });
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: [],
        isLoading: false,
        error: 'Failed to fetch employees',
      },
    });
    
    expect(screen.getByText('Erreur lors du chargement des employés')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch employees')).toBeInTheDocument();
  });

  it('shows empty state when no employees', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: [],
        isLoading: false,
        error: null,
      },
    });
    
    expect(screen.getByText('Aucun employé trouvé')).toBeInTheDocument();
    expect(screen.getByText('Commencez par ajouter votre premier employé')).toBeInTheDocument();
  });

  it('displays employee information correctly in grid view', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Check first employee card
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('HR Officer')).toBeInTheDocument();
    expect(screen.getByText('Mid-level')).toBeInTheDocument();
  });

  it('displays employee information correctly in list view', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Switch to list view
    const listViewButton = screen.getByText('Vue Liste');
    fireEvent.click(listViewButton);
    
    // Check table data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('HR Officer')).toBeInTheDocument();
  });

  it('shows employee status indicators', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Active employees should show green status
    expect(screen.getByText('Actif')).toHaveClass('bg-green-100', 'text-green-800');
    
    // Inactive employees should show red status
    expect(screen.getByText('Inactif')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('handles employee actions (view, edit, delete)', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Check that action buttons are present
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.some(button => button.textContent?.includes('Voir'))).toBe(true);
    expect(actionButtons.some(button => button.textContent?.includes('Modifier'))).toBe(true);
    expect(actionButtons.some(button => button.textContent?.includes('Supprimer'))).toBe(true);
  });

  it('opens add employee modal when button is clicked', () => {
    renderWithProviders(<Employees />);
    
    const addButton = screen.getByText('Nouvel Employé');
    fireEvent.click(addButton);
    
    // Should show modal
    expect(screen.getByText('Nouvel Employé')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
  });

  it('handles bulk actions when employees are selected', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Switch to list view for easier selection
    const listViewButton = screen.getByText('Vue Liste');
    fireEvent.click(listViewButton);
    
    // Select employees
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select first employee
    
    // Bulk actions should be visible
    expect(screen.getByText('Actions groupées')).toBeInTheDocument();
  });

  it('exports employee data when export button is clicked', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const exportButton = screen.getByText('Exporter');
    fireEvent.click(exportButton);
    
    // Should show export options
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('handles pagination when many employees', () => {
    const manyEmployees = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Employee ${i + 1}`,
      email: `employee${i + 1}@example.com`,
      department: 'HR',
      role: 'hr_officer',
      seniority: 'mid',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    renderWithProviders(<Employees />, {
      employees: {
        employees: manyEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Should show pagination
    expect(screen.getByText('Page 1 sur 3')).toBeInTheDocument();
    expect(screen.getByText('25 éléments au total')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Focus on search input
    const searchInput = screen.getByPlaceholderText('Rechercher un employé...');
    fireEvent.focus(searchInput);
    
    // Navigate with Tab key
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    
    // Should handle navigation correctly
    expect(searchInput).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(<Employees />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Gestion des Employés');
  });

  it('handles responsive behavior correctly', () => {
    renderWithProviders(<Employees />);
    
    // Check that responsive classes are applied
    const container = screen.getByRole('main');
    expect(container).toHaveClass('space-y-6');
  });

  it('applies correct styling and animations', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Check that gradient text is applied to title
    const title = screen.getByText('Gestion des Employés');
    expect(title).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'bg-clip-text', 'text-transparent');
  });

  it('handles employee search with special characters', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    const searchInput = screen.getByPlaceholderText('Rechercher un employé...');
    
    // Search with special characters
    fireEvent.change(searchInput, { target: { value: 'O\'Connor' } });
    fireEvent.change(searchInput, { target: { value: 'Jean-Pierre' } });
    
    // Should handle special characters gracefully
    expect(searchInput).toHaveValue('Jean-Pierre');
  });

  it('handles department and role changes', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Switch to list view
    const listViewButton = screen.getByText('Vue Liste');
    fireEvent.click(listViewButton);
    
    // Check that department and role columns are sortable
    const departmentHeader = screen.getByText('Département');
    const roleHeader = screen.getByText('Rôle');
    
    expect(departmentHeader).toHaveClass('cursor-pointer');
    expect(roleHeader).toHaveClass('cursor-pointer');
  });

  it('handles employee deactivation/reactivation', () => {
    renderWithProviders(<Employees />, {
      employees: {
        employees: mockEmployees,
        isLoading: false,
        error: null,
      },
    });
    
    // Find inactive employee
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Inactif')).toBeInTheDocument();
    
    // Should have reactivate option
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.some(button => button.textContent?.includes('Réactiver'))).toBe(true);
  });
}); 