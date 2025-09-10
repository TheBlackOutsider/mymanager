import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar, MapPin, Users, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchEvents, deleteEvent } from '../store/slices/eventsSlice';
import { openModal } from '../store/slices/uiSlice';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';
import { Event } from '../types';

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, loading, pagination } = useAppSelector((state) => state.events);
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateRange: { start: '', end: '' }
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchEvents({}));
  }, [dispatch]);

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await dispatch(deleteEvent(eventId));
    }
  };

  const filteredEvents = events.filter(event => {
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type && event.type !== filters.type) return false;
    if (filters.status && event.status !== filters.status) return false;
    return true;
  });

  const getEventTypeColor = (type: string) => {
    const colors = {
      training: 'bg-blue-100 text-blue-800 border-blue-200',
      seminar: 'bg-green-100 text-green-800 border-green-200',
      onboarding: 'bg-purple-100 text-purple-800 border-purple-200',
      team_building: 'bg-orange-100 text-orange-800 border-orange-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Events Management
            </h1>
            <p className="mt-2 text-gray-600">
              Create and manage HR events, training sessions, and team activities
          </p>
        </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
        <Button
          icon={Plus}
              onClick={() => dispatch(openModal('eventForm'))}
        >
              New Event
        </Button>
      </div>
        </motion.div>

      {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
          <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
            value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
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
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
            value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
                <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
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
          </div>
        </motion.div>

        {/* Events Grid/List */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Events ({filteredEvents.length})
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    variants={cardVariants}
                    whileHover="hover"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {event.description}
                          </p>
        </div>
      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(event.startDate), 'MMM dd, yyyy')}
                          {event.startDate !== event.endDate && (
                            <span> - {format(new Date(event.endDate), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {event.location}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          {event.attendees.length} attendees
                          {event.maxAttendees && ` / ${event.maxAttendees} max`}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                          {event.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
        size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => {
                            // View event details
                            console.log('View event:', event.id);
                          }}
                        >
                          View
                        </Button>
            <Button
                          size="sm"
                          variant="outline"
                          icon={Edit}
                          onClick={() => {
                            // Edit event
                            console.log('Edit event:', event.id);
                          }}
            >
                          Edit
            </Button>
            <Button
                          size="sm"
              variant="danger"
                          icon={Trash2}
                          onClick={() => handleDelete(event.id)}
            >
              Delete
            </Button>
          </div>
        </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEvents.map((event, index) => (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2">{event.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{format(new Date(event.startDate), 'MMM dd, yyyy')}</div>
                            <div className="text-gray-500">{format(new Date(event.startDate), 'HH:mm')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                              {event.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                              {event.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Eye}
                                onClick={() => console.log('View event:', event.id)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Edit}
                                onClick={() => console.log('Edit event:', event.id)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                icon={Trash2}
                                onClick={() => handleDelete(event.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
    </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default Events;