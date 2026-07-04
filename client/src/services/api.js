import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.37:5000/api/v1',
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
  
  // ⚡ ADDED: Triggers the pre-registration security gateway challenge to verify email existence
  sendRegistrationOtp: (payload) => api.post('/auth/send-otp', payload),
  
  // Connects the final registration payload (including the verified token parameter)
  // directly to your user provisioning controller method layout path.
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
  updateProfile: (id, data) => api.put(`/users/${id}/profile`),
  updatePassword: (id, data) => api.put(`/users/${id}/password`),
};


export default api;