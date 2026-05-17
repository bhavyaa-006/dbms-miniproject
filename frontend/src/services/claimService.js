import api from './api'

export const submitClaim       = (data)     => api.post('/claims', data)
export const getAllClaims       = ()         => api.get('/claims')
export const getMyClaims       = ()         => api.get('/claims/my')
export const updateClaimStatus = (id, data) => api.put(`/claims/${id}`, data)

export const getNotifications  = ()     => api.get('/notifications')
export const markRead          = (id)   => api.put(`/notifications/${id}/read`)
export const markAllRead       = ()     => api.put('/notifications/read-all')
