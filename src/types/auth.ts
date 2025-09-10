export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  lastLogin: string;
  loginMethod: 'ldap' | 'email' | 'sso';
  ldapId?: string;
  permissions: Permission[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'employee'           // Employé standard
  | 'manager'            // Manager d'équipe
  | 'hr_officer'         // Officier RH
  | 'hr_head'            // Responsable RH
  | 'admin'              // Administrateur système
  | 'ldap_user';         // Utilisateur LDAP externe

export interface Permission {
  id: string;
  name: string;
  resource: string;      // 'events', 'leaves', 'employees', 'reports'
  action: string;        // 'create', 'read', 'update', 'delete', 'approve'
  scope: 'self' | 'team' | 'department' | 'all';
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;         // 'department', 'role', 'seniority'
  operator: 'eq' | 'ne' | 'in' | 'not_in' | 'gt' | 'lt';
  value: string | string[] | number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: Permission[];
  loginMethod: 'ldap' | 'email' | 'sso' | null;
  sessionExpiry: string | null;
  lastActivity: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface LoginCredentials {
  email: string;
  password: string;
  method: 'ldap' | 'email';
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface LDAPCredentials {
  username: string;      // Nom d'utilisateur LDAP
  password: string;
  domain?: string;       // Domaine LDAP (optionnel)
  server?: string;       // Serveur LDAP personnalisé
}

export interface EmailCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  permissions: string[]; // Changé de Permission[] à string[]
  sessionExpiry: string;
  message: string;
  status?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  scope?: string;
  userId?: string;
  targetId?: string;
}

export interface LDAPConfig {
  enabled: boolean;
  server: string;
  port: number;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  userSearchBase: string;
  userSearchFilter: string;
  groupSearchBase: string;
  groupSearchFilter: string;
  ssl: boolean;
  timeout: number;
}

export interface SSOConfig {
  enabled: boolean;
  provider: 'azure' | 'google' | 'okta' | 'custom';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

// Permissions de base par rôle (sans références circulaires)
const BASE_PERMISSIONS: Record<UserRole, Permission[]> = {
  employee: [
    { id: '1', name: 'View Own Profile', resource: 'profile', action: 'read', scope: 'self' },
    { id: '2', name: 'Update Own Profile', resource: 'profile', action: 'update', scope: 'self' },
    { id: '3', name: 'View Own Events', resource: 'events', action: 'read', scope: 'self' },
    { id: '4', name: 'Register for Events', resource: 'events', action: 'create', scope: 'self' },
    { id: '5', name: 'View Own Leaves', resource: 'leaves', action: 'read', scope: 'self' },
    { id: '6', name: 'Request Leave', resource: 'leaves', action: 'create', scope: 'self' },
    { id: '7', name: 'View Own Attendance', resource: 'attendance', action: 'read', scope: 'self' },
  ],
  
  manager: [
    { id: '8', name: 'View Team Members', resource: 'employees', action: 'read', scope: 'team' },
    { id: '9', name: 'Approve Team Leaves', resource: 'leaves', action: 'approve', scope: 'team' },
    { id: '10', name: 'View Team Reports', resource: 'reports', action: 'read', scope: 'team' },
    { id: '11', name: 'Manage Team Events', resource: 'events', action: 'update', scope: 'team' },
  ],
  
  hr_officer: [
    { id: '12', name: 'View All Employees', resource: 'employees', action: 'read', scope: 'all' },
    { id: '13', name: 'Manage All Events', resource: 'events', action: 'manage', scope: 'all' },
    { id: '14', name: 'Approve All Leaves', resource: 'leaves', action: 'approve', scope: 'all' },
    { id: '15', name: 'View All Reports', resource: 'reports', action: 'read', scope: 'all' },
    { id: '16', name: 'Manage Attendance', resource: 'attendance', action: 'manage', scope: 'all' },
  ],
  
  hr_head: [
    { id: '17', name: 'Manage HR Officers', resource: 'employees', action: 'manage', scope: 'all' },
    { id: '18', name: 'System Configuration', resource: 'system', action: 'configure', scope: 'all' },
    { id: '19', name: 'Audit Logs', resource: 'audit', action: 'read', scope: 'all' },
    { id: '20', name: 'LDAP Management', resource: 'ldap', action: 'manage', scope: 'all' },
  ],
  
  admin: [
    { id: '21', name: 'Full System Access', resource: '*', action: '*', scope: 'all' },
    { id: '22', name: 'User Management', resource: 'users', action: 'manage', scope: 'all' },
    { id: '23', name: 'Security Settings', resource: 'security', action: 'configure', scope: 'all' },
  ],
  
  ldap_user: [
    { id: '24', name: 'View Own Profile', resource: 'profile', action: 'read', scope: 'self' },
    { id: '25', name: 'View Public Events', resource: 'events', action: 'read', scope: 'all' },
    { id: '26', name: 'Register for Public Events', resource: 'events', action: 'create', scope: 'self' },
  ],
};

// Permissions complètes par rôle (avec héritage)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  employee: [...BASE_PERMISSIONS.employee],
  
  manager: [
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
  ],
  
  hr_officer: [
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
    ...BASE_PERMISSIONS.hr_officer,
  ],
  
  hr_head: [
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
    ...BASE_PERMISSIONS.hr_officer,
    ...BASE_PERMISSIONS.hr_head,
  ],
  
  admin: [
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
    ...BASE_PERMISSIONS.hr_officer,
    ...BASE_PERMISSIONS.hr_head,
    ...BASE_PERMISSIONS.admin,
  ],
  
  ldap_user: [...BASE_PERMISSIONS.ldap_user],
};

// Conditions de permission avancées
export const PERMISSION_CONDITIONS: Record<string, PermissionCondition[]> = {
  'department_manager': [
    { field: 'role', operator: 'eq', value: 'manager' },
    { field: 'department', operator: 'eq', value: '{{user.department}}' }
  ],
  'senior_employee': [
    { field: 'seniority', operator: 'in', value: ['senior', 'lead'] }
  ],
  'hr_department': [
    { field: 'department', operator: 'eq', value: 'Human Resources' }
  ],
  'same_department': [
    { field: 'department', operator: 'eq', value: '{{user.department}}' }
  ]
};