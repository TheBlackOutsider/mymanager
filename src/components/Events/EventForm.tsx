import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createEvent, updateEvent } from '../../store/slices/eventsSlice';
import { closeModal } from '../../store/slices/uiSlice';
import Button from '../Common/Button';
import { Event } from '../../types';

interface EventFormProps {
  event?: Event | null;
}

const EventForm: React.FC<EventFormProps> = ({ event }) => {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector((state) => state.employees);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'training' as Event['type'],
    startDate: '',
    endDate: '',
    location: '',
    organizer: '',
    attendees: [] as string[],
    maxAttendees: '',
    isRecurring: false,
    recurrencePattern: '',
    status: 'draft' as Event['status'],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        type: event.type,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        location: event.location,
        organizer: event.organizer,
        attendees: event.attendees,
        maxAttendees: event.maxAttendees?.toString() || '',
        isRecurring: event.isRecurring,
        recurrencePattern: event.recurrencePattern || '',
        status: event.status,
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAttendeeChange = (employeeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      attendees: checked
        ? [...prev.attendees, employeeId]
        : prev.attendees.filter(id => id !== employeeId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        createdAt: event?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (event) {
        await dispatch(updateEvent({ id: event.id, event: eventData }));
      } else {
        await dispatch(createEvent(eventData));
      }

      dispatch(closeModal('eventForm'));
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter event title"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter event description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="training">Training</option>
            <option value="seminar">Seminar</option>
            <option value="onboarding">Onboarding</option>
            <option value="team_building">Team Building</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter event location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizer *
          </label>
          <input
            type="text"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter organizer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Attendees
          </label>
          <input
            type="number"
            name="maxAttendees"
            value={formData.maxAttendees}
            onChange={handleChange}
            min="1"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Recurring Event
          </label>
        </div>

        {formData.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurrence Pattern
            </label>
            <select
              name="recurrencePattern"
              value={formData.recurrencePattern}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select pattern</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
      </div>

      {/* Attendees Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attendees
        </label>
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.attendees.includes(employee.id)}
                onChange={(e) => handleAttendeeChange(employee.id, e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {employee.name} - {employee.department}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => dispatch(closeModal('eventForm'))}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;