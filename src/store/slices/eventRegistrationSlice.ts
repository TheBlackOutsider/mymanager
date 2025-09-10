import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eventRegistrationApi } from '../../services/api';
import { 
  EventRegistration, 
  RegistrationRequest, 
  RegistrationResponse, 
  RegistrationConflict,
  EventCapacity 
} from '../../types';

// Types sécurisés pour l'état
interface EventRegistrationState {
  registrations: EventRegistration[];
  conflicts: RegistrationConflict[];
  capacities: EventCapacity[];
  loading: boolean;
  error: string | null;
  currentRegistration: EventRegistration | null;
  security: {
    lastActivity: string;
    failedAttempts: number;
    isLocked: boolean;
    lockoutUntil?: string;
  };
}

const initialState: EventRegistrationState = {
  registrations: [],
  conflicts: [],
  capacities: [],
  loading: false,
  error: null,
  currentRegistration: null,
  security: {
    lastActivity: new Date().toISOString(),
    failedAttempts: 0,
    isLocked: false,
  },
};

// Thunks sécurisés avec validation
export const registerForEvent = createAsyncThunk(
  'eventRegistration/registerForEvent',
  async (request: RegistrationRequest, { rejectWithValue, getState }) => {
    try {
      // Validation de sécurité côté client
      if (!request.eventId || !request.employeeId) {
        throw new Error('Données d\'inscription invalides');
      }

      // Vérification du verrouillage de sécurité
      const state = getState() as any;
      if (state.eventRegistration.security.isLocked) {
        const lockoutUntil = new Date(state.eventRegistration.security.lockoutUntil);
        if (new Date() < lockoutUntil) {
          throw new Error('Compte temporairement verrouillé pour des raisons de sécurité');
        }
      }

      const response = await eventRegistrationApi.register(request);
      
      // Audit trail de sécurité
      console.log(`[SECURITY] Registration attempt for event ${request.eventId} by employee ${request.employeeId}`);
      
      return response;
    } catch (error: any) {
      // Gestion des erreurs de sécurité
      if (error.response?.status === 429) {
        throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
      }
      if (error.response?.status === 403) {
        throw new Error('Accès refusé. Vérifiez vos permissions.');
      }
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  }
);

export const cancelRegistration = createAsyncThunk(
  'eventRegistration/cancelRegistration',
  async (registrationId: string, { rejectWithValue, getState }) => {
    try {
      // Validation de sécurité
      if (!registrationId) {
        throw new Error('ID d\'inscription invalide');
      }

      const response = await eventRegistrationApi.cancel(registrationId);
      
      // Audit trail
      console.log(`[SECURITY] Registration cancellation: ${registrationId}`);
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de l\'annulation');
    }
  }
);

export const fetchRegistrations = createAsyncThunk(
  'eventRegistration/fetchRegistrations',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventRegistrationApi.getByEvent(eventId);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération des inscriptions');
    }
  }
);

export const checkConflicts = createAsyncThunk(
  'eventRegistration/checkConflicts',
  async (request: RegistrationRequest, { rejectWithValue }) => {
    try {
      const response = await eventRegistrationApi.checkConflicts(request);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la vérification des conflits');
    }
  }
);

export const fetchEventCapacity = createAsyncThunk(
  'eventRegistration/fetchEventCapacity',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventRegistrationApi.getCapacity(eventId);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération de la capacité');
    }
  }
);

const eventRegistrationSlice = createSlice({
  name: 'eventRegistration',
  initialState,
  reducers: {
    // Actions de sécurité
    updateSecurityStatus: (state, action: PayloadAction<Partial<EventRegistrationState['security']>>) => {
      state.security = { ...state.security, ...action.payload };
    },
    
    incrementFailedAttempts: (state) => {
      state.security.failedAttempts += 1;
      state.security.lastActivity = new Date().toISOString();
      
      // Verrouillage automatique après 5 tentatives échouées
      if (state.security.failedAttempts >= 5) {
        state.security.isLocked = true;
        state.security.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
      }
    },
    
    resetSecurityStatus: (state) => {
      state.security.failedAttempts = 0;
      state.security.isLocked = false;
      state.security.lockoutUntil = undefined;
      state.security.lastActivity = new Date().toISOString();
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setCurrentRegistration: (state, action: PayloadAction<EventRegistration | null>) => {
      state.currentRegistration = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register for Event
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action: PayloadAction<RegistrationResponse>) => {
        state.loading = false;
        if (action.payload.success) {
          // Réinitialisation du statut de sécurité en cas de succès
          state.security.failedAttempts = 0;
          state.security.isLocked = false;
          state.security.lockoutUntil = undefined;
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de l\'inscription';
        // Incrémentation des tentatives échouées
        state.security.failedAttempts += 1;
      })
      
      // Cancel Registration
      .addCase(cancelRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRegistration.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de l\'annulation';
      })
      
      // Fetch Registrations
      .addCase(fetchRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.registrations = action.payload.data || [];
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la récupération des inscriptions';
      })
      
      // Check Conflicts
      .addCase(checkConflicts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkConflicts.fulfilled, (state, action) => {
        state.loading = false;
        state.conflicts = action.payload.conflicts || [];
      })
      .addCase(checkConflicts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la vérification des conflits';
      })
      
      // Fetch Event Capacity
      .addCase(fetchEventCapacity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventCapacity.fulfilled, (state, action) => {
        state.loading = false;
        state.capacities = [action.payload.data];
      })
      .addCase(fetchEventCapacity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la récupération de la capacité';
      });
  },
});

export const {
  updateSecurityStatus,
  incrementFailedAttempts,
  resetSecurityStatus,
  clearError,
  setCurrentRegistration,
} = eventRegistrationSlice.actions;

export default eventRegistrationSlice.reducer; 