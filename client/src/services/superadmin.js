import api from './api';

export const superAdminService = {
  dashboard:              ()          => api.get('/superadmin/dashboard').then(r => r.data),
  getShops:               (params={}) => api.get('/superadmin/shops', { params }).then(r => r.data),
  getShop:                (id)        => api.get(`/superadmin/shops/${id}`).then(r => r.data),
  blockShop:              (id)        => api.patch(`/superadmin/shops/${id}/block`).then(r => r.data),
  unblockShop:            (id)        => api.patch(`/superadmin/shops/${id}/unblock`).then(r => r.data),
  updateSubscription:     (id, data)  => api.patch(`/superadmin/shops/${id}/subscription`, data).then(r => r.data),
  revenue:                ()          => api.get('/superadmin/stats/revenue').then(r => r.data),
  getPaymentRequests:     (status='PENDING') => api.get('/superadmin/payment-requests', { params: { status } }).then(r => r.data),
  approvePayment:         (id)        => api.patch(`/superadmin/payment-requests/${id}/approve`).then(r => r.data),
  rejectPayment:          (id, note)  => api.patch(`/superadmin/payment-requests/${id}/reject`, { note }).then(r => r.data),
};
