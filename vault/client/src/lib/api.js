import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  regenerate2fa: () => api.post('/auth/2fa/regenerate'),
};

export const vaultApi = {
  list: () => api.get('/vault'),
  create: (payload) => api.post('/vault', payload),
  get: (id) => api.get(`/vault/${id}`),
  remove: (id) => api.delete(`/vault/${id}`),
  share: (id, expiresInMinutes) => api.post(`/vault/${id}/share`, { expiresInMinutes }),
};

export const auditApi = {
  list: () => api.get('/audit'),
};

export const securityApi = {
  dashboard: () => api.get('/security/dashboard'),
  updateDeadManSwitch: (payload) => api.put('/security/dead-man-switch', payload),
  triggerDeadManSwitch: () => api.post('/security/dead-man-switch/trigger'),
  deadManEvents: () => api.get('/security/dead-man-switch/events'),
};

export default api;
