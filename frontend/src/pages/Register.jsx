import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { register } from '../services/authService'
import { getApiErrorMessage } from '../services/api'

export default function Register() {
  const { login: setAuth } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning')
      return
    }
    setLoading(true)
    try {
      const res = await register(form)
      setAuth(res.data.access_token, res.data.user)
      addToast('Account created! Welcome aboard 🎉', 'success')
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration API failed:', err)
      addToast(getApiErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Create account</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Join Campus L&amp;F today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input id="reg-name" name="name" type="text" required
            value={form.name} onChange={handleChange}
            placeholder="Full name" className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input id="reg-email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            placeholder="Email address" className="input" />
        </div>
        <div>
          <label className="label">Password</label>
          <input id="reg-password" name="password" type="password" required
            value={form.password} onChange={handleChange}
            placeholder="Create a password" className="input" />
        </div>
        <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
