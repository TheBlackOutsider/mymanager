import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  Download,
  ChevronDown,
  ChevronRight,
  MapPin,
  UserCheck,
  PieChart
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PageTransition from '../components/Common/PageTransition';

// Mock data pour les départements
const mockDepartments = [
  {
    id: '1',
    name: 'Direction Générale',
    code: 'DG',
    description: 'Direction générale de l\'entreprise',
    parentDepartmentId: null,
    managerId: '1',
    location: 'Siège Social',
    isActive: true,
    budget: {
      id: '1',
      departmentId: '1',
      year: 2024,
      totalBudget: 500000,
      allocatedBudget: 450000,
      spentBudget: 320000,
      remainingBudget: 130000,
      categories: [
        { id: '1', name: 'Événements', allocated: 100000, spent: 75000, remaining: 25000, type: 'events' },
        { id: '2', name: 'Formation', allocated: 150000, spent: 120000, remaining: 30000, type: 'training' },
        { id: '3', name: 'Équipement', allocated: 200000, spent: 125000, remaining: 75000, type: 'equipment' }
      ]
    },
    employees: [],
    subDepartments: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Ressources Humaines',
    code: 'RH',
    description: 'Gestion des ressources humaines',
    parentDepartmentId: '1',
    managerId: '2',
    location: 'Étage 2',
    isActive: true,
    budget: {
      id: '2',
      departmentId: '2',
      year: 2024,
      totalBudget: 200000,
      allocatedBudget: 180000,
      spentBudget: 140000,
      remainingBudget: 40000,
      categories: [
        { id: '4', name: 'Formation RH', allocated: 80000, spent: 65000, remaining: 15000, type: 'training' },
        { id: '5', name: 'Événements RH', allocated: 60000, spent: 45000, remaining: 15000, type: 'events' },
        { id: '6', name: 'Outils RH', allocated: 40000, spent: 30000, remaining: 10000, type: 'equipment' }
      ]
    },
    employees: [],
    subDepartments: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Développement',
    code: 'DEV',
    description: 'Développement logiciel et IT',
    parentDepartmentId: '1',
    managerId: '3',
    location: 'Étage 3',
    isActive: true,
    budget: {
      id: '3',
      departmentId: '3',
      year: 2024,
      totalBudget: 300000,
      allocatedBudget: 280000,
      spentBudget: 220000,
      remainingBudget: 60000,
      categories: [
        { id: '7', name: 'Formation Tech', allocated: 120000, spent: 95000, remaining: 25000, type: 'training' },
        { id: '8', name: 'Conférences', allocated: 80000, spent: 65000, remaining: 15000, type: 'events' },
        { id: '9', name: 'Licences', allocated: 80000, spent: 60000, remaining: 20000, type: 'equipment' }
      ]
    },
    employees: [],
    subDepartments: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState(mockDepartments);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy' | 'budget'>('list');
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set(['1']));

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

  const handleDepartmentAction = (type: 'view' | 'edit' | 'create', department?: any) => {
    setModalType(type);
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const toggleDepartmentExpansion = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const getBudgetUtilization = (budget: any) => {
    return Math.round((budget.spentBudget / budget.totalBudget) * 100);
  };

  const getBudgetColor = (utilization: number) => {
    if (utilization >= 80) return '#ef4444'; // Rouge
    if (utilization >= 60) return '#f59e0b'; // Orange
    return '#10b981'; // Vert
  };

  const renderBudgetChart = (budget: any) => {
    const data = budget.categories.map((cat: any) => ({
      name: cat.name,
      value: cat.spent,
      color: getBudgetColor((cat.spent / cat.allocated) * 100)
    }));

    return (
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDepartmentCard = (department: any) => (
    <motion.div
      key={department.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {department.code}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{department.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {department.location}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {department.employees.length} employés
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {getBudgetUtilization(department.budget)}%
          </div>
          <div className="text-sm text-gray-500">Utilisation budget</div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Budget 2024</h4>
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {department.budget.totalBudget.toLocaleString()}€
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {department.budget.spentBudget.toLocaleString()}€
            </div>
            <div className="text-xs text-gray-500">Dépensé</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {department.budget.remainingBudget.toLocaleString()}€
            </div>
            <div className="text-xs text-gray-500">Restant</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDepartmentAction('view', department)}
        >
          <Eye className="h-4 w-4" />
          Voir
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDepartmentAction('edit', department)}
        >
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDepartmentAction('create')}
        >
          <Plus className="h-4 w-4" />
          Sous-département
        </Button>
      </div>
    </motion.div>
  );

  const renderHierarchyView = () => (
    <div className="space-y-4">
      {departments.map((dept) => (
        <div key={dept.id} className="bg-white rounded-lg border border-gray-200">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleDepartmentExpansion(dept.id)}
          >
            <div className="flex items-center gap-3">
              {expandedDepartments.has(dept.id) ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">{dept.name}</h3>
                <p className="text-sm text-gray-500">{dept.code} • {dept.employees.length} employés</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {getBudgetUtilization(dept.budget)}% budget
              </div>
              <div className="text-xs text-gray-500">
                {dept.budget.spentBudget.toLocaleString()}€ / {dept.budget.totalBudget.toLocaleString()}€
              </div>
            </div>
          </div>
          
          {expandedDepartments.has(dept.id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 p-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Budget par catégorie</h4>
                  {renderBudgetChart(dept.budget)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Détails</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Localisation:</span>
                      <span>{dept.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        dept.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {dept.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );

  const renderBudgetView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {departments.map((dept) => (
        <motion.div
          key={dept.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.name}</h3>
            <div className="text-3xl font-bold" style={{ color: getBudgetColor(getBudgetUtilization(dept.budget)) }}>
              {getBudgetUtilization(dept.budget)}%
            </div>
            <div className="text-sm text-gray-500">Utilisation du budget</div>
          </div>

          {renderBudgetChart(dept.budget)}

          <div className="mt-6 space-y-3">
            {dept.budget.categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(cat.spent / cat.allocated) * 100}%`,
                        backgroundColor: getBudgetColor((cat.spent / cat.allocated) * 100)
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {cat.spent.toLocaleString()}€
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

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
              Gestion des Départements
            </h1>
            <p className="mt-2 text-gray-600">
              Organisation hiérarchique et gestion budgétaire des départements
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'list' ? 'hierarchy' : viewMode === 'hierarchy' ? 'budget' : 'list')}
            >
              {viewMode === 'list' ? 'Vue Hiérarchie' : viewMode === 'hierarchy' ? 'Vue Budget' : 'Vue Liste'}
            </Button>
            <Button
              icon={Plus}
              onClick={() => handleDepartmentAction('create')}
            >
              Nouveau Département
            </Button>
          </div>
        </motion.div>

        {/* View Mode Tabs */}
        <motion.div variants={itemVariants} className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'list', label: 'Liste', icon: Building2 },
            { id: 'hierarchy', label: 'Hiérarchie', icon: TrendingUp },
            { id: 'budget', label: 'Budgets', icon: DollarSign }
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
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {departments.map(renderDepartmentCard)}
            </div>
          )}
          
          {viewMode === 'hierarchy' && renderHierarchyView()}
          
          {viewMode === 'budget' && renderBudgetView()}
        </motion.div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'create' ? 'Nouveau Département' :
            modalType === 'edit' ? 'Modifier Département' :
            'Détails du Département'
          }
          size="lg"
        >
          <div className="p-6">
            {modalType === 'view' && selectedDepartment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDepartment.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDepartment.code}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDepartment.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget 2024</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDepartment.budget.totalBudget.toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {selectedDepartment.budget.spentBudget.toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-500">Dépensé</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedDepartment.budget.remainingBudget.toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-500">Restant</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {(modalType === 'create' || modalType === 'edit') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Nom du département"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Code (ex: RH)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Description du département"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Département parent</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="">Aucun</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget initial</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
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

export default Departments; 