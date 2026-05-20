import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nn_token');
      localStorage.removeItem('nn_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  submitVerification: (data: object) => api.post('/auth/verify', data),
  simulateVerification: () => api.post('/auth/simulate-verify'),
};

// Users
export const usersAPI = {
  getProfile: (id: string) => api.get(`/users/profile/${id}`),
  updateMe: (data: object) => api.put('/users/me', data),
  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get(`/users/nearby?lat=${lat}&lng=${lng}&radius=${radius || 10}`),
  getBloodDonors: (params?: object) => api.get('/users/blood-donors', { params }),
};

// Posts
export const postsAPI = {
  getAll: (params?: object) => api.get('/posts', { params }),
  getById: (id: string) => api.get(`/posts/${id}`),
  create: (data: object) => api.post('/posts', data),
  update: (id: string, data: object) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  updateStatus: (id: string, data: object) => api.patch(`/posts/${id}/status`, data),
  getMyPosts: () => api.get('/posts/my-posts'),
  getNearby: (lat: number, lng: number, radius?: number, params?: object) =>
    api.get(`/posts/nearby?lat=${lat}&lng=${lng}&radius=${radius || 10}`, { params }),
};

// Messages
export const messagesAPI = {
  getThreads: () => api.get('/threads'),
  createThread: (data: object) => api.post('/threads', data),
  getMessages: (threadId: string) => api.get(`/threads/${threadId}/messages`),
  sendMessage: (threadId: string, text: string) =>
    api.post(`/threads/${threadId}/messages`, { text }),
};

// AI
export const aiAPI = {
  getMatches: (postId: string) => api.get(`/ai/matches/${postId}`),
  getTrends: () => api.get('/ai/trends'),
  generatePlan: (data: object) => api.post('/ai/action-plan', data),
  getLogisticsPlan: () => api.get('/ai/logistics-plan'),
  getCommunityPulse: () => api.get('/ai/community-pulse'),
};

// Initiatives
export const initiativesAPI = {
  getAll: () => api.get('/initiatives'),
  create: (data: object) => api.post('/initiatives', data),
  update: (id: string, data: object) => api.put(`/initiatives/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/initiatives/${id}/status`, { status }),
};

// Admin
export const adminAPI = {
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  getPosts: (params?: object) => api.get('/admin/posts', { params }),
  verifyUser: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/verify`, { status }),
  assignBadge: (id: string, badge: string) =>
    api.patch(`/admin/users/${id}/badges`, { badge }),
  deletePost: (id: string) => api.delete(`/admin/posts/${id}`),
};

export default api;
