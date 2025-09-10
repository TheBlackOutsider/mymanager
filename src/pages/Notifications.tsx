import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Calendar, FileText, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '../store/slices/notificationsSlice';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Notification } from '../types';

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    // Mock user ID - in real app, get from auth context
    dispatch(fetchNotifications('current-user'));
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead('current-user'));
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      event_reminder: Calendar,
      leave_approval: CheckCheck,
      leave_rejection: AlertCircle,
      event_invitation: Users,
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      event_reminder: 'text-blue-600 bg-blue-100',
      leave_approval: 'text-green-600 bg-green-100',
      leave_rejection: 'text-red-600 bg-red-100',
      event_invitation: 'text-purple-600 bg-purple-100',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      userId: 'current-user',
      type: 'event_reminder',
      title: 'Event Reminder',
      message: 'React Best Practices training starts in 1 hour',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'current-user',
      type: 'leave_approval',
      title: 'Leave Request Approved',
      message: 'Your annual leave request for June 15-20 has been approved',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId: 'current-user',
      type: 'event_invitation',
      title: 'Event Invitation',
      message: 'You have been invited to the Team Building event on July 10',
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      userId: 'current-user',
      type: 'leave_rejection',
      title: 'Leave Request Rejected',
      message: 'Your personal leave request has been rejected. Reason: Insufficient notice period',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter && notification.type !== typeFilter) return false;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with events, leave requests, and important announcements
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            icon={CheckCheck}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{mockNotifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockNotifications.filter(n => !n.read).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Read</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockNotifications.filter(n => n.read).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="event_reminder">Event Reminders</option>
            <option value="leave_approval">Leave Approvals</option>
            <option value="leave_rejection">Leave Rejections</option>
            <option value="event_invitation">Event Invitations</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <NotificationIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`mt-1 text-sm ${
                        !notification.read ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;