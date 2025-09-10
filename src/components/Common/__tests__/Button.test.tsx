import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with correct text', () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with default variant', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('renders with outline variant', () => {
    render(<Button {...defaultProps} variant="outline" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-gray-300', 'text-gray-700');
  });

  it('renders with secondary variant', () => {
    render(<Button {...defaultProps} variant="secondary" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600');
  });

  it('renders with danger variant', () => {
    render(<Button {...defaultProps} variant="danger" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button {...defaultProps} size="sm" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Button {...defaultProps} size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('renders with icon', () => {
    const MockIcon = () => <div data-testid="mock-icon">Icon</div>;
    render(<Button {...defaultProps} icon={MockIcon} />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(<Button {...defaultProps} loading={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders with disabled state', () => {
    render(<Button {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('applies custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with full width', () => {
    render(<Button {...defaultProps} fullWidth={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('renders with rounded corners', () => {
    render(<Button {...defaultProps} rounded="full" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
  });

  it('renders with different types', () => {
    render(<Button {...defaultProps} type="submit" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders with aria-label when provided', () => {
    render(<Button {...defaultProps} ariaLabel="Accessible button" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible button');
  });

  it('renders with data attributes', () => {
    render(<Button {...defaultProps} dataTestId="test-button" />);
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
  });

  it('handles keyboard events', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(2);
  });

  it('applies hover effects', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-blue-700');
  });

  it('applies focus effects', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('renders with children as ReactNode', () => {
    render(
      <Button onClick={defaultProps.onClick}>
        <span>Complex</span> <strong>Content</strong>
      </Button>
    );
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('combines multiple props correctly', () => {
    render(
      <Button
        {...defaultProps}
        variant="outline"
        size="lg"
        disabled={true}
        fullWidth={true}
        className="custom-class"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'border-gray-300',
      'text-gray-700',
      'px-6',
      'py-3',
      'text-lg',
      'opacity-50',
      'cursor-not-allowed',
      'w-full',
      'custom-class'
    );
  });
}); 