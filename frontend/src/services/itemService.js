import api, { getApiErrorMessage } from './api'

export { getApiErrorMessage }

// ── Categories ─────────────────────────────────────────────────────────────
export const getCategories = async () => {
	const response = await api.get('/categories')
	return { ...response, data: response.data?.categories || [] }
}

// ── Lost Items ─────────────────────────────────────────────────────────────
export const getLostItems    = (params) => api.get('/lost-items', { params })
export const getMyLostItems  = ()       => api.get('/lost-items/my')
export const getLostItem     = (id)     => api.get(`/lost-items/${id}`)
export const createLostItem  = (form)   => api.post('/lost-items', form)   // FormData
export const updateLostItem  = (id, form) => api.put(`/lost-items/${id}`, form)
export const deleteLostItem  = (id)     => api.delete(`/lost-items/${id}`)

// ── Found Items ────────────────────────────────────────────────────────────
export const getFoundItems   = (params) => api.get('/found-items', { params })
export const getMyFoundItems = ()       => api.get('/found-items/my')
export const getFoundItem    = (id)     => api.get(`/found-items/${id}`)
export const createFoundItem = (form)   => api.post('/found-items', form)
export const updateFoundItem = (id, form) => api.put(`/found-items/${id}`, form)
export const deleteFoundItem = (id)     => api.delete(`/found-items/${id}`)

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats')
