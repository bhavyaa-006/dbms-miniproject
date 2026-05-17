import api, { getApiErrorMessage } from './api'

export { getApiErrorMessage }

// ── Categories ─────────────────────────────────────────────────────────────
export const getCategories = async () => {
	const response = await api.get('/categories')
	return { ...response, data: response.data || [] }
}

const multipartHeaders = {
	'Content-Type': 'multipart/form-data',
}

// ── Lost Items ─────────────────────────────────────────────────────────────
export const getLostItems    = (params) => api.get('/lost-items', { params })
export const getMyLostItems  = ()       => api.get('/lost-items/my')
export const getLostItem     = (id)     => api.get(`/lost-items/${id}`)
export const createLostItem  = (payload) => api.post('/lost-items', payload)
export const updateLostItem  = (id, payload) => api.put(`/lost-items/${id}`, payload)
export const deleteLostItem  = (id)     => api.delete(`/lost-items/${id}`)

// ── Found Items ────────────────────────────────────────────────────────────
export const getFoundItems   = (params) => api.get('/found-items', { params })
export const getMyFoundItems = ()       => api.get('/found-items/my')
export const getFoundItem    = (id)     => api.get(`/found-items/${id}`)
export const createFoundItem = (form)   => api.post('/found-items', form, { headers: multipartHeaders })
export const updateFoundItem = (id, form) => api.put(`/found-items/${id}`, form, { headers: multipartHeaders })
export const deleteFoundItem = (id)     => api.delete(`/found-items/${id}`)

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats')
