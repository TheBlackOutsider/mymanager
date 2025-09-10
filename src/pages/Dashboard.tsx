import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchAnalytics } from '../store/slices/reportsSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { analytics, loading } = useAppSelector((state) => state.reports);
  const { employees } = useAppSelector((state) => state.employees);
  const { events } = useAppSelector((state) => state.events);
  const { leaves } = useAppSelector((state) => state.leaves);

  useEffect(() => {
    dispatch(fetchAnalytics({}));
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Active Events',
      value: events.filter(e => e.status === 'published').length,
      icon: Calendar,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Pending Leaves',
      value: leaves.filter(l => l.status === 'pending').length,
      icon: FileText,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      change: '-3%',
      changeType: 'negative',
    },
    {
      name: 'Attendance Rate',
      value: `${analytics.attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      change: '+2%',
      changeType: 'positive',
    },
  ];

  const eventsData = [
    { month: 'Jan', events: 12, attendance: 85 },
    { month: 'Feb', events: 15, attendance: 88 },
    { month: 'Mar', events: 18, attendance: 92 },
    { month: 'Apr', events: 14, attendance: 87 },
    { month: 'May', events: 20, attendance: 94 },
    { month: 'Jun', events: 16, attendance: 89 },
  ];

  const leaveTypeData = [
    { name: 'Annual', value: 45, color: '#3B82F6' },
    { name: 'Sick', value: 25, color: '#EF4444' },
    { name: 'Personal', value: 20, color: '#F59E0B' },
    { name: 'Special', value: 10, color: '#10B981' },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'leave_approved',
      message: 'John Doe\'s annual leave request approved',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'event_created',
      message: 'New training event "React Best Practices" created',
      time: '4 hours ago',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'leave_rejected',
      message: 'Sarah Smith\'s personal leave request rejected',
      time: '6 hours ago',
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      id: 4,
      type: 'leave_pending',
      message: 'Mike Johnson submitted sick leave request',
      time: '8 hours ago',
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
  ];

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
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening in your organization.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          {/* Events & Attendance Chart */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Events & Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#3B82F6" name="Events" />
                <Bar dataKey="attendance" fill="#10B981" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Leave Types Distribution */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div 
          className="bg-white shadow-lg rounded-xl border border-gray-100"
          variants={itemVariants}
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="px-6 py-4 flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <div className={`flex-shrink-0 ${activity.color}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default Dashboard;