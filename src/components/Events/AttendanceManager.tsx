import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, UserCheck, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchAttendance, fetchAttendanceStats, checkIn, checkOut, updateAttendanceStatus } from '../../store/slices/attendanceSlice';
import { Attendance, AttendanceStats } from '../../types';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

interface AttendanceManagerProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ eventId, eventTitle, onClose }) => {
  const dispatch = useAppDispatch();
  const { attendance, stats, loading } = useAppSelector((state) => state.attendance);
  const { employees } = useAppSelector((state) => state.employees);
  
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    dispatch(fetchAttendance({ eventId }));
    dispatch(fetchAttendanceStats(eventId));
  }, [dispatch, eventId]);

  const handleCheckIn = async (attendanceId: string) => {
    const now = new Date().toISOString();
    await dispatch(checkIn({ attendanceId, checkInTime: now }));
  };

  const handleCheckOut = async (attendanceId: string) => {
    const now = new Date().toISOString();
    await dispatch(checkOut({ attendanceId, checkOutTime: now }));
  };

  const handleStatusUpdate = async (attendanceId: string, status: string) => {
    await dispatch(updateAttendanceStatus({ attendanceId, status, notes: statusNotes }));
    setShowStatusModal(false);
    setStatusNotes('');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      registered: 'bg-gray-100 text-gray-800',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      left_early: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || colors.registered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'left_early':
        return <Clock className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attendance Management</h2>
          <p className="text-sm text-gray-500">{eventTitle}</p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Registered</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRegistered}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Present</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPresent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Absent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAbsent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registered Attendees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((att) => {
                const employee = employees.find(emp => emp.id === att.employeeId);
                return (
                  <tr key={att.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {employee?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{employee?.department || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(att.status)}`}>
                        {getStatusIcon(att.status)}
                        <span className="ml-1 capitalize">{att.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.checkIn ? format(new Date(att.checkIn), 'HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.checkOut ? format(new Date(att.checkOut), 'HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!att.checkIn && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCheckIn(att.id)}
                          >
                            Check In
                          </Button>
                        )}
                        {att.checkIn && !att.checkOut && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCheckOut(att.id)}
                          >
                            Check Out
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAttendance(att);
                            setShowStatusModal(true);
                          }}
                        >
                          Update Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedAttendance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Attendance Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setSelectedAttendance({ ...selectedAttendance, status: e.target.value as any })}
                    value={selectedAttendance.status}
                  >
                    <option value="registered">Registered</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="left_early">Left Early</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add any notes about this attendance..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedAttendance.id, selectedAttendance.status)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager; 