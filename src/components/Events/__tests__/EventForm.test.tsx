import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EventForm from '../EventForm';
import eventsReducer from '../../../store/slices/eventsSlice';
import authReducer from '../../../store/slices/authSlice';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      events: eventsReducer,
      auth: authReducer,
    },
    preloadedState: {
      events: {
        events: [],
        isLoading: false,
        error: null,
        ...initialState.events,
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

describe('EventForm Component', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    initialData: undefined,
    isEditing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    expect(screen.getByLabelText('Titre *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    expect(screen.getByLabelText('Type *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date de début *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date de fin *')).toBeInTheDocument();
    expect(screen.getByLabelText('Lieu *')).toBeInTheDocument();
    expect(screen.getByLabelText('Organisateur *')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre maximum de participants')).toBeInTheDocument();
  });

  it('renders form in create mode by default', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    expect(screen.getByText('Créer un Événement')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
  });

  it('renders form in edit mode when isEditing is true', () => {
    renderWithProviders(<EventForm {...defaultProps} isEditing={true} />);
    
    expect(screen.getByText('Modifier l\'Événement')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
  });

  it('populates form with initial data when editing', () => {
    const initialData = {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team meeting',
      type: 'meeting',
      startDate: '2024-01-01T09:00:00Z',
      endDate: '2024-01-01T10:00:00Z',
      location: 'Conference Room A',
      organizer: 'John Doe',
      maxAttendees: 10,
      isRecurring: false,
      recurrencePattern: null,
    };

    renderWithProviders(<EventForm {...defaultProps} initialData={initialData} isEditing={true} />);
    
    expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Weekly team meeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('meeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Conference Room A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('shows recurring event options when isRecurring is checked', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    const recurringCheckbox = screen.getByLabelText('Événement récurrent');
    fireEvent.click(recurringCheckbox);
    
    expect(screen.getByLabelText('Motif de récurrence')).toBeInTheDocument();
    expect(screen.getByLabelText('Fin de la récurrence')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
      expect(screen.getByText('La description est requise')).toBeInTheDocument();
      expect(screen.getByText('Le type est requis')).toBeInTheDocument();
      expect(screen.getByText('La date de début est requise')).toBeInTheDocument();
      expect(screen.getByText('La date de fin est requise')).toBeInTheDocument();
      expect(screen.getByText('Le lieu est requis')).toBeInTheDocument();
      expect(screen.getByText('L\'organisateur est requis')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('validates date logic (end date must be after start date)', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'meeting' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'Test Organizer' } });
    
    // Set invalid dates (end before start)
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-02T10:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T09:00' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('La date de fin doit être après la date de début')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('validates max attendees is positive number', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'meeting' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'Test Organizer' } });
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T10:00' } });
    
    // Set invalid max attendees
    fireEvent.change(screen.getByLabelText('Nombre maximum de participants'), { target: { value: '-5' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Le nombre maximum de participants doit être positif')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'meeting' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'Test Organizer' } });
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T10:00' } });
    fireEvent.change(screen.getByLabelText('Nombre maximum de participants'), { target: { value: '20' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: 'Test Event',
        description: 'Test Description',
        type: 'meeting',
        startDate: '2024-01-01T09:00',
        endDate: '2024-01-01T10:00',
        location: 'Test Location',
        organizer: 'Test Organizer',
        maxAttendees: 20,
        isRecurring: false,
        recurrencePattern: null,
      });
    });
  });

  it('submits form with recurring event data', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Recurring Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'training' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'Test Organizer' } });
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T10:00' } });
    fireEvent.change(screen.getByLabelText('Nombre maximum de participants'), { target: { value: '15' } });
    
    // Enable recurring event
    const recurringCheckbox = screen.getByLabelText('Événement récurrent');
    fireEvent.click(recurringCheckbox);
    
    // Set recurrence pattern
    fireEvent.change(screen.getByLabelText('Motif de récurrence'), { target: { value: 'weekly' } });
    fireEvent.change(screen.getByLabelText('Fin de la récurrence'), { target: { value: '2024-03-01' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: 'Recurring Event',
        description: 'Test Description',
        type: 'training',
        startDate: '2024-01-01T09:00',
        endDate: '2024-01-01T10:00',
        location: 'Test Location',
        organizer: 'Test Organizer',
        maxAttendees: 15,
        isRecurring: true,
        recurrencePattern: {
          frequency: 'weekly',
          endDate: '2024-03-01',
        },
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Annuler' });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('handles form reset correctly', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Fill in some fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    
    // Reset form
    const resetButton = screen.getByRole('button', { name: 'Réinitialiser' });
    fireEvent.click(resetButton);
    
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    const mockOnSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<EventForm {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'meeting' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'Test Organizer' } });
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T10:00' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Création...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles form validation errors gracefully', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Should show validation errors but not crash
      expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
    });
    
    // Form should still be functional
    expect(screen.getByLabelText('Titre *')).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Check form labels and inputs
    const titleInput = screen.getByLabelText('Titre *');
    expect(titleInput).toHaveAttribute('required');
    
    const descriptionTextarea = screen.getByLabelText('Description *');
    expect(descriptionTextarea).toHaveAttribute('required');
    
    // Check form role
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });

  it('handles different event types correctly', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    const typeSelect = screen.getByLabelText('Type *');
    
    // Check available options
    expect(screen.getByText('Réunion')).toBeInTheDocument();
    expect(screen.getByText('Formation')).toBeInTheDocument();
    expect(screen.getByText('Séminaire')).toBeInTheDocument();
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Team Building')).toBeInTheDocument();
  });

  it('validates email format for organizer when email is provided', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'meeting' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T10:00' } });
    
    // Set invalid email format
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Format d\'email invalide')).toBeInTheDocument();
    });
  });

  it('handles timezone selection correctly', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    // Check if timezone selector is present
    expect(screen.getByLabelText('Fuseau horaire')).toBeInTheDocument();
    
    // Should default to local timezone
    const timezoneSelect = screen.getByLabelText('Fuseau horaire');
    expect(timezoneSelect).toHaveValue('local');
  });

  it('shows character count for description field', () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    const descriptionTextarea = screen.getByLabelText('Description *');
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description with some text' } });
    
    // Should show character count
    expect(screen.getByText('32/500 caractères')).toBeInTheDocument();
  });

  it('prevents submission when description is too long', async () => {
    renderWithProviders(<EventForm {...defaultProps} />);
    
    const longDescription = 'a'.repeat(501); // Exceeds 500 character limit
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Titre *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: longDescription } });
    fireEvent.change(screen.getByLabelText('Type *'), { target: { value: 'meeting' } });
    fireEvent.change(screen.getByLabelText('Lieu *'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Organisateur *'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Date de début *'), { target: { value: '2024-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Date de fin *'), { target: { value: '2024-01-01T10:00' } });
    
    const submitButton = screen.getByRole('button', { name: 'Créer' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('La description ne peut pas dépasser 500 caractères')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
}); 