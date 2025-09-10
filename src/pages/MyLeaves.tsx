import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchLeaves, createLeave, setFilters } from '../store/slices/leavesSlice';
import { openModal } from '../store/slices/uiSlice';
import Button from '../components/Common/Button';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import LeaveForm from '../components/Leaves/LeaveForm';
import { LeaveRequest } from '../types';

const MyLeaves: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leaves, loading, pagination, filters } = useAppSelector((state) => state.leaves);
  const { modals } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  // Filter leaves for current user only
  const myLeaves = leaves.filter(leave => leave.employeeId === user?.id);

  useEffect(() => {
    if (user) {
      dispatch(fetchLeaves({ 
        page: pagination.page, 
        limit: pagination.limit, 
        employeeId: user.id,
        ...filters 
      }));
    }
  }, [dispatch, pagination.page, pagination.limit, filters, user]);

  const handleEdit = (leave: LeaveRequest) => {
    if (leave.status === 'pending') {
      setSelectedLeave(leave);
      dispatch(openModal('leaveForm'));
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-yellow-100 text-yellow-800',
      special: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || colors.annual;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: AlertCircle,
      approved: CheckCircle,
      rejected: XCircle,
    };
    return icons[status as keyof typeof icons] || AlertCircle;
  };

  const columns = [
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeaveTypeColor(value)}`}>
          {value.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'dates',
      title: 'Dates',
      render: (value: any, record: LeaveRequest) => (
        <div className="flex flex-col">
          <div className="text-sm text-gray-900 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
            {format(new Date(record.startDate), 'MMM dd, yyyy')}
          </div>
          <div className="text-sm text-gray-500">
            to {format(new Date(record.endDate), 'MMM dd, yyyy')}
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (value: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => {
        const StatusIcon = getStatusIcon(value);
        return (
          <div className="flex items-center">
            <StatusIcon className="h-4 w-4 mr-2" />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
              {value.toUpperCase()}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Submitted',
      render: (value: string) => (
        <div className="text-sm text-gray-900">
          {format(new Date(value), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: LeaveRequest) => (
        <div className="flex space-x-2">
          {record.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          )}
          {record.status === 'rejected' && record.rejectionReason && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alert(record.rejectionReason)}
              className="text-red-600"
            >
              View Reason
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your leave requests
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setSelectedLeave(null);
            dispatch(openModal('leaveForm'));
          }}
        >
          Request Leave
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myLeaves.filter(l => l.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myLeaves.filter(l => l.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myLeaves.filter(l => l.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{myLeaves.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-500">Annual Leave</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">10</div>
            <div className="text-sm text-gray-500">Sick Leave</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <div className="text-sm text-gray-500">Personal Leave</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-500">Special Leave</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={myLeaves}
        loading={loading}
      />

      {/* Leave Form Modal */}
      <Modal
        isOpen={modals.leaveForm}
        onClose={() => dispatch(openModal('leaveForm'))}
        title={selectedLeave ? 'Edit Leave Request' : 'New Leave Request'}
        size="lg"
      >
        <LeaveForm leave={selectedLeave} />
      </Modal>
    </div>
  );
};

export default MyLeaves;