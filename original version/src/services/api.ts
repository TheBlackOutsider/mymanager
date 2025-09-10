import axios from 'axios';
import { Employee, Event, LeaveRequest, Report, Notification, ApiResponse, PaginatedResponse, Attendance, AttendanceStats, AuthResponse, EmailCredentials, EventCapacity, EventRegistration, LDAPConfig, LDAPCredentials, Permission, PermissionCheck, RegistrationConflict, RegistrationRequest, RegistrationResponse, SSOConfig, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Retourner seulement les données, pas la réponse complète
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Employees API
export const employeesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; department?: string; role?: string }) =>
    api.get<PaginatedResponse<Employee>>('/employees', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Employee>>(`/employees/${id}`),
  
  create: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<Employee>>('/employees', employee),
  
  update: (id: string, employee: Partial<Employee>) =>
    api.put<ApiResponse<Employee>>(`/employees/${id}`, employee),
  
  delete: (id: string) =>
    api.delete(`/employees/${id}`),
};

// Events API
export const eventsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) =>
    api.get<PaginatedResponse<Event>>('/events', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Event>>(`/events/${id}`),
  
  create: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<Event>>('/events', event),
  
  update: (id: string, event: Partial<Event>) =>
    api.put<ApiResponse<Event>>(`/events/${id}`, event),
  
  delete: (id: string) =>
    api.delete(`/events/${id}`),
  
  register: (eventId: string, employeeId: string) =>
    api.post<ApiResponse<Event>>(`/events/${eventId}/register`, { employeeId }),
  
  unregister: (eventId: string, employeeId: string) =>
    api.delete(`/events/${eventId}/register/${employeeId}`),
};

// Leaves API
export const leavesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string; employeeId?: string }) =>
    api.get<PaginatedResponse<LeaveRequest>>('/leaves', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`),
  
  create: (leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<LeaveRequest>>('/leaves', leave),
  
  update: (id: string, leave: Partial<LeaveRequest>) =>
    api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}`, leave),
  
  approve: (id: string, approvedBy: string) =>
    api.post<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`, { approvedBy }),
  
  reject: (id: string, rejectionReason: string, rejectedBy: string) =>
    api.post<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { rejectionReason, rejectedBy }),
  
  delete: (id: string) =>
    api.delete(`/leaves/${id}`),
};

// Reports API
export const reportsApi = {
  getAll: () =>
    api.get<ApiResponse<Report[]>>('/reports'),
  
  generate: (params: { type: string; startDate?: string; endDate?: string }) =>
    api.post<ApiResponse<Report>>('/reports/generate', params),
  
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/analytics', { params }),
  
  export: (id: string, format: 'pdf' | 'csv') =>
    api.get(`/reports/${id}/export/${format}`, { responseType: 'blob' }),
};

// Notifications API
export const notificationsApi = {
  getByUserId: (userId: string) =>
    api.get<ApiResponse<Notification[]>>(`/notifications/user/${userId}`),
  
  markAsRead: (id: string) =>
    api.put<ApiResponse<Notification>>(`/notifications/${id}/read`),
  
  markAllAsRead: (userId: string) =>
    api.put<ApiResponse<Notification[]>>(`/notifications/user/${userId}/read-all`),
  
  create: (notification: Omit<Notification, 'id' | 'createdAt'>) =>
    api.post<ApiResponse<Notification>>('/notifications', notification),
};

// Attendance API
export const attendanceApi = {
  getAll: (params?: { page?: number; limit?: number; eventId?: string; employeeId?: string; status?: string }) =>
    api.get<PaginatedResponse<Attendance>>('/attendance', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Attendance>>(`/attendance/${id}`),
  
  getStats: (eventId: string) =>
    api.get<ApiResponse<AttendanceStats>>(`/attendance/stats/${eventId}`),
  
  register: (eventId: string, employeeId: string) =>
    api.post<ApiResponse<Attendance>>(`/attendance/register`, { eventId, employeeId }),
  
  checkIn: (attendanceId: string, checkInTime: string) =>
    api.post<ApiResponse<Attendance>>(`/attendance/${attendanceId}/checkin`, { checkInTime }),
  
  checkOut: (attendanceId: string, checkOutTime: string) =>
    api.post<ApiResponse<Attendance>>(`/attendance/${attendanceId}/checkout`, { checkOutTime }),
  
  updateStatus: (attendanceId: string, status: string, notes?: string) =>
    api.put<ApiResponse<Attendance>>(`/attendance/${attendanceId}/status`, { status, notes }),
  
  delete: (id: string) =>
    api.delete(`/attendance/${id}`),
};

// Event Registration API (newly added - SECURE)
export const eventRegistrationApi = {
  // Inscription à un événement avec validation de sécurité
  register: (request: RegistrationRequest) => {
    // Validation côté client avant envoi
    if (!request.eventId || !request.employeeId) {
      throw new Error('Données d\'inscription invalides');
    }
    
    // Ajout d'informations de sécurité pour audit trail
    const secureRequest = {
      ...request,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      userAgent: navigator.userAgent,
    };
    
    return api.post<ApiResponse<RegistrationResponse>>('/event-registrations/register', secureRequest);
  },
  
  // Annulation d'inscription avec vérification d'autorisation
  cancel: (registrationId: string) => {
    if (!registrationId) {
      throw new Error('ID d\'inscription invalide');
    }
    
    return api.post<ApiResponse<RegistrationResponse>>(`/event-registrations/${registrationId}/cancel`);
  },
  
  // Récupération des inscriptions par événement (avec pagination sécurisée)
  getByEvent: (eventId: string, params?: { page?: number; limit?: number; status?: string }) => {
    if (!eventId) {
      throw new Error('ID d\'événement invalide');
    }
    
    return api.get<PaginatedResponse<EventRegistration>>(`/event-registrations/event/${eventId}`, { 
      params: { ...params, limit: Math.min(params?.limit || 50, 100) } // Limite de sécurité
    });
  },
  
  // Vérification des conflits avant inscription
  checkConflicts: (request: RegistrationRequest) => {
    if (!request.eventId || !request.employeeId) {
      throw new Error('Données de vérification invalides');
    }
    
    return api.post<ApiResponse<{ conflicts: RegistrationConflict[]; canRegister: boolean }>>('/event-registrations/check-conflicts', request);
  },
  
  // Récupération de la capacité d'un événement
  getCapacity: (eventId: string) => {
    if (!eventId) {
      throw new Error('ID d\'événement invalide');
    }
    
    return api.get<ApiResponse<EventCapacity>>(`/event-registrations/capacity/${eventId}`);
  },
  
  // Validation de confirmation d'inscription (2FA)
  confirmRegistration: (registrationId: string, confirmationCode: string) => {
    if (!registrationId || !confirmationCode) {
      throw new Error('Données de confirmation invalides');
    }
    
    return api.post<ApiResponse<RegistrationResponse>>(`/event-registrations/${registrationId}/confirm`, { confirmationCode });
  },
  
  // Récupération des inscriptions d'un employé
  getByEmployee: (employeeId: string, params?: { page?: number; limit?: number; status?: string }) => {
    if (!employeeId) {
      throw new Error('ID d\'employé invalide');
    }
    
    return api.get<PaginatedResponse<EventRegistration>>(`/event-registrations/employee/${employeeId}`, { 
      params: { ...params, limit: Math.min(params?.limit || 50, 100) }
    });
  },
  
  // Mise à jour du statut d'inscription (HR seulement)
  updateStatus: (registrationId: string, status: string, notes?: string) => {
    if (!registrationId || !status) {
      throw new Error('Données de mise à jour invalides');
    }
    
    return api.put<ApiResponse<EventRegistration>>(`/event-registrations/${registrationId}/status`, { status, notes });
  },
};

// Authentication API (LDAP + Email + SSO)
export const authApi = {
  // Connexion LDAP
  ldapLogin: (credentials: LDAPCredentials) => {
    const secureCredentials = {
      ...credentials,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'client-ip', // Sera remplacé par le serveur
    };
    
    return api.post<ApiResponse<AuthResponse>>('/auth/ldap/login', secureCredentials);
  },
  
  // Connexion Email
  emailLogin: (credentials: EmailCredentials) => {
    const secureCredentials = {
      ...credentials,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'client-ip',
    };
    
    return api.post<ApiResponse<AuthResponse>>('/auth/email/login', secureCredentials);
  },
  
  // Connexion SSO
  ssoLogin: (provider: string) => {
    return api.post<ApiResponse<AuthResponse>>(`/auth/sso/${provider}/login`);
  },
  
  // Rafraîchissement du token
  refreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token non trouvé');
    }
    
    return api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
  },
  
  // Déconnexion
  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post<ApiResponse<{ message: string }>>('/auth/logout', { refreshToken });
  },
  
  // Récupération du profil utilisateur
  getProfile: () => {
    return api.get<ApiResponse<User>>('/auth/profile');
  },
  
  // Mise à jour du profil
  updateProfile: (profileData: Partial<User>) => {
    return api.put<ApiResponse<User>>('/auth/profile', profileData);
  },
  
  // Changement de mot de passe
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => {
    return api.post<ApiResponse<{ message: string }>>('/auth/change-password', passwordData);
  },
  
  // Activation de l'authentification à deux facteurs
  enableTwoFactor: () => {
    return api.post<ApiResponse<{ qrCode: string; secret: string }>>('/auth/2fa/enable');
  },
  
  // Vérification du code 2FA
  verifyTwoFactor: (code: string) => {
    return api.post<ApiResponse<{ message: string }>>('/auth/2fa/verify', { code });
  },
  
  // Désactivation de l'authentification à deux facteurs
  disableTwoFactor: (code: string) => {
    return api.post<ApiResponse<{ message: string }>>('/auth/2fa/disable', { code });
  },
  
  // Récupération des permissions
  getPermissions: () => {
    return api.get<ApiResponse<Permission[]>>('/auth/permissions');
  },
  
  // Vérification des permissions
  checkPermission: (permissionCheck: PermissionCheck) => {
    return api.post<ApiResponse<{ hasAccess: boolean; reason?: string }>>('/auth/check-permission', permissionCheck);
  },
  
  // Récupération de la configuration LDAP
  getLDAPConfig: () => {
    return api.get<ApiResponse<LDAPConfig>>('/auth/ldap/config');
  },
  
  // Test de connexion LDAP
  testLDAPConnection: (config: Partial<LDAPConfig>) => {
    return api.post<ApiResponse<{ connected: boolean; message: string }>>('/auth/ldap/test', config);
  },
  
  // Synchronisation LDAP
  syncLDAPUsers: () => {
    return api.post<ApiResponse<{ synced: number; errors: string[] }>>('/auth/ldap/sync');
  },
  
  // Récupération de la configuration SSO
  getSSOConfig: () => {
    return api.get<ApiResponse<SSOConfig>>('/auth/sso/config');
  },
  
  // Test de connexion SSO
  testSSOConnection: (provider: string) => {
    return api.post<ApiResponse<{ connected: boolean; message: string }>>('/auth/sso/test', { provider });
  },
  
  // Audit trail de sécurité
  getSecurityAudit: (params?: { 
    page?: number; 
    limit?: number; 
    userId?: string; 
    action?: string; 
    startDate?: string; 
    endDate?: string 
  }) => {
    return api.get<PaginatedResponse<SecurityAuditLog>>('/auth/security/audit', { params });
  },
  
  // Rapports de sécurité
  getSecurityReport: (params?: { 
    startDate?: string; 
    endDate?: string; 
    type?: 'login_attempts' | 'permission_checks' | 'security_events' 
  }) => {
    return api.get<ApiResponse<SecurityReport>>('/auth/security/report', { params });
  },
};

export default api;