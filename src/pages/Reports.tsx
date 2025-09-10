import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, Users, Clock, Filter, RefreshCw, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchAnalytics, generateReport, exportReport } from '../store/slices/reportsSlice';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const { analytics, reports, loading } = useAppSelector((state) => state.reports);
  const { employees } = useAppSelector((state) => state.employees);
  const { events } = useAppSelector((state) => state.events);
  const { leaves } = useAppSelector((state) => state.leaves);

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [reportType, setReportType] = useState('comprehensive');
  const [viewMode, setViewMode] = useState<'charts' | 'tables'>('charts');

  useEffect(() => {
    dispatch(fetchAnalytics(dateRange));
  }, [dispatch, dateRange]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    await dispatch(generateReport({ 
      type: reportType, 
      startDate: dateRange.start, 
      endDate: dateRange.end 
    }));
  };

  // Mock data for charts
  const eventsPerMonth = [
    { month: 'Jan', events: 12, attendance: 85, participation: 78 },
    { month: 'Feb', events: 15, attendance: 88, participation: 82 },
    { month: 'Mar', events: 18, attendance: 92, participation: 85 },
    { month: 'Apr', events: 14, attendance: 87, participation: 80 },
    { month: 'May', events: 20, attendance: 94, participation: 88 },
    { month: 'Jun', events: 16, attendance: 89, participation: 84 },
  ];

  const leaveTypeData = [
    { name: 'Annual', value: 45, color: '#3B82F6' },
    { name: 'Sick', value: 25, color: '#EF4444' },
    { name: 'Personal', value: 20, color: '#F59E0B' },
    { name: 'Special', value: 10, color: '#10B981' },
  ];

  const departmentEventData = [
    { department: 'Engineering', events: 25, participation: 92 },
    { department: 'Marketing', events: 18, participation: 88 },
    { department: 'Sales', events: 22, participation: 85 },
    { department: 'HR', events: 15, participation: 95 },
    { department: 'Finance', events: 12, participation: 82 },
  ];

  const attendanceTrend = [
    { month: 'Jan', rate: 85 },
    { month: 'Feb', rate: 88 },
    { month: 'Mar', rate: 92 },
    { month: 'Apr', rate: 87 },
    { month: 'May', rate: 94 },
    { month: 'Jun', rate: 89 },
  ];

  const kpiCards = [
    {
      title: 'Total Events',
      value: events.length,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      title: 'Average Attendance',
      value: '89%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
    },
    {
      title: 'Participation Rate',
      value: '84%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    },
    {
      title: 'Avg. Event Duration',
      value: '2.5h',
      change: '-10%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
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
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive insights into events, attendance, and leave patterns
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'charts' ? 'tables' : 'charts')}
            >
              {viewMode === 'charts' ? 'Table View' : 'Chart View'}
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              icon={FileText}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Date Range Filter */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Report Parameters</h3>
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={() => dispatch(fetchAnalytics(dateRange))}
            >
              Refresh Data
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="events">Events Only</option>
                <option value="leaves">Leaves Only</option>
                <option value="attendance">Attendance Only</option>
              </select>
            </div>
            <div className="pt-6">
              <Button
                variant="secondary"
                onClick={() => dispatch(fetchAnalytics(dateRange))}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`${kpi.color} p-3 rounded-xl shadow-lg`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <p className={`ml-2 text-sm font-semibold ${
                        kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <AnimatePresence mode="wait">
          {viewMode === 'charts' ? (
            <motion.div
              key="charts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Events & Attendance Chart */}
              <motion.div 
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                variants={cardVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Events & Attendance Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventsPerMonth}>
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
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                variants={cardVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Leave Types Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Department Participation */}
              <motion.div 
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                variants={cardVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Department Event Participation
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentEventData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="participation" fill="#8B5CF6" name="Participation %" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Attendance Trend */}
              <motion.div 
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                variants={cardVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Attendance Rate Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="Attendance Rate %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="tables"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary Table */}
              <motion.div 
                className="bg-white rounded-xl shadow-lg border border-gray-100"
                variants={cardVariants}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Monthly Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Events
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participation Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Requests
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {eventsPerMonth.map((month, index) => (
                        <motion.tr
                          key={month.month}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {month.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.events}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.attendance}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.participation}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.floor(Math.random() * 20) + 5}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Department Performance Table */}
              <motion.div 
                className="bg-white rounded-xl shadow-lg border border-gray-100"
                variants={cardVariants}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Department Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Events Hosted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participation Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departmentEventData.map((dept, index) => (
                        <motion.tr
                          key={dept.department}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dept.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dept.events}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dept.participation}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Eye}
                              onClick={() => console.log('View department details:', dept.department)}
                            >
                              View Details
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
};

export default Reports;