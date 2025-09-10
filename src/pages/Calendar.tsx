import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Filter, View, Edit, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isSameMonth as isSameMonthFn } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchEvents } from '../store/slices/eventsSlice';
import { fetchLeaves } from '../store/slices/leavesSlice';
import { openModal } from '../store/slices/uiSlice';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';
import { Event } from '../types';

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, loading: eventsLoading } = useAppSelector((state) => state.events);
  const { leaves, loading: leavesLoading } = useAppSelector((state) => state.leaves);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    eventTypes: [] as string[],
    leaveTypes: [] as string[],
    departments: [] as string[],
  });

  useEffect(() => {
    dispatch(fetchEvents({}));
    dispatch(fetchLeaves({}));
  }, [dispatch]);

  const loading = eventsLoading || leavesLoading;

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startDate), date) || 
      isSameDay(new Date(event.endDate), date) ||
      (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
    );
  };

  const getLeavesForDate = (date: Date) => {
    return leaves.filter(leave => 
      isSameDay(new Date(leave.startDate), date) || 
      isSameDay(new Date(leave.endDate), date) ||
      (new Date(leave.startDate) <= date && new Date(leave.endDate) >= date)
    );
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      training: 'bg-blue-500',
      seminar: 'bg-green-500',
      onboarding: 'bg-purple-500',
      team_building: 'bg-orange-500',
      other: 'bg-gray-500',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-yellow-500',
      sick: 'bg-red-500',
      personal: 'bg-pink-500',
      special: 'bg-indigo-500',
    };
    return colors[type as keyof typeof colors] || colors.annual;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const calendarVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
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
              Calendar View
            </h1>
            <p className="mt-2 text-gray-600">
              Visualize events, leaves, and schedules in an interactive calendar
          </p>
        </div>
        <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'month' ? 'week' : viewMode === 'week' ? 'day' : 'month')}
            >
              {viewMode === 'month' ? 'Week View' : viewMode === 'week' ? 'Day View' : 'Month View'}
            </Button>
          <Button
            icon={Plus}
            onClick={() => dispatch(openModal('eventForm'))}
          >
            New Event
          </Button>
        </div>
        </motion.div>

        {/* Calendar Controls */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                icon={ChevronLeft}
                onClick={prevMonth}
              />
              <Button
                variant="outline"
                icon={ChevronRight}
                onClick={nextMonth}
              />
              <Button
                variant="outline"
                onClick={goToToday}
              >
                Today
              </Button>
      </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                icon={Filter}
                onClick={() => {
                  // Toggle filters
                  console.log('Toggle filters');
                }}
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Events</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Leaves</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Today</span>
            </div>
        </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div 
          variants={calendarVariants}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <motion.div
                key={day}
                className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {day}
              </motion.div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const dayLeaves = getLeavesForDate(day);
              const isCurrentMonth = isSameMonthFn(day, currentDate);
              const isCurrentDay = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <motion.div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 relative ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isCurrentDay ? 'bg-blue-50' : ''} ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  } hover:bg-gray-50 transition-colors cursor-pointer`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(day)}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isCurrentDay ? 'text-blue-600 font-bold' : ''}`}>
                    {format(day, 'd')}
          </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <motion.div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate text-white ${getEventTypeColor(event.type)}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + eventIndex * 0.1, duration: 0.3 }}
                        title={event.title}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
        </div>
                    )}
      </div>

                  {/* Leaves */}
                  <div className="space-y-1 mt-1">
                    {dayLeaves.slice(0, 2).map((leave, leaveIndex) => (
                      <motion.div
                        key={leave.id}
                        className={`text-xs p-1 rounded truncate text-white ${getLeaveTypeColor(leave.type)}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + leaveIndex * 0.1 + 0.2, duration: 0.3 }}
                        title={`${leave.employee?.name} - ${leave.type}`}
                      >
                        {leave.employee?.name?.split(' ')[0]} - {leave.type}
                      </motion.div>
                    ))}
                    {dayLeaves.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayLeaves.length - 2} more
          </div>
                    )}
          </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Date Details */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(null)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Events */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Events ({getEventsForDate(selectedDate).length})
                  </h4>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event) => (
                      <motion.div
                        key={event.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-blue-900">{event.title}</h5>
                            <p className="text-sm text-blue-700 line-clamp-2">{event.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </span>
              </div>
              </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={View}
                              onClick={() => console.log('View event:', event.id)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Edit}
                              onClick={() => console.log('Edit event:', event.id)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {getEventsForDate(selectedDate).length === 0 && (
                      <p className="text-gray-500 text-sm">No events scheduled for this date.</p>
                    )}
              </div>
            </div>
            
                {/* Leaves */}
            <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-yellow-500" />
                    Leave Requests ({getLeavesForDate(selectedDate).length})
                  </h4>
                  <div className="space-y-3">
                    {getLeavesForDate(selectedDate).map((leave) => (
                      <motion.div
                        key={leave.id}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-yellow-900">
                              {leave.employee?.name || 'Unknown Employee'}
                            </h5>
                            <p className="text-sm text-yellow-700 line-clamp-2">{leave.reason}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-yellow-600">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {leave.status.toUpperCase()}
              </span>
            </div>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={View}
                              onClick={() => console.log('View leave:', leave.id)}
                            />
              <Button
                              size="sm"
                              variant="outline"
                              icon={Edit}
                              onClick={() => console.log('Edit leave:', leave.id)}
                            />
            </div>
          </div>
                      </motion.div>
                    ))}
                    {getLeavesForDate(selectedDate).length === 0 && (
                      <p className="text-gray-500 text-sm">No leave requests for this date.</p>
        )}
                  </div>
                </div>
    </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
};

export default Calendar;