import axios from 'axios';

// Dynamically handle root endpoint version prefixes
const API_PREFIX = '/v1';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://192.168.1.37:5000/api${API_PREFIX}`,
  headers: { 'Content-Type': 'application/json' },
});

// ⚡ AUTOMATIC HEADER INTERCEPTOR: Injects token into every single outbound HTTP transaction request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aerofix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),

  // ⚡ Pre-registration security gateway challenge to verify email existence
  sendRegistrationOtp: (payload) => api.post('/auth/send-otp', payload),

  // Connects the final registration payload directly to your user provisioning controller
  register: (data) => api.post('/users', data),
};

export const aircraftService = {
  getAllAircraft: () => api.get('/aircraft'),
  getDashboard: (id) => api.get(`/aircraft/${id}/dashboard`),
  create: (data) => api.post('/aircraft', data),
};

export const workOrderService = {
  getAllWorkOrders: () => api.get('/work-orders'), // 🔥 Fetches the complete master list array
  getProgress: (id) => api.get(`/work-orders/${id}/progress`),
  create: (data) => api.post('/work-orders', data),
  addEngine: (data) => api.post('/aircraft/engines', data),
  addLogbookEntry: (data) => api.post('/aircraft/logbook-entries', data),
  addInspection: (data) => api.post('/aircraft/inspections', data),
  addCompliance: (data) => api.post('/aircraft/ad-compliance', data),
  addTaskCard: (data) => api.post('/work-orders/task-cards', data),
  addPart: (data) => api.post('/work-orders/parts', data),
  addStep: (data) => api.post('/work-orders/steps', data),
};

export const userService = {
  getAllUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateProfile: (id, data) => api.put(`/users/${id}/profile`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  // ⚡ UPDATED: Toggle or update account active status directly
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { is_active: isActive }),
};

// ⚡ Document Management & Table of Contents Search Index Subsystem
export const documentService = {
  getAll: () => api.get('/documents'),
  search: (query) => api.get('/documents/search', { params: { q: query } }),
  upload: (formData, onUploadProgress) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const userActivationService = {
  // Submit an approval/rejection action
  processApproval: (payload) => api.post('/activation-logs', payload),

  // Retrieve global paginated history
  getGlobalHistory: (limit, offset) =>
    api.get('/activation-logs', { params: { limit, offset } })
};

export const activityLogService = {
  getLogs: (params) => api.get('/activity-logs', { params }),
  getModules: () => api.get('/activity-logs/modules'),
  logActivity: (data) => api.post('/activity-logs', data)
};

export default api;