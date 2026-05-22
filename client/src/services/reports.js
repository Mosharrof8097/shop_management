import api from './api';

export const reportsService = {
  dashboard:   ()             => api.get('/reports/dashboard').then(r => r.data),
  sales:       (params = {})  => api.get('/reports/sales', { params }).then(r => r.data),
  topProducts: (params = {})  => api.get('/reports/top-products', { params }).then(r => r.data),
  slowProducts:(params = {})  => api.get('/reports/slow-products', { params }).then(r => r.data),
  profitLoss:  (params = {})  => api.get('/reports/profit-loss', { params }).then(r => r.data),
  lowStock:    ()             => api.get('/reports/low-stock').then(r => r.data),
};
