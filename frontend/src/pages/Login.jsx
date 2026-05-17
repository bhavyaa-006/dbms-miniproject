import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { login } from '../services/authService'

export default function Login() {
  const { login: setAuth } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      setAuth(res.data.access_token, res.data.user)
      addToast(`Welcome back, ${res.data.user.name}!`, 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Sign in</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Welcome back to Campus L&amp;F</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input id="login-email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            placeholder="you@campus.edu" className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input id="login-password" name="password" type="password" required
            value={form.password} onChange={handleChange}
            placeholder="••••••••" className="input" />
        </div>
        <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="bg-surface-2 rounded-lg p-3 text-xs text-zinc-500 border border-white/5 space-y-1">
        <p className="font-medium text-zinc-400">Demo accounts:</p>
        <p>Admin: admin@campus.edu / admin123</p>
        <p>Student: alice@campus.edu / alice123</p>
      </div>

      <p className="text-center text-xs text-zinc-500">
        No account?{' '}
        <Link to="/register" className="text-accent hover:text-accent-hover transition-colors">
          Register here
        </Link>
      </p>
    </div>
  )
}
