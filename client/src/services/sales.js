import api from './api';

export const salesService = {
  getAll:       (params = {}) => api.get('/sales', { params }).then(r => r.data),
  getOne:       (id)          => api.get(`/sales/${id}`).then(r => r.data),
  create:       (data)        => api.post('/sales', data).then(r => r.data),
  recordPayment:(id, data)    => api.post(`/sales/${id}/payment`, data).then(r => r.data),
};
