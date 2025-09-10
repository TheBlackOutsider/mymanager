import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../Table';

describe('Table Component', () => {
  const mockColumns = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Département', sortable: false },
    { key: 'role', label: 'Rôle', sortable: true },
  ];

  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', department: 'HR', role: 'hr_officer' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Engineering', role: 'developer' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', role: 'manager' },
  ];

  const defaultProps = {
    columns: mockColumns,
    data: mockData,
    onSort: jest.fn(),
    onRowClick: jest.fn(),
    onSelectionChange: jest.fn(),
    selectable: false,
    sortable: true,
    loading: false,
    emptyMessage: 'Aucune donnée disponible',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with correct structure', () => {
    render(<Table {...defaultProps} />);
    
    // Check table element
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check headers
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Département')).toBeInTheDocument();
    expect(screen.getByText('Rôle')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<Table {...defaultProps} />);
    
    // Check data rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('hr_officer')).toBeInTheDocument();
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('developer')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<Table {...defaultProps} data={[]} />);
    
    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<Table {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('handles sorting when column is clicked', () => {
    render(<Table {...defaultProps} />);
    
    const nameHeader = screen.getByText('Nom');
    fireEvent.click(nameHeader);
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('toggles sort direction on repeated clicks', () => {
    render(<Table {...defaultProps} />);
    
    const nameHeader = screen.getByText('Nom');
    
    // First click - ascending
    fireEvent.click(nameHeader);
    expect(defaultProps.onSort).toHaveBeenCalledWith('name', 'asc');
    
    // Second click - descending
    fireEvent.click(nameHeader);
    expect(defaultProps.onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('does not allow sorting on non-sortable columns', () => {
    render(<Table {...defaultProps} />);
    
    const departmentHeader = screen.getByText('Département');
    fireEvent.click(departmentHeader);
    
    expect(defaultProps.onSort).not.toHaveBeenCalled();
  });

  it('handles row clicks when onRowClick is provided', () => {
    render(<Table {...defaultProps} />);
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(defaultProps.onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('shows sort indicators on sortable columns', () => {
    render(<Table {...defaultProps} />);
    
    const nameHeader = screen.getByText('Nom');
    expect(nameHeader).toHaveClass('cursor-pointer');
    
    const departmentHeader = screen.getByText('Département');
    expect(departmentHeader).not.toHaveClass('cursor-pointer');
  });

  it('handles selectable rows when selectable is true', () => {
    render(<Table {...defaultProps} selectable={true} />);
    
    // Check for select all checkbox
    expect(screen.getByLabelText('Sélectionner tout')).toBeInTheDocument();
    
    // Check for individual row checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockData.length + 1); // +1 for select all
  });

  it('handles select all functionality', () => {
    render(<Table {...defaultProps} selectable={true} />);
    
    const selectAllCheckbox = screen.getByLabelText('Sélectionner tout');
    fireEvent.click(selectAllCheckbox);
    
    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(mockData.map(item => item.id));
  });

  it('handles individual row selection', () => {
    render(<Table {...defaultProps} selectable={true} />);
    
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]; // Skip select all
    fireEvent.click(firstRowCheckbox);
    
    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([mockData[0].id]);
  });

  it('updates select all state when all rows are selected', () => {
    render(<Table {...defaultProps} selectable={true} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const individualCheckboxes = checkboxes.slice(1); // Skip select all
    
    // Select all individual rows
    individualCheckboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    // Select all should be checked
    const selectAllCheckbox = screen.getByLabelText('Sélectionner tout') as HTMLInputElement;
    expect(selectAllCheckbox.checked).toBe(true);
  });

  it('handles partial selection state', () => {
    render(<Table {...defaultProps} selectable={true} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const firstRowCheckbox = checkboxes[1]; // Skip select all
    
    // Select only first row
    fireEvent.click(firstRowCheckbox);
    
    // Select all should be indeterminate
    const selectAllCheckbox = screen.getByLabelText('Sélectionner tout') as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });

  it('renders with custom empty message', () => {
    const customMessage = 'Aucun employé trouvé';
    render(<Table {...defaultProps} data={[]} emptyMessage={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('handles custom cell renderers', () => {
    const customColumns = [
      { key: 'name', label: 'Nom', sortable: true },
      { 
        key: 'status', 
        label: 'Statut', 
        sortable: false,
        render: (value: string) => (
          <span className={`status-${value}`}>{value}</span>
        )
      },
    ];

    const customData = [
      { id: '1', name: 'John Doe', status: 'active' },
      { id: '2', name: 'Jane Smith', status: 'inactive' },
    ];

    render(<Table {...defaultProps} columns={customColumns} data={customData} />);
    
    expect(screen.getByText('active')).toHaveClass('status-active');
    expect(screen.getByText('inactive')).toHaveClass('status-inactive');
  });

  it('handles pagination when provided', () => {
    const paginationProps = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: jest.fn(),
      totalItems: 50,
      itemsPerPage: 10,
    };

    render(<Table {...defaultProps} pagination={paginationProps} />);
    
    expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument();
    expect(screen.getByText('50 éléments au total')).toBeInTheDocument();
    
    // Check pagination buttons
    expect(screen.getByLabelText('Page précédente')).toBeInTheDocument();
    expect(screen.getByLabelText('Page suivante')).toBeInTheDocument();
  });

  it('handles page navigation', () => {
    const paginationProps = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: jest.fn(),
      totalItems: 50,
      itemsPerPage: 10,
    };

    render(<Table {...defaultProps} pagination={paginationProps} />);
    
    const nextButton = screen.getByLabelText('Page suivante');
    fireEvent.click(nextButton);
    
    expect(paginationProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables pagination buttons appropriately', () => {
    const paginationProps = {
      currentPage: 1,
      totalPages: 1,
      onPageChange: jest.fn(),
      totalItems: 10,
      itemsPerPage: 10,
    };

    render(<Table {...defaultProps} pagination={paginationProps} />);
    
    const prevButton = screen.getByLabelText('Page précédente');
    const nextButton = screen.getByLabelText('Page suivante');
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('handles search functionality when provided', () => {
    const searchProps = {
      value: '',
      onChange: jest.fn(),
      placeholder: 'Rechercher...',
    };

    render(<Table {...defaultProps} search={searchProps} />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(searchProps.onChange).toHaveBeenCalledWith('John');
  });

  it('handles filters when provided', () => {
    const filterProps = {
      filters: [
        { key: 'department', label: 'Département', options: ['HR', 'Engineering', 'Sales'] },
        { key: 'role', label: 'Rôle', options: ['hr_officer', 'developer', 'manager'] },
      ],
      activeFilters: {},
      onFilterChange: jest.fn(),
    };

    render(<Table {...defaultProps} filters={filterProps} />);
    
    expect(screen.getByText('Filtres')).toBeInTheDocument();
    expect(screen.getByText('Département')).toBeInTheDocument();
    expect(screen.getByText('Rôle')).toBeInTheDocument();
  });

  it('applies active filters to data', () => {
    const filterProps = {
      filters: [
        { key: 'department', label: 'Département', options: ['HR', 'Engineering', 'Sales'] },
      ],
      activeFilters: { department: 'HR' },
      onFilterChange: jest.fn(),
    };

    render(<Table {...defaultProps} filters={filterProps} />);
    
    // Should only show HR department data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('handles bulk actions when provided', () => {
    const bulkActions = [
      { label: 'Supprimer', action: jest.fn(), variant: 'danger' },
      { label: 'Exporter', action: jest.fn(), variant: 'outline' },
    ];

    render(<Table {...defaultProps} selectable={true} bulkActions={bulkActions} />);
    
    // Select a row first
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstRowCheckbox);
    
    // Bulk actions should be visible
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
    expect(screen.getByText('Exporter')).toBeInTheDocument();
  });

  it('executes bulk actions on selected items', () => {
    const bulkActions = [
      { label: 'Supprimer', action: jest.fn(), variant: 'danger' },
    ];

    render(<Table {...defaultProps} selectable={true} bulkActions={bulkActions} />);
    
    // Select a row
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstRowCheckbox);
    
    // Execute bulk action
    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);
    
    expect(bulkActions[0].action).toHaveBeenCalledWith([mockData[0].id]);
  });

  it('handles keyboard navigation', () => {
    render(<Table {...defaultProps} />);
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    
    // Focus on first row
    fireEvent.focus(firstRow!);
    
    // Navigate with arrow keys
    fireEvent.keyDown(firstRow!, { key: 'ArrowDown' });
    fireEvent.keyDown(firstRow!, { key: 'ArrowUp' });
    fireEvent.keyDown(firstRow!, { key: 'Enter' });
    
    // Should handle navigation and selection
    expect(defaultProps.onRowClick).toHaveBeenCalled();
  });

  it('renders with correct accessibility attributes', () => {
    render(<Table {...defaultProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Tableau de données');
    
    // Check row headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(mockColumns.length);
    
    // Check data rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(mockData.length + 1); // +1 for header row
  });

  it('handles responsive behavior correctly', () => {
    render(<Table {...defaultProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full', 'overflow-x-auto');
  });

  it('applies custom CSS classes when provided', () => {
    render(<Table {...defaultProps} className="custom-table" />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('custom-table');
  });

  it('handles data updates correctly', () => {
    const { rerender } = render(<Table {...defaultProps} />);
    
    // Initial data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Update data
    const newData = [
      { id: '1', name: 'Updated John', email: 'john@example.com', department: 'HR', role: 'hr_officer' },
    ];
    
    rerender(<Table {...defaultProps} data={newData} />);
    
    expect(screen.getByText('Updated John')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('handles column reordering when drag and drop is enabled', () => {
    const reorderableProps = {
      ...defaultProps,
      reorderable: true,
      onColumnReorder: jest.fn(),
    };

    render(<Table {...reorderableProps} />);
    
    // Check for drag handles
    const dragHandles = screen.getAllByLabelText('Réorganiser la colonne');
    expect(dragHandles).toHaveLength(mockColumns.length);
  });

  it('handles export functionality when provided', () => {
    const exportProps = {
      onExport: jest.fn(),
      formats: ['csv', 'pdf', 'excel'],
    };

    render(<Table {...defaultProps} export={exportProps} />);
    
    expect(screen.getByText('Exporter')).toBeInTheDocument();
    
    const exportButton = screen.getByText('Exporter');
    fireEvent.click(exportButton);
    
    // Should show export format options
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
  });

  it('handles print functionality when provided', () => {
    const printProps = {
      onPrint: jest.fn(),
      title: 'Tableau des employés',
    };

    render(<Table {...defaultProps} print={printProps} />);
    
    const printButton = screen.getByLabelText('Imprimer le tableau');
    expect(printButton).toBeInTheDocument();
    
    fireEvent.click(printButton);
    expect(printProps.onPrint).toHaveBeenCalled();
  });
}); 