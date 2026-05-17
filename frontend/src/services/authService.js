import api from './api'

export const register = (data) => api.post('/auth/register', data, {
	headers: { 'Content-Type': 'application/json' },
})

export const login = (data) => api.post('/auth/login', data, {
	headers: { 'Content-Type': 'application/json' },
})

export const getMe = () => api.get('/auth/me')
