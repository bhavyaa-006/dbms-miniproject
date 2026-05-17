import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL is not set. Configure the Render backend URL in your frontend environment.')
}

const API_BASE = `${API_URL.replace(/\/$/, '')}/api`

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — token expired or invalid
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export { API_URL }
export const getApiErrorMessage = (error) => {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') {
    return detail
  }

  const message = error?.response?.data?.message
  if (typeof message === 'string') {
    return message
  }

  const fallback = error?.message
  return fallback || 'Request failed'
}

export default api
