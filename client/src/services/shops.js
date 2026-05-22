import api from './api';

export const shopsService = {
  getMe:   ()     => api.get('/shops/me').then(r => r.data),
  updateMe: data  => api.patch('/shops/me', data).then(r => r.data),
};
