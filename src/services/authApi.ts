import axios from 'axios';
import { LoginCredentials, LoginResponse, User, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => response.data, // Retourner seulement les données, pas la réponse complète
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApiService = {
  login: (credentials: LoginCredentials) =>
    authApi.post<ApiResponse<LoginResponse>>('/auth/email/login', credentials),
  
  emailLogin: (credentials: LoginCredentials) =>
    authApi.post<ApiResponse<LoginResponse>>('/auth/email/login', credentials),
  
  logout: () =>
    authApi.post('/auth/logout'),
  
  getCurrentUser: () =>
    authApi.get<ApiResponse<User>>('/auth/profile'),
  
  refreshToken: () =>
    authApi.post<ApiResponse<{ token: string }>>('/auth/refresh'),
};

// Export direct de l'API pour compatibilité
export const authApi = {
  emailLogin: (credentials: LoginCredentials) =>
    authApiService.emailLogin(credentials),
  
  ldapLogin: (credentials: any) =>
    authApi.post('/auth/ldap/login', credentials),
  
  ssoLogin: (provider: string) =>
    authApi.post(`/auth/sso/${provider}/login`),
  
  logout: () =>
    authApiService.logout(),
  
  refreshToken: () =>
    authApiService.refreshToken(),
};