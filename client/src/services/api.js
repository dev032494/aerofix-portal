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
  create: (data) => api.post('/aircraft', data),
  delete: (id) => api.delete(`/aircraft/${id}`),
  update: (id, data) => api.put(`/aircraft/${id}`, data),
  getById: (id) => api.get(`/aircraft/${id}`),
  getByRegistration: (registrationNumber) => api.get(`/aircraft/registration/${registrationNumber}`),
};

export const workOrderService = {
  getAllWorkOrders: () => api.get('/work-orders'),
  createWorkOrder: (data) => api.post('/work-orders', data),
  getInstructors: () => api.get('/instructors'),
  viewWorkOrderDetails: (id) => api.get(`/work-orders/view-details/${id}`),
  studentTask: (id) => api.get(`/work-orders/student/${id}`),
  startTask: (id, data) => api.put(`/work-orders/start-task/${id}`, data),
  submitReport: (id, data) => api.put(`/work-orders/report/${id}`, data),
  viewReport: (id) => api.get(`/work-orders/view-report/${id}`)
};

export const userService = {
  getAllUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateProfile: (id, data) => api.put(`/users/${id}/profile`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  // ⚡ UPDATED: Toggle or update account active status directly
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { is_active: isActive }),
  getAllStudentRole: () => api.get('/users/students')
};

// ⚡ INSTRUCTOR CADRE MANAGEMENT SERVICES
export const instructorService = {
  getAllInstructors: () => api.get('/instructors'),
  getInstructorById: (id) => api.get(`/instructors/${id}`),
  createInstructor: (data) => api.post('/instructors', data),
  updateInstructor: (id, data) => api.put(`/instructors/${id}`, data),
  deleteInstructor: (id) => api.delete(`/instructors/${id}`),
  updateStatus: (id, isActive) => api.patch(`/instructors/${id}/status`, { i_status: isActive }),
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

export const workOrderListService = {
  getAll: () => api.get('/work-order-list'),
  create: (data) => api.post('/work-order-list', data),
  update: (id, data) => api.put(`/work-order-list/${id}`, data),
  delete: (id) => api.delete(`/work-order-list/${id}`),

};


export default api;