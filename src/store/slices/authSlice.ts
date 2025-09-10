import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { 
  AuthState, 
  LoginCredentials, 
  LDAPCredentials, 
  EmailCredentials, 
  AuthResponse, 
  User, 
  Permission,
  PermissionCheck,
  UserRole, 
  PermissionCondition
} from '../../types/auth';
import { ROLE_PERMISSIONS, PERMISSION_CONDITIONS } from '../../types/auth';

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

// Thunks d'authentification
export const loginWithLDAP = createAsyncThunk(
  'auth/loginWithLDAP',
  async (credentials: LDAPCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.ldapLogin(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de connexion LDAP');
    }
  }
);

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (credentials: EmailCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.emailLogin(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de connexion email');
    }
  }
);

export const loginWithSSO = createAsyncThunk(
  'auth/loginWithSSO',
  async (provider: string, { rejectWithValue }) => {
    try {
      const response = await authApi.ssoLogin(provider);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de connexion SSO');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const response = await authApi.refreshToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de rafraîchissement du token');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de déconnexion');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de mise à jour du profil');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur de changement de mot de passe');
    }
  }
);

export const enableTwoFactor = createAsyncThunk(
  'auth/enableTwoFactor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.enableTwoFactor();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur d\'activation 2FA');
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyTwoFactor(code);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Code 2FA invalide');
    }
  }
);

// Helper functions pour la gestion des permissions
const hasPermission = (user: User, resource: string, action: string, scope?: string): boolean => {
  if (!user || !user.permissions) return false;
  
  // Vérification des permissions explicites
  const explicitPermission = user.permissions.find(p => 
    p.resource === resource && p.action === action
  );
  
  if (explicitPermission) {
    // Vérification du scope
    if (scope && explicitPermission.scope !== scope && explicitPermission.scope !== 'all') {
      return false;
    }
    return true;
  }
  
  // Vérification des permissions par rôle
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const rolePermission = rolePermissions.find(p => 
    p.resource === resource && p.action === action
  );
  
  if (rolePermission) {
    if (scope && rolePermission.scope !== scope && rolePermission.scope !== 'all') {
      return false;
    }
    return true;
  }
  
  return false;
};

const checkPermissionConditions = (user: User, conditions: PermissionCondition[]): boolean => {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every(condition => {
    const userValue = (user as any)[condition.field];
    
    switch (condition.operator) {
      case 'eq':
        return userValue === condition.value;
      case 'ne':
        return userValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(userValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(userValue);
      case 'gt':
        return userValue > condition.value;
      case 'lt':
        return userValue < condition.value;
      default:
        return false;
    }
  });
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Actions de gestion des permissions
    checkPermission: (state, action: PayloadAction<PermissionCheck>) => {
      const { resource, action: actionType, scope, userId, targetId } = action.payload;
      
      if (!state.user) {
        state.error = 'Utilisateur non authentifié';
        return;
      }
      
      const hasAccess = hasPermission(state.user, resource, actionType, scope);
      if (!hasAccess) {
        state.error = 'Permissions insuffisantes';
      }
    },
    
    // Actions de sécurité
    updateSecurityLevel: (state, action: PayloadAction<AuthState['securityLevel']>) => {
      state.securityLevel = action.payload;
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Actions de session
    setSessionExpiry: (state, action: PayloadAction<string>) => {
      state.sessionExpiry = action.payload;
    },
    
    extendSession: (state) => {
      if (state.sessionExpiry) {
        const expiry = new Date(state.sessionExpiry);
        expiry.setHours(expiry.getHours() + 1); // Extension d'1 heure
        state.sessionExpiry = expiry.toISOString();
      }
    },
    
    // Actions de permissions
    addPermission: (state, action: PayloadAction<Permission>) => {
      if (!state.permissions.find(p => p.id === action.payload.id)) {
        state.permissions.push(action.payload);
      }
    },
    
    removePermission: (state, action: PayloadAction<string>) => {
      state.permissions = state.permissions.filter(p => p.id !== action.payload);
    },
    
    updatePermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login LDAP
      .addCase(loginWithLDAP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithLDAP.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;
        state.loginMethod = 'ldap';
        state.sessionExpiry = action.payload.sessionExpiry;
        state.lastActivity = new Date().toISOString();
        state.securityLevel = 'high'; // LDAP = niveau de sécurité élevé
        
        // Stockage du token dans localStorage
        if (action.payload.token) {
          localStorage.setItem('authToken', action.payload.token);
        }
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(loginWithLDAP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.securityLevel = 'critical';
      })
      
      // Login Email
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions; // Maintenant string[]
        state.loginMethod = 'email';
        state.sessionExpiry = action.payload.sessionExpiry;
        state.lastActivity = new Date().toISOString();
        state.securityLevel = 'medium';
        
        // Stockage du token dans localStorage
        if (action.payload.token) {
          localStorage.setItem('authToken', action.payload.token);
          console.log('🔑 Token stocké dans localStorage:', action.payload.token.substring(0, 20) + '...');
        }
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
          console.log('🔄 Refresh token stocké dans localStorage');
        }
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.securityLevel = 'critical';
      })
      
      // Login SSO
      .addCase(loginWithSSO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithSSO.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions;
        state.loginMethod = 'sso';
        state.sessionExpiry = action.payload.sessionExpiry;
        state.lastActivity = new Date().toISOString();
        state.securityLevel = 'high';
      })
      .addCase(loginWithSSO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.securityLevel = 'critical';
      })
      
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.sessionExpiry = action.payload.sessionExpiry;
        state.lastActivity = new Date().toISOString();
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.sessionExpiry = null;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.permissions = [];
        state.loginMethod = null;
        state.sessionExpiry = null;
        state.lastActivity = new Date().toISOString();
        state.securityLevel = 'low';
        
        // Suppression des tokens du localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      })
      
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.lastActivity = new Date().toISOString();
      })
      
      // Change Password
      .addCase(changePassword.fulfilled, (state) => {
        state.lastActivity = new Date().toISOString();
        state.securityLevel = 'high';
      })
      
      // Enable Two Factor
      .addCase(enableTwoFactor.fulfilled, (state) => {
        state.securityLevel = 'high';
      })
      
      // Verify Two Factor
      .addCase(verifyTwoFactor.fulfilled, (state) => {
        state.securityLevel = 'high';
      });
  },
});

export const {
  checkPermission,
  updateSecurityLevel,
  updateLastActivity,
  clearError,
  setSessionExpiry,
  extendSession,
  addPermission,
  removePermission,
  updatePermissions,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;
export const selectLoginMethod = (state: { auth: AuthState }) => state.auth.loginMethod;
export const selectSecurityLevel = (state: { auth: AuthState }) => state.auth.securityLevel;

// Helper functions exportées
export const hasPermissionSelector = (resource: string, action: string, scope?: string) => 
  (state: { auth: AuthState }) => {
    const user = state.auth.user;
    if (!user) return false;
    return hasPermission(user, resource, action, scope);
  };

export const canManageTeam = (state: { auth: AuthState }) => {
  const user = state.auth.user;
  if (!user) return false;
  return user.role === 'manager' || user.role === 'hr_officer' || user.role === 'hr_head';
};

export const canManageAll = (state: { auth: AuthState }) => {
  const user = state.auth.user;
  if (!user) return false;
  return user.role === 'hr_officer' || user.role === 'hr_head' || user.role === 'admin';
};

export default authSlice.reducer;