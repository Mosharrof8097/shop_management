import api from './api';

export const customersService = {
  getAll:       (params = {}) => api.get('/customers', { params }).then(r => r.data),
  getOne:       (id)          => api.get(`/customers/${id}`).then(r => r.data),
  getLedger:    (id, params)  => api.get(`/customers/${id}/ledger`, { params }).then(r => r.data),
  create:       (data)        => api.post('/customers', data).then(r => r.data),
  update:       (id, data)    => api.put(`/customers/${id}`, data).then(r => r.data),
  remove:       (id)          => api.delete(`/customers/${id}`).then(r => r.data),
  recordPayment:(data)        => api.post('/customers/payment', data).then(r => r.data),
};
