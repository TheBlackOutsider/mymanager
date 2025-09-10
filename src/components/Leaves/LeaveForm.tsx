import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createLeave, updateLeave } from '../../store/slices/leavesSlice';
import { closeModal } from '../../store/slices/uiSlice';
import Button from '../Common/Button';
import { LeaveRequest } from '../../types';

interface LeaveFormProps {
  leave?: LeaveRequest | null;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ leave }) => {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector((state) => state.employees);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'annual' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: '',
    status: 'pending' as LeaveRequest['status'],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (leave) {
      setFormData({
        employeeId: leave.employeeId,
        type: leave.type,
        startDate: leave.startDate.split('T')[0],
        endDate: leave.endDate.split('T')[0],
        reason: leave.reason,
        status: leave.status,
      });
    }
  }, [leave]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leaveData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        createdAt: leave?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (leave) {
        await dispatch(updateLeave({ id: leave.id, leave: leaveData }));
      } else {
        await dispatch(createLeave(leaveData));
      }

      dispatch(closeModal('leaveForm'));
    } catch (error) {
      console.error('Error saving leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee *
          </label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.department}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="special">Special Leave</option>
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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

        {formData.startDate && formData.endDate && (
          <div className="md:col-span-2">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Duration:</strong> {calculateDays()} day(s)
              </p>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason *
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Please provide a reason for your leave request..."
          />
        </div>
      </div>

      {/* Leave Balance Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Leave Balance Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Annual:</span>
            <span className="ml-1 font-medium">15 days</span>
          </div>
          <div>
            <span className="text-gray-500">Sick:</span>
            <span className="ml-1 font-medium">10 days</span>
          </div>
          <div>
            <span className="text-gray-500">Personal:</span>
            <span className="ml-1 font-medium">5 days</span>
          </div>
          <div>
            <span className="text-gray-500">Special:</span>
            <span className="ml-1 font-medium">3 days</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => dispatch(closeModal('leaveForm'))}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {leave ? 'Update Request' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

export default LeaveForm;