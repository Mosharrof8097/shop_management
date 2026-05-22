import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('hw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hw_token');
      localStorage.removeItem('hw_user');
      window.location.href = '/login';
    }
    if (err.response?.status === 403 &&
      (err.response?.data?.subscriptionExpired || err.response?.data?.shopBlocked)) {
      window.location.href = '/subscription/renew';
    }
    return Promise.reject(err);
  }
);

export default api;
