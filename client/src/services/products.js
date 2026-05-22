import api from './api';

export const productsService = {
  getAll:        (params = {}) => api.get('/products', { params }).then(r => r.data),
  getCategories: ()            => api.get('/products/categories').then(r => r.data),
  create:        (data)        => api.post('/products', data).then(r => r.data),
  update:        (id, data)    => api.put(`/products/${id}`, data).then(r => r.data),
  remove:        (id)          => api.delete(`/products/${id}`).then(r => r.data),
  stockHistory:  (id)          => api.get(`/products/${id}/stock-history`).then(r => r.data),
};
