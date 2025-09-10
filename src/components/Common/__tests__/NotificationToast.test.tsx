import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationToast from '../NotificationToast';

describe('NotificationToast Component', () => {
  const defaultProps = {
    id: '1',
    type: 'success' as const,
    title: 'Succès',
    message: 'Opération réussie',
    duration: 5000,
    onClose: jest.fn(),
    onAction: jest.fn(),
    actionLabel: 'Voir',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders notification with correct content', () => {
    render(<NotificationToast {...defaultProps} />);
    
    expect(screen.getByText('Succès')).toBeInTheDocument();
    expect(screen.getByText('Opération réussie')).toBeInTheDocument();
  });

  it('renders with correct type styling', () => {
    const { rerender } = render(<NotificationToast {...defaultProps} />);
    
    // Success type
    let notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-green-50', 'border-green-200');
    
    // Error type
    rerender(<NotificationToast {...defaultProps} type="error" />);
    notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-red-50', 'border-red-200');
    
    // Warning type
    rerender(<NotificationToast {...defaultProps} type="warning" />);
    notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-yellow-50', 'border-yellow-200');
    
    // Info type
    rerender(<NotificationToast {...defaultProps} type="info" />);
    notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('renders with correct icon based on type', () => {
    const { rerender } = render(<NotificationToast {...defaultProps} />);
    
    // Success icon
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    
    // Error icon
    rerender(<NotificationToast {...defaultProps} type="error" />);
    expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    
    // Warning icon
    rerender(<NotificationToast {...defaultProps} type="warning" />);
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    
    // Info icon
    rerender(<NotificationToast {...defaultProps} type="info" />);
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('renders action button when actionLabel is provided', () => {
    render(<NotificationToast {...defaultProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Voir' });
    expect(actionButton).toBeInTheDocument();
  });

  it('does not render action button when actionLabel is not provided', () => {
    render(<NotificationToast {...defaultProps} actionLabel={undefined} />);
    
    expect(screen.queryByRole('button', { name: 'Voir' })).not.toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', () => {
    render(<NotificationToast {...defaultProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Voir' });
    fireEvent.click(actionButton);
    
    expect(defaultProps.onAction).toHaveBeenCalledWith('1');
  });

  it('renders close button', () => {
    render(<NotificationToast {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Fermer la notification');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<NotificationToast {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Fermer la notification');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('auto-closes after specified duration', async () => {
    render(<NotificationToast {...defaultProps} duration={3000} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledWith('1');
    });
  });

  it('does not auto-close when duration is 0', () => {
    render(<NotificationToast {...defaultProps} duration={0} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(10000);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('pauses auto-close on hover', () => {
    render(<NotificationToast {...defaultProps} duration={3000} />);
    
    const notification = screen.getByRole('alert');
    
    // Hover to pause
    fireEvent.mouseEnter(notification);
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    // Should not auto-close while hovering
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    // Leave hover
    fireEvent.mouseLeave(notification);
    
    // Should auto-close after leaving
    jest.advanceTimersByTime(3000);
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('resumes auto-close after leaving hover', () => {
    render(<NotificationToast {...defaultProps} duration={5000} />);
    
    const notification = screen.getByRole('alert');
    
    // Hover for 2 seconds
    fireEvent.mouseEnter(notification);
    jest.advanceTimersByTime(2000);
    
    // Leave hover
    fireEvent.mouseLeave(notification);
    
    // Should auto-close after remaining duration
    jest.advanceTimersByTime(3000);
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('handles keyboard events correctly', () => {
    render(<NotificationToast {...defaultProps} />);
    
    const notification = screen.getByRole('alert');
    
    // Enter key should trigger action
    fireEvent.keyDown(notification, { key: 'Enter' });
    expect(defaultProps.onAction).toHaveBeenCalledWith('1');
    
    // Escape key should close
    fireEvent.keyDown(notification, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('renders with correct accessibility attributes', () => {
    render(<NotificationToast {...defaultProps} />);
    
    const notification = screen.getByRole('alert');
    expect(notification).toHaveAttribute('aria-live', 'polite');
    expect(notification).toHaveAttribute('aria-atomic', 'true');
    
    // Check close button accessibility
    const closeButton = screen.getByLabelText('Fermer la notification');
    expect(closeButton).toHaveAttribute('aria-label', 'Fermer la notification');
  });

  it('handles long titles and messages gracefully', () => {
    const longTitle = 'A'.repeat(100);
    const longMessage = 'B'.repeat(200);
    
    render(<NotificationToast {...defaultProps} title={longTitle} message={longMessage} />);
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longMessage)).toBeInTheDocument();
    
    // Should not overflow or break layout
    const notification = screen.getByRole('alert');
    expect(notification).toBeInTheDocument();
  });

  it('handles HTML content in message safely', () => {
    const htmlMessage = '<script>alert("xss")</script>Message with <strong>HTML</strong>';
    
    render(<NotificationToast {...defaultProps} message={htmlMessage} />);
    
    // Should escape HTML and show as plain text
    expect(screen.getByText(htmlMessage)).toBeInTheDocument();
    expect(screen.queryByText('Message with HTML')).not.toBeInTheDocument();
  });

  it('handles multiple notifications without conflicts', () => {
    const { rerender } = render(<NotificationToast {...defaultProps} />);
    
    // First notification
    expect(screen.getByText('Succès')).toBeInTheDocument();
    
    // Second notification
    rerender(<NotificationToast {...defaultProps} id="2" title="Autre notification" />);
    
    expect(screen.getByText('Autre notification')).toBeInTheDocument();
  });

  it('handles notification updates correctly', () => {
    const { rerender } = render(<NotificationToast {...defaultProps} />);
    
    // Initial state
    expect(screen.getByText('Succès')).toBeInTheDocument();
    
    // Update notification
    rerender(<NotificationToast {...defaultProps} title="Titre mis à jour" message="Message mis à jour" />);
    
    expect(screen.getByText('Titre mis à jour')).toBeInTheDocument();
    expect(screen.getByText('Message mis à jour')).toBeInTheDocument();
  });

  it('handles edge case durations', () => {
    // Very short duration
    render(<NotificationToast {...defaultProps} duration={100} />);
    
    jest.advanceTimersByTime(100);
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('handles very long durations', () => {
    render(<NotificationToast {...defaultProps} duration={300000} />); // 5 minutes
    
    // Fast-forward 1 minute
    jest.advanceTimersByTime(60000);
    
    // Should not close yet
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    // Fast-forward to duration
    jest.advanceTimersByTime(240000);
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('handles notification without title', () => {
    render(<NotificationToast {...defaultProps} title={undefined} />);
    
    // Should still render message
    expect(screen.getByText('Opération réussie')).toBeInTheDocument();
    
    // Should not crash without title
    const notification = screen.getByRole('alert');
    expect(notification).toBeInTheDocument();
  });

  it('handles notification without message', () => {
    render(<NotificationToast {...defaultProps} message={undefined} />);
    
    // Should still render title
    expect(screen.getByText('Succès')).toBeInTheDocument();
    
    // Should not crash without message
    const notification = screen.getByRole('alert');
    expect(notification).toBeInTheDocument();
  });

  it('handles notification with only title and message', () => {
    render(<NotificationToast {...defaultProps} actionLabel={undefined} />);
    
    // Should render basic notification
    expect(screen.getByText('Succès')).toBeInTheDocument();
    expect(screen.getByText('Opération réussie')).toBeInTheDocument();
    
    // Should not have action button
    expect(screen.queryByRole('button', { name: 'Voir' })).not.toBeInTheDocument();
  });

  it('handles click outside to close when enabled', () => {
    render(<NotificationToast {...defaultProps} closeOnClickOutside={true} />);
    
    // Click outside notification
    fireEvent.click(document.body);
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('1');
  });

  it('does not close on click outside when disabled', () => {
    render(<NotificationToast {...defaultProps} closeOnClickOutside={false} />);
    
    // Click outside notification
    fireEvent.click(document.body);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('handles notification with custom styling', () => {
    render(<NotificationToast {...defaultProps} className="custom-notification" />);
    
    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('custom-notification');
  });

  it('handles notification with custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
    
    render(<NotificationToast {...defaultProps} icon={CustomIcon} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('handles notification with progress bar', () => {
    render(<NotificationToast {...defaultProps} showProgress={true} duration={5000} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // Progress should decrease over time
    jest.advanceTimersByTime(2500);
    
    // Should show 50% progress
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('handles notification with sound', () => {
    const mockPlay = jest.fn();
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      writable: true,
      value: mockPlay,
    });
    
    render(<NotificationToast {...defaultProps} playSound={true} />);
    
    // Should attempt to play sound
    expect(mockPlay).toHaveBeenCalled();
  });

  it('handles notification with vibration', () => {
    const mockVibrate = jest.fn();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: mockVibrate,
    });
    
    render(<NotificationToast {...defaultProps} vibrate={true} />);
    
    // Should attempt to vibrate
    expect(mockVibrate).toHaveBeenCalled();
  });
}); 