import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Filter,
  Search,
  Calendar,
  MapPin,
  UserCheck,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchAttendance, fetchAttendanceStats } from '../store/slices/attendanceSlice';
import { fetchEvents } from '../store/slices/eventsSlice';
import { fetchEmployees } from '../store/slices/employeesSlice';
import AttendanceManager from '../components/Events/AttendanceManager';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Attendance as AttendanceType, Event, Employee } from '../types';

const Attendance: React.FC = () => {
  const dispatch = useAppDispatch();
  const { attendance : attendanceData, stats, loading } = useAppSelector((state) => state.attendance);
  const { events } = useAppSelector((state) => state.events);
  const { employees } = useAppSelector((state) => state.employees);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showAttendanceManager, setShowAttendanceManager] = useState(false);
  const [filters, setFilters] = useState({
    eventId: '',
    status: '',
    dateRange: { start: '', end: '' },
    search: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'analytics'>('list');

  useEffect(() => {
    dispatch(fetchEvents({}));
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  useEffect(() => {
    if (filters.eventId) {
      dispatch(fetchAttendance({ eventId: filters.eventId }));
      dispatch(fetchAttendanceStats(filters.eventId));
    }
  }, [dispatch, filters.eventId]);

  const filteredAttendance = attendanceData.filter((att: AttendanceType) => {
    if (filters.status && att.status !== filters.status) return false;
    if (filters.search) {
      const employee = employees.find(emp => emp.id === att.employeeId);
      if (!employee?.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      registered: 'bg-blue-100 text-blue-800 border-blue-200',
      present: 'bg-green-100 text-green-800 border-green-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
      late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      left_early: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[status as keyof typeof colors] || colors.registered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      case 'left_early': return <Clock className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64"
      >
        <LoadingSpinner size="lg" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header avec animations */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage employee attendance across all events
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => {
              if (filters.eventId) {
                dispatch(fetchAttendance({ eventId: filters.eventId }));
                dispatch(fetchAttendanceStats(filters.eventId));
              }
            }}
          >
            Refresh
          </Button>
          <Button
            icon={Download}
            onClick={() => {
              // Export functionality
              console.log('Export attendance data');
            }}
          >
            Export
          </Button>
        </div>
      </motion.div>

      {/* Filtres avec design moderne */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.eventId}
              onChange={(e) => setFilters(prev => ({ ...prev, eventId: e.target.value }))}
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="left_early">Left Early</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Employees
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </motion.div>

      {/* Mode de vue avec onglets animés */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'list', label: 'List View', icon: Users },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  viewMode === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="inline h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: 'Total Registered', value: stats.totalRegistered, icon: Users, color: 'blue' },
                      { label: 'Present', value: stats.totalPresent, icon: CheckCircle, color: 'green' },
                      { label: 'Absent', value: stats.totalAbsent, icon: XCircle, color: 'red' },
                      { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: TrendingUp, color: 'purple' }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        variants={cardVariants}
                        whileHover="hover"
                        className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200 rounded-xl p-6 shadow-sm`}
                      >
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg bg-${stat.color}-500 bg-opacity-20`}>
                            <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Attendance Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                    AttendanceType Records ({filteredAttendance.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
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
                        <AnimatePresence>
                          {filteredAttendance.map((att, index) => {
                            const employee = employees.find(emp => emp.id === att.employeeId);
                            const event = events.find(evt => evt.id === att.eventId);
                            
                            return (
                              <motion.tr
                                key={att.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                        <span className="text-sm font-medium text-white">
                                          {employee?.name?.charAt(0) || '?'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {employee?.name || 'Unknown'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {employee?.department || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{event?.title || 'Unknown Event'}</div>
                                  <div className="text-sm text-gray-500">
                                    {event?.startDate && format(new Date(event.startDate), 'MMM dd, yyyy')}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(att.status)}`}>
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedEvent(event || null);
                                      setShowAttendanceManager(true);
                                    }}
                                  >
                                    Manage
                                  </Button>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-500">Calendar view coming soon...</p>
              </motion.div>
            )}

            {viewMode === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics View</h3>
                <p className="text-gray-500">Advanced analytics coming soon...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal d'Attendance Manager */}
      <AnimatePresence>
        {showAttendanceManager && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <AttendanceManager
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                onClose={() => {
                  setShowAttendanceManager(false);
                  setSelectedEvent(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Attendance; 