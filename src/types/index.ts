export * from './auth';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  seniority: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'training' | 'seminar' | 'onboarding' | 'team_building' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  attendees: string[];
  maxAttendees?: number;
  isRecurring: boolean;
  recurrencePattern?: string;
  status: 'draft' | 'published' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  type: 'annual' | 'sick' | 'personal' | 'special';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  managerApproval?: boolean;
  hrApproval?: boolean;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  type: 'events' | 'leaves' | 'attendance';
  title: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'event_reminder' | 'leave_approval' | 'leave_rejection' | 'event_invitation';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Attendance {
  id: string;
  eventId: string;
  employeeId: string;
  employee?: Employee;
  event?: Event;
  checkIn: string | null;
  checkOut: string | null;
  status: 'registered' | 'present' | 'absent' | 'late' | 'left_early';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalRegistered: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendanceRate: number;
  lateRate: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  employeeId: string;
  employee?: Employee;
  event?: Event;
  registrationDate: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  confirmationCode?: string; // Code de sécurité pour confirmation
  ipAddress?: string; // Audit trail pour sécurité
  userAgent?: string; // Audit trail pour sécurité
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationConflict {
  id: string;
  eventId: string;
  employeeId: string;
  conflictType: 'leave_overlap' | 'event_overlap' | 'time_conflict' | 'capacity_full';
  conflictDetails: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface EventCapacity {
  eventId: string;
  maxAttendees: number;
  currentAttendees: number;
  waitlistEnabled: boolean;
  waitlistSize: number;
  registrationDeadline: string;
  cancellationDeadline: string;
}

export interface RegistrationRequest {
  eventId: string;
  employeeId: string;
  registrationType: 'self' | 'manager' | 'hr';
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface RegistrationResponse {
  success: boolean;
  registrationId?: string;
  status: 'confirmed' | 'waitlist' | 'cancelled' | 'error';
  message: string;
  conflicts?: RegistrationConflict[];
  confirmationCode?: string;
  nextSteps?: string[];
}

// Department Management
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parentDepartmentId?: string;
  parentDepartment?: Department;
  subDepartments: Department[];
  managerId?: string;
  manager?: Employee;
  employees: Employee[];
  budget: DepartmentBudget;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentBudget {
  id: string;
  departmentId: string;
  year: number;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  type: 'events' | 'training' | 'equipment' | 'travel' | 'other';
}

export interface DepartmentHierarchy {
  id: string;
  name: string;
  level: number;
  path: string[];
  children: DepartmentHierarchy[];
  employeeCount: number;
  budgetUtilization: number;
}

// Employee Quotas & Limits
export interface EmployeeQuota {
  id: string;
  employeeId: string;
  employee?: Employee;
  year: number;
  leaveQuotas: LeaveQuota[];
  eventQuotas: EventQuota[];
  trainingQuotas: TrainingQuota[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveQuota {
  id: string;
  type: 'annual' | 'sick' | 'personal' | 'special';
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  expiresAt?: string;
}

export interface EventQuota {
  id: string;
  type: 'training' | 'seminar' | 'conference' | 'team_building';
  maxEvents: number;
  attendedEvents: number;
  remainingEvents: number;
}

export interface TrainingQuota {
  id: string;
  type: 'mandatory' | 'optional' | 'certification';
  requiredHours: number;
  completedHours: number;
  remainingHours: number;
  deadline: string;
}

// Security Audit Types
export interface SecurityAuditLog {
  id: string;
  userId: string;
  user?: Employee;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  details?: string;
}

export interface SecurityReport {
  id: string;
  type: 'login_attempts' | 'permission_checks' | 'security_events';
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    suspiciousActivities: number;
  };
  details: any;
  generatedAt: string;
  generatedBy: string;
}