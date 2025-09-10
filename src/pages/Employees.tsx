import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Mail, Phone, MapPin, Building, User, Edit, Trash2, Eye, Download } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchEmployees, deleteEmployee } from '../store/slices/employeesSlice';
import { openModal } from '../store/slices/uiSlice';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';
import { Employee } from '../types';

const Employees: React.FC = () => {
  const dispatch = useAppDispatch();
  const { employees, loading, pagination } = useAppSelector((state) => state.employees);
  
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    role: '',
    seniority: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  const handleDelete = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await dispatch(deleteEmployee(employeeId));
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (filters.search && !employee.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.department && employee.department !== filters.department) return false;
    if (filters.role && employee.role !== filters.role) return false;
    if (filters.seniority && employee.seniority !== filters.seniority) return false;
    return true;
  });

  const getRoleColor = (role: string) => {
    const colors = {
      employee: 'bg-blue-100 text-blue-800 border-blue-200',
      manager: 'bg-green-100 text-green-800 border-green-200',
      hr_officer: 'bg-purple-100 text-purple-800 border-purple-200',
      hr_head: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSeniorityColor = (seniority: string) => {
    const colors = {
      junior: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      mid: 'bg-blue-100 text-blue-800 border-blue-200',
      senior: 'bg-green-100 text-green-800 border-green-200',
      lead: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[seniority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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
              Employee Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your organization's workforce, roles, and departments
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
                // Export employees
                console.log('Export employees');
              }}
            >
              Export
            </Button>
            <Button
              icon={Plus}
              onClick={() => dispatch(openModal('employeeForm'))}
        >
              New Employee
        </Button>
      </div>
        </motion.div>

      {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employees
              </label>
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
          <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
            value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
          </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
          <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
            value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr_officer">HR Officer</option>
                <option value="hr_head">HR Head</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seniority
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={filters.seniority}
                onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.value }))}
              >
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
          </select>
            </div>
          </div>
        </motion.div>

        {/* Employees Grid/List */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Employees ({filteredEmployees.length})
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
                {filteredEmployees.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    variants={cardVariants}
                    whileHover="hover"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="p-6">
                      {/* Avatar and Basic Info */}
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                          {employee.avatar ? (
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                              <User className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.email}</p>
        </div>
      </div>

                      {/* Employee Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          {employee.department}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {employee.role.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(employee.role)}`}>
                          {employee.role.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeniorityColor(employee.seniority)}`}>
                          {employee.seniority.toUpperCase()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
        size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => {
                            // View employee details
                            console.log('View employee:', employee.id);
                          }}
                        >
                          View
                        </Button>
            <Button
                          size="sm"
                          variant="outline"
                          icon={Edit}
                          onClick={() => {
                            // Edit employee
                            console.log('Edit employee:', employee.id);
                          }}
            >
                          Edit
            </Button>
            <Button
                          size="sm"
              variant="danger"
                          icon={Trash2}
                          onClick={() => handleDelete(employee.id)}
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
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seniority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {employee.avatar ? (
                                  <img
                                    src={employee.avatar}
                                    alt={employee.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-1" />
                              {employee.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(employee.role)}`}>
                              {employee.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeniorityColor(employee.seniority)}`}>
                              {employee.seniority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Eye}
                                onClick={() => console.log('View employee:', employee.id)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={Edit}
                                onClick={() => console.log('Edit employee:', employee.id)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                icon={Trash2}
                                onClick={() => handleDelete(employee.id)}
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

export default Employees;