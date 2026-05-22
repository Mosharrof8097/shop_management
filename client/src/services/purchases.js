import api from './api';

export const purchasesService = {
  getAll:      (params = {}) => api.get('/purchases', { params }).then(r => r.data),
  getOne:      (id)          => api.get(`/purchases/${id}`).then(r => r.data),
  create:      (data)        => api.post('/purchases', data).then(r => r.data),
  getSuppliers:()            => api.get('/purchases/suppliers/list').then(r => r.data),
};
