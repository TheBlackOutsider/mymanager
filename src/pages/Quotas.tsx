import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Download,
  Plus,
  Edit,
  Eye,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';

// Mock data pour les quotas
const mockQuotas = [
  {
    id: '1',
    employeeId: '1',
    employee: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Ressources Humaines',
      role: 'hr_officer'
    },
    year: 2024,
    leaveQuotas: [
      { id: '1', type: 'annual', totalDays: 25, usedDays: 15, remainingDays: 10, expiresAt: '2024-12-31' },
      { id: '2', type: 'sick', totalDays: 10, usedDays: 3, remainingDays: 7, expiresAt: '2024-12-31' },
      { id: '3', type: 'personal', totalDays: 5, usedDays: 1, remainingDays: 4, expiresAt: '2024-12-31' }
    ],
    eventQuotas: [
      { id: '1', type: 'training', maxEvents: 8, attendedEvents: 5, remainingEvents: 3 },
      { id: '2', type: 'seminar', maxEvents: 4, attendedEvents: 2, remainingEvents: 2 },
      { id: '3', type: 'conference', maxEvents: 2, attendedEvents: 1, remainingEvents: 1 }
    ],
    trainingQuotas: [
      { id: '1', type: 'mandatory', requiredHours: 40, completedHours: 32, remainingHours: 8, deadline: '2024-06-30' },
      { id: '2', type: 'optional', requiredHours: 20, completedHours: 15, remainingHours: 5, deadline: '2024-12-31' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    employeeId: '2',
    employee: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Développement',
      role: 'manager'
    },
    year: 2024,
    leaveQuotas: [
      { id: '4', type: 'annual', totalDays: 30, usedDays: 20, remainingDays: 10, expiresAt: '2024-12-31' },
      { id: '5', type: 'sick', totalDays: 10, usedDays: 2, remainingDays: 8, expiresAt: '2024-12-31' },
      { id: '6', type: 'personal', totalDays: 5, usedDays: 2, remainingDays: 3, expiresAt: '2024-12-31' }
    ],
    eventQuotas: [
      { id: '4', type: 'training', maxEvents: 10, attendedEvents: 7, remainingEvents: 3 },
      { id: '5', type: 'seminar', maxEvents: 6, attendedEvents: 4, remainingEvents: 2 },
      { id: '6', type: 'conference', maxEvents: 3, attendedEvents: 2, remainingEvents: 1 }
    ],
    trainingQuotas: [
      { id: '3', type: 'mandatory', requiredHours: 50, completedHours: 45, remainingHours: 5, deadline: '2024-06-30' },
      { id: '4', type: 'certification', requiredHours: 80, completedHours: 60, remainingHours: 20, deadline: '2024-09-30' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const Quotas: React.FC = () => {
  const [quotas, setQuotas] = useState(mockQuotas);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'analytics'>('cards');
  const [selectedQuota, setSelectedQuota] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    year: '2024'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      }
    },
  };

  const handleQuotaAction = (type: 'view' | 'edit' | 'create', quota?: any) => {
    setModalType(type);
    setSelectedQuota(quota);
    setShowModal(true);
  };

  const getQuotaStatus = (quota: any) => {
    const leaveUtilization = quota.leaveQuotas.reduce((acc: number, lq: any) => 
      acc + (lq.usedDays / lq.totalDays), 0) / quota.leaveQuotas.length;
    
    const eventUtilization = quota.eventQuotas.reduce((acc: number, eq: any) => 
      acc + (eq.attendedEvents / eq.maxEvents), 0) / quota.eventQuotas.length;
    
    const trainingUtilization = quota.trainingQuotas.reduce((acc: number, tq: any) => 
      acc + (tq.completedHours / tq.requiredHours), 0) / quota.trainingQuotas.length;
    
    const overallUtilization = (leaveUtilization + eventUtilization + trainingUtilization) / 3;
    
    if (overallUtilization >= 0.8) return { status: 'high', color: 'text-green-600', bg: 'bg-green-100' };
    if (overallUtilization >= 0.6) return { status: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getLeaveUtilization = (leaveQuota: any) => {
    return Math.round((leaveQuota.usedDays / leaveQuota.totalDays) * 100);
  };

  const getEventUtilization = (eventQuota: any) => {
    return Math.round((eventQuota.attendedEvents / eventQuota.maxEvents) * 100);
  };

  const getTrainingUtilization = (trainingQuota: any) => {
    return Math.round((trainingQuota.completedHours / trainingQuota.requiredHours) * 100);
  };

  const renderQuotaCard = (quota: any) => {
    const status = getQuotaStatus(quota);
    
    return (
      <motion.div
        key={quota.id}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{quota.employee.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                {status.status === 'high' ? 'Élevé' : status.status === 'medium' ? 'Moyen' : 'Faible'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{quota.employee.department}</p>
            <p className="text-sm text-gray-500">{quota.employee.role}</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{quota.year}</div>
            <div className="text-sm text-gray-500">Année</div>
          </div>
        </div>

        {/* Leave Quotas */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quotas de Congés
          </h4>
          <div className="space-y-2">
            {quota.leaveQuotas.map((lq: any) => (
              <div key={lq.id} className="flex items-center justify-between text-sm">
                <span className="capitalize">{lq.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${getLeaveUtilization(lq)}%` }}
                    />
                  </div>
                  <span className="font-medium">{lq.remainingDays}/{lq.totalDays}j</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Quotas */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quotas d'Événements
          </h4>
          <div className="space-y-2">
            {quota.eventQuotas.map((eq: any) => (
              <div key={eq.id} className="flex items-center justify-between text-sm">
                <span className="capitalize">{eq.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${getEventUtilization(eq)}%` }}
                    />
                  </div>
                  <span className="font-medium">{eq.remainingEvents}/{eq.maxEvents}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Quotas */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quotas de Formation
          </h4>
          <div className="space-y-2">
            {quota.trainingQuotas.map((tq: any) => (
              <div key={tq.id} className="flex items-center justify-between text-sm">
                <span className="capitalize">{tq.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: `${getTrainingUtilization(tq)}%` }}
                    />
                  </div>
                  <span className="font-medium">{tq.remainingHours}/{tq.requiredHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuotaAction('view', quota)}
          >
            <Eye className="h-4 w-4" />
            Voir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuotaAction('edit', quota)}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderAnalyticsView = () => {
    const leaveData = quotas.flatMap(q => 
      q.leaveQuotas.map(lq => ({
        name: `${q.employee.name} - ${lq.type}`,
        used: lq.usedDays,
        total: lq.totalDays,
        utilization: getLeaveUtilization(lq)
      }))
    );

    const eventData = quotas.flatMap(q => 
      q.eventQuotas.map(eq => ({
        name: `${q.employee.name} - ${eq.type}`,
        attended: eq.attendedEvents,
        max: eq.maxEvents,
        utilization: getEventUtilization(eq)
      }))
    );

    const trainingData = quotas.flatMap(q => 
      q.trainingQuotas.map(tq => ({
        name: `${q.employee.name} - ${tq.type}`,
        completed: tq.completedHours,
        required: tq.requiredHours,
        utilization: getTrainingUtilization(tq)
      }))
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Utilization Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation des Congés</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Utilization Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Participation aux Événements</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Progress Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression Formation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé Global</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-blue-600">Congés Utilisés</div>
                <div className="text-lg font-semibold text-blue-900">
                  {quotas.reduce((acc, q) => 
                    acc + q.leaveQuotas.reduce((sum, lq) => sum + lq.usedDays, 0), 0
                  )} jours
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-green-600">Événements Participés</div>
                <div className="text-lg font-semibold text-green-900">
                  {quotas.reduce((acc, q) => 
                    acc + q.eventQuotas.reduce((sum, eq) => sum + eq.attendedEvents, 0), 0
                  )} événements
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="text-sm text-purple-600">Heures de Formation</div>
                <div className="text-lg font-semibold text-purple-900">
                  {quotas.reduce((acc, q) => 
                    acc + q.trainingQuotas.reduce((sum, tq) => sum + tq.completedHours, 0), 0
                  )} heures
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    );
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
              Gestion des Quotas
            </h1>
            <p className="mt-2 text-gray-600">
              Suivi des quotas de congés, événements et formation par employé
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : viewMode === 'table' ? 'analytics' : 'cards')}
            >
              {viewMode === 'cards' ? 'Vue Tableau' : viewMode === 'table' ? 'Vue Analytics' : 'Vue Cartes'}
            </Button>
            <Button
              icon={Plus}
              onClick={() => handleQuotaAction('create')}
            >
              Nouveau Quota
            </Button>
          </div>
        </motion.div>

        {/* View Mode Tabs */}
        <motion.div variants={itemVariants} className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'cards', label: 'Cartes', icon: UserCheck },
            { id: 'table', label: 'Tableau', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants}>
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {quotas.map(renderQuotaCard)}
            </div>
          )}
          
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Congés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotas.map((quota) => {
                    const status = getQuotaStatus(quota);
                    return (
                      <tr key={quota.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{quota.employee.name}</div>
                            <div className="text-sm text-gray-500">{quota.employee.department}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quota.leaveQuotas.reduce((acc, lq) => acc + lq.usedDays, 0)}/
                            {quota.leaveQuotas.reduce((acc, lq) => acc + lq.totalDays, 0)} jours
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quota.eventQuotas.reduce((acc, eq) => acc + eq.attendedEvents, 0)}/
                            {quota.eventQuotas.reduce((acc, eq) => acc + eq.maxEvents, 0)} événements
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quota.trainingQuotas.reduce((acc, tq) => acc + tq.completedHours, 0)}/
                            {quota.trainingQuotas.reduce((acc, tq) => acc + tq.requiredHours, 0)} heures
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                            {status.status === 'high' ? 'Élevé' : status.status === 'medium' ? 'Moyen' : 'Faible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuotaAction('view', quota)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuotaAction('edit', quota)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {viewMode === 'analytics' && renderAnalyticsView()}
        </motion.div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'create' ? 'Nouveau Quota' :
            modalType === 'edit' ? 'Modifier Quota' :
            'Détails du Quota'
          }
          size="xl"
        >
          <div className="p-6">
            {modalType === 'view' && selectedQuota && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employé</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuota.employee.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Département</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuota.employee.department}</p>
                  </div>
                </div>
                
                {/* Detailed Quotas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Leave Quotas */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Congés</h4>
                    <div className="space-y-2">
                      {selectedQuota.leaveQuotas.map((lq: any) => (
                        <div key={lq.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="capitalize text-blue-700">{lq.type}</span>
                            <span className="font-medium">{lq.remainingDays}/{lq.totalDays}j</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${getLeaveUtilization(lq)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Event Quotas */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">Événements</h4>
                    <div className="space-y-2">
                      {selectedQuota.eventQuotas.map((eq: any) => (
                        <div key={eq.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="capitalize text-green-700">{eq.type}</span>
                            <span className="font-medium">{eq.remainingEvents}/{eq.maxEvents}</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 rounded-full bg-green-600"
                              style={{ width: `${getEventUtilization(eq)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Training Quotas */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-3">Formation</h4>
                    <div className="space-y-2">
                      {selectedQuota.trainingQuotas.map((tq: any) => (
                        <div key={tq.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="capitalize text-purple-700">{tq.type}</span>
                            <span className="font-medium">{tq.remainingHours}/{tq.requiredHours}h</span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 rounded-full bg-purple-600"
                              style={{ width: `${getTrainingUtilization(tq)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {(modalType === 'create' || modalType === 'edit') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employé</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="">Sélectionner un employé</option>
                      {/* Employee options would go here */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Année</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="2024"
                    />
                  </div>
                </div>
                
                {/* Quota configuration would go here */}
                <div className="text-center text-gray-500 py-8">
                  Configuration détaillée des quotas à implémenter
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </Button>
              {(modalType === 'create' || modalType === 'edit') && (
                <Button>
                  {modalType === 'create' ? 'Créer' : 'Modifier'}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageTransition>
  );
};

export default Quotas; 