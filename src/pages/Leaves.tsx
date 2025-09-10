import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchLeaves, approveLeave, rejectLeave, deleteLeave } from '../store/slices/leavesSlice';
import { openModal } from '../store/slices/uiSlice';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';
import { LeaveRequest } from '../types';

const Leaves: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leaves, loading, pagination } = useAppSelector((state) => state.leaves);
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    employeeId: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(fetchLeaves({}));
  }, [dispatch]);

  const handleApprove = async (leaveId: string) => {
    await dispatch(approveLeave({ id: leaveId, approvedBy: 'current_user' }));
  };

  const handleReject = async (leaveId: string, reason: string) => {
    await dispatch(rejectLeave({ id: leaveId, rejectionReason: reason, rejectedBy: 'current_user' }));
    setShowActionModal(false);
    setRejectionReason('');
  };

  const handleDelete = async (leaveId: string) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      await dispatch(deleteLeave(leaveId));
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filters.search && !leave.employee?.name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type && leave.type !== filters.type) return false;
    if (filters.status && leave.status !== filters.status) return false;
    return true;
  });

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800 border-blue-200',
      sick: 'bg-red-100 text-red-800 border-red-200',
      personal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      special: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
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
              Leave Management
            </h1>
            <p className="mt-2 text-gray-600">
              Review and manage employee leave requests and approvals
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
              variant="outline"
              icon={Download}
          onClick={() => {
                // Export leaves
                console.log('Export leaves');
              }}
            >
              Export
            </Button>
            <Button
              icon={Plus}
              onClick={() => dispatch(openModal('leaveForm'))}
        >
          New Leave Request
        </Button>
      </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">All Types</option>
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
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={filters.employeeId}
                onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
              >
                <option value="">All Employees</option>
                {/* Employee options would be populated from state */}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Requests', value: leaves.length, icon: Calendar, color: 'blue' },
            { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, icon: AlertCircle, color: 'yellow' },
            { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, icon: CheckCircle, color: 'green' },
            { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, icon: XCircle, color: 'red' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200 rounded-xl p-6 shadow-sm`}
              variants={cardVariants}
              whileHover="hover"
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
        </motion.div>

        {/* Leaves Grid/List */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Leave Requests ({filteredLeaves.length})
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
                {filteredLeaves.map((leave, index) => (
                  <motion.div
                    key={leave.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    variants={cardVariants}
                    whileHover="hover"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="p-6">
                      {/* Employee Info */}
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
        </div>
            </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {leave.employee?.name || 'Unknown Employee'}
                          </h3>
                          <p className="text-sm text-gray-600">{leave.employee?.department || 'N/A'}</p>
            </div>
          </div>

                      {/* Leave Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          {leave.startDate !== leave.endDate && (
                            <span> - {format(new Date(leave.endDate), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
        </div>
      </div>

                      {/* Tags */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLeaveTypeColor(leave.type)}`}>
                          {leave.type.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                          {getStatusIcon(leave.status)}
                          <span className="ml-1">{leave.status.toUpperCase()}</span>
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <strong>Reason:</strong> {leave.reason}
                        </p>
          </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => {
                            setSelectedLeave(leave);
                            // View leave details
                            console.log('View leave:', leave.id);
                          }}
                        >
                          View
                        </Button>
                        
                        {leave.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={CheckCircle}
                              onClick={() => {
                                setSelectedLeave(leave);
                                setActionType('approve');
                                setShowActionModal(true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={XCircle}
                              onClick={() => {
                                setSelectedLeave(leave);
                                setActionType('reject');
                                setShowActionModal(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Edit}
                          onClick={() => {
                            // Edit leave
                            console.log('Edit leave:', leave.id);
                          }}
                        >
                          Edit
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDelete(leave.id)}
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
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Details
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
                      {filteredLeaves.map((leave, index) => (
                        <motion.tr
                          key={leave.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {leave.employee?.name || 'Unknown Employee'}
                                </div>
                                <div className="text-sm text-gray-500">{leave.employee?.department || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                              {leave.startDate !== leave.endDate && (
                                <span> - {format(new Date(leave.endDate), 'MMM dd, yyyy')}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">{leave.reason}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLeaveTypeColor(leave.type)}`}>
                              {leave.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                              {getStatusIcon(leave.status)}
                              <span className="ml-1">{leave.status.toUpperCase()}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Eye}
                                onClick={() => console.log('View leave:', leave.id)}
                              >
                                View
                              </Button>
                              
                              {leave.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    icon={CheckCircle}
                                    onClick={() => handleApprove(leave.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    icon={XCircle}
                                    onClick={() => {
                                      setSelectedLeave(leave);
                                      setActionType('reject');
                                      setShowActionModal(true);
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
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

        {/* Action Modal */}
        <AnimatePresence>
          {showActionModal && selectedLeave && (
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
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h3>
                
                {actionType === 'reject' && (
                  <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
              />
            </div>
          )}
                
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
                    onClick={() => setShowActionModal(false)}
            >
              Cancel
            </Button>
            <Button
                    variant={actionType === 'approve' ? 'primary' : 'danger'}
                    onClick={() => {
                      if (actionType === 'approve') {
                        handleApprove(selectedLeave.id);
                      } else {
                        handleReject(selectedLeave.id, rejectionReason);
                      }
                    }}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
};

export default Leaves;