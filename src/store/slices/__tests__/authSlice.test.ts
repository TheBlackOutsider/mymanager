import authReducer, {
  loginWithLDAP,
  loginWithEmail,
  loginWithSSO,
  refreshToken,
  logout,
  updateProfile,
  changePassword,
  enableTwoFactor,
  verifyTwoFactor,
  checkPermission,
  updateSecurityLevel,
  updateLastActivity,
  clearError,
  setSessionExpiry,
  extendSession,
  addPermission,
  removePermission,
  updatePermissions,
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
  selectPermissions,
  selectLoginMethod,
  selectSecurityLevel,
  hasPermissionSelector,
  canManageTeam,
  canManageAll,
} from '../authSlice';
import { AuthState, User, Permission } from '../../../types/auth';

describe('Auth Slice', () => {
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    permissions: [],
    loginMethod: null,
    sessionExpiry: null,
    lastActivity: new Date().toISOString(),
    securityLevel: 'medium',
  };

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'hr_officer',
    department: 'HR',
    isActive: true,
    lastLogin: new Date().toISOString(),
    loginMethod: 'email',
    permissions: [],
    avatar: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPermissions: Permission[] = [
    {
      id: '1',
      name: 'View Own Profile',
      resource: 'profile',
      action: 'read',
      scope: 'self',
    },
    {
      id: '2',
      name: 'Manage Events',
      resource: 'events',
      action: 'manage',
      scope: 'all',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('Reducers', () => {
    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const newState = authReducer(stateWithError, clearError());
      expect(newState.error).toBeNull();
    });

    it('should handle updateSecurityLevel', () => {
      const newState = authReducer(initialState, updateSecurityLevel('high'));
      expect(newState.securityLevel).toBe('high');
    });

    it('should handle updateLastActivity', () => {
      const newState = authReducer(initialState, updateLastActivity());
      expect(newState.lastActivity).toBeDefined();
      expect(new Date(newState.lastActivity).getTime()).toBeGreaterThan(
        new Date(initialState.lastActivity).getTime() - 1000
      );
    });

    it('should handle setSessionExpiry', () => {
      const expiryDate = new Date(Date.now() + 3600000).toISOString();
      const newState = authReducer(initialState, setSessionExpiry(expiryDate));
      expect(newState.sessionExpiry).toBe(expiryDate);
    });

    it('should handle extendSession', () => {
      const stateWithExpiry = {
        ...initialState,
        sessionExpiry: new Date().toISOString(),
      };
      const newState = authReducer(stateWithExpiry, extendSession());
      expect(newState.sessionExpiry).toBeDefined();
    });

    it('should handle addPermission', () => {
      const newPermission: Permission = {
        id: '3',
        name: 'New Permission',
        resource: 'test',
        action: 'read',
        scope: 'self',
      };
      const newState = authReducer(initialState, addPermission(newPermission));
      expect(newState.permissions).toContain(newPermission);
    });

    it('should handle removePermission', () => {
      const stateWithPermissions = {
        ...initialState,
        permissions: mockPermissions,
      };
      const newState = authReducer(stateWithPermissions, removePermission('1'));
      expect(newState.permissions).toHaveLength(1);
      expect(newState.permissions[0].id).toBe('2');
    });

    it('should handle updatePermissions', () => {
      const newState = authReducer(initialState, updatePermissions(mockPermissions));
      expect(newState.permissions).toEqual(mockPermissions);
    });

    it('should handle checkPermission', () => {
      const stateWithUser = { ...initialState, user: mockUser };
      const newState = authReducer(stateWithUser, checkPermission({
        resource: 'profile',
        action: 'read',
        scope: 'self',
      }));
      expect(newState.error).toBeNull();
    });
  });

  describe('Async Thunks', () => {
    describe('loginWithLDAP', () => {
      it('should handle pending state', () => {
        const action = { type: loginWithLDAP.pending.type };
        const newState = authReducer(initialState, action);
        expect(newState.isLoading).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const mockResponse = {
          success: true,
          user: mockUser,
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          permissions: mockPermissions,
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'Login successful',
        };
        const action = { type: loginWithLDAP.fulfilled.type, payload: mockResponse };
        const newState = authReducer(initialState, action);
        
        expect(newState.isLoading).toBe(false);
        expect(newState.isAuthenticated).toBe(true);
        expect(newState.user).toEqual(mockUser);
        expect(newState.permissions).toEqual(mockPermissions);
        expect(newState.loginMethod).toBe('ldap');
        expect(newState.sessionExpiry).toBe(mockResponse.sessionExpiry);
        expect(newState.securityLevel).toBe('high');
      });

      it('should handle rejected state', () => {
        const action = { 
          type: loginWithLDAP.rejected.type, 
          payload: 'LDAP authentication failed' 
        };
        const newState = authReducer(initialState, action);
        
        expect(newState.isLoading).toBe(false);
        expect(newState.error).toBe('LDAP authentication failed');
        expect(newState.securityLevel).toBe('critical');
      });
    });

    describe('loginWithEmail', () => {
      it('should handle pending state', () => {
        const action = { type: loginWithEmail.pending.type };
        const newState = authReducer(initialState, action);
        expect(newState.isLoading).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const mockResponse = {
          success: true,
          user: mockUser,
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          permissions: mockPermissions,
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'Login successful',
        };
        const action = { type: loginWithEmail.fulfilled.type, payload: mockResponse };
        const newState = authReducer(initialState, action);
        
        expect(newState.isLoading).toBe(false);
        expect(newState.isAuthenticated).toBe(true);
        expect(newState.user).toEqual(mockUser);
        expect(newState.permissions).toEqual(mockPermissions);
        expect(newState.loginMethod).toBe('email');
        expect(newState.sessionExpiry).toBe(mockResponse.sessionExpiry);
        expect(newState.securityLevel).toBe('medium');
      });

      it('should handle rejected state', () => {
        const action = { 
          type: loginWithEmail.rejected.type, 
          payload: 'Invalid credentials' 
        };
        const newState = authReducer(initialState, action);
        
        expect(newState.isLoading).toBe(false);
        expect(newState.error).toBe('Invalid credentials');
        expect(newState.securityLevel).toBe('critical');
      });
    });

    describe('loginWithSSO', () => {
      it('should handle pending state', () => {
        const action = { type: loginWithSSO.pending.type };
        const newState = authReducer(initialState, action);
        expect(newState.isLoading).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const mockResponse = {
          success: true,
          user: mockUser,
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          permissions: mockPermissions,
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'Login successful',
        };
        const action = { type: loginWithSSO.fulfilled.type, payload: mockResponse };
        const newState = authReducer(initialState, action);
        
        expect(newState.isLoading).toBe(false);
        expect(newState.isAuthenticated).toBe(true);
        expect(newState.user).toEqual(mockUser);
        expect(newState.permissions).toEqual(mockPermissions);
        expect(newState.loginMethod).toBe('sso');
        expect(newState.sessionExpiry).toBe(mockResponse.sessionExpiry);
        expect(newState.securityLevel).toBe('high');
      });

      it('should handle rejected state', () => {
        const action = { 
          type: loginWithSSO.rejected.type, 
          payload: 'SSO authentication failed' 
        };
        const newState = authReducer(initialState, action);
        
        expect(newState.isLoading).toBe(false);
        expect(newState.error).toBe('SSO authentication failed');
        expect(newState.securityLevel).toBe('critical');
      });
    });

    describe('refreshToken', () => {
      it('should handle fulfilled state', () => {
        const stateWithExpiry = {
          ...initialState,
          sessionExpiry: new Date().toISOString(),
        };
        const mockResponse = {
          success: true,
          user: mockUser,
          token: 'new-token',
          refreshToken: 'mock-refresh-token',
          permissions: mockPermissions,
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'Token refreshed',
        };
        const action = { type: refreshToken.fulfilled.type, payload: mockResponse };
        const newState = authReducer(stateWithExpiry, action);
        
        expect(newState.sessionExpiry).toBe(mockResponse.sessionExpiry);
        expect(newState.lastActivity).toBeDefined();
      });

      it('should handle rejected state', () => {
        const stateWithUser = { ...initialState, user: mockUser, isAuthenticated: true };
        const action = { type: refreshToken.rejected.type };
        const newState = authReducer(stateWithUser, action);
        
        expect(newState.isAuthenticated).toBe(false);
        expect(newState.user).toBeNull();
        expect(newState.permissions).toEqual([]);
        expect(newState.sessionExpiry).toBeNull();
      });
    });

    describe('logout', () => {
      it('should handle fulfilled state', () => {
        const stateWithUser = { ...initialState, user: mockUser, isAuthenticated: true };
        const action = { type: logout.fulfilled.type };
        const newState = authReducer(stateWithUser, action);
        
        expect(newState.isAuthenticated).toBe(false);
        expect(newState.user).toBeNull();
        expect(newState.permissions).toEqual([]);
        expect(newState.loginMethod).toBeNull();
        expect(newState.sessionExpiry).toBeNull();
        expect(newState.securityLevel).toBe('low');
      });
    });

    describe('updateProfile', () => {
      it('should handle fulfilled state', () => {
        const stateWithUser = { ...initialState, user: mockUser };
        const updatedUser = { ...mockUser, name: 'Jane Doe' };
        const action = { type: updateProfile.fulfilled.type, payload: updatedUser };
        const newState = authReducer(stateWithUser, action);
        
        expect(newState.user).toEqual(updatedUser);
        expect(newState.lastActivity).toBeDefined();
      });
    });

    describe('changePassword', () => {
      it('should handle fulfilled state', () => {
        const action = { type: changePassword.fulfilled.type };
        const newState = authReducer(initialState, action);
        
        expect(newState.lastActivity).toBeDefined();
        expect(newState.securityLevel).toBe('high');
      });
    });

    describe('enableTwoFactor', () => {
      it('should handle fulfilled state', () => {
        const action = { type: enableTwoFactor.fulfilled.type };
        const newState = authReducer(initialState, action);
        
        expect(newState.securityLevel).toBe('high');
      });
    });

    describe('verifyTwoFactor', () => {
      it('should handle fulfilled state', () => {
        const action = { type: verifyTwoFactor.fulfilled.type };
        const newState = authReducer(initialState, action);
        
        expect(newState.securityLevel).toBe('high');
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        permissions: mockPermissions,
        loginMethod: 'email',
        securityLevel: 'high',
      },
    };

    it('should select user', () => {
      const result = selectUser(mockState);
      expect(result).toEqual(mockUser);
    });

    it('should select isAuthenticated', () => {
      const result = selectIsAuthenticated(mockState);
      expect(result).toBe(true);
    });

    it('should select userRole', () => {
      const result = selectUserRole(mockState);
      expect(result).toBe('hr_officer');
    });

    it('should select permissions', () => {
      const result = selectPermissions(mockState);
      expect(result).toEqual(mockPermissions);
    });

    it('should select loginMethod', () => {
      const result = selectLoginMethod(mockState);
      expect(result).toBe('email');
    });

    it('should select securityLevel', () => {
      const result = selectSecurityLevel(mockState);
      expect(result).toBe('high');
    });

    it('should select hasPermission', () => {
      const selector = hasPermissionSelector('profile', 'read', 'self');
      const result = selector(mockState);
      expect(result).toBe(true);
    });

    it('should select canManageTeam', () => {
      const result = canManageTeam(mockState);
      expect(result).toBe(true);
    });

    it('should select canManageAll', () => {
      const result = canManageAll(mockState);
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions array', () => {
      const stateWithNoPermissions = { ...initialState, permissions: [] };
      const selector = hasPermissionSelector('profile', 'read', 'self');
      const result = selector({ auth: stateWithNoPermissions });
      expect(result).toBe(false);
    });

    it('should handle null user', () => {
      const stateWithNullUser = { ...initialState, user: null };
      const selector = hasPermissionSelector('profile', 'read', 'self');
      const result = selector({ auth: stateWithNullUser });
      expect(result).toBe(false);
    });

    it('should handle invalid role', () => {
      const stateWithInvalidRole = { 
        ...initialState, 
        user: { ...mockUser, role: 'invalid_role' as any } 
      };
      const result = canManageTeam({ auth: stateWithInvalidRole });
      expect(result).toBe(false);
    });

    it('should handle session expiry extension with no expiry', () => {
      const newState = authReducer(initialState, extendSession());
      expect(newState.sessionExpiry).toBeUndefined();
    });
  });
}); 