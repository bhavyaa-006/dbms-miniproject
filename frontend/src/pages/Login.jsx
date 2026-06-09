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
      addToast(`ACCESS GRANTED: Welcome, ${res.data.user.name}!`, 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.detail || 'ACCESS DENIED', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-vt text-text-primary uppercase tracking-widest drop-shadow-[1px_1px_0px_#000]">Authenticate</h2>
        <p className="text-sm font-vt text-accent-secondary mt-1 tracking-widest uppercase">&gt; Enter credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; USER_EMAIL</label>
          <input id="login-email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            placeholder="USER@DOMAIN.COM" className="input uppercase" />
        </div>
        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; PASSWORD_KEY</label>
          <input id="login-password" name="password" type="password" required
            value={form.password} onChange={handleChange}
            placeholder="********" className="input" />
        </div>
        <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full mt-2 border-accent shadow-pixel-accent text-sm">
          {loading ? 'AUTHENTICATING...' : 'LOGIN.EXE'}
        </button>
      </form>

      <div className="pt-4 border-t-2 border-border mt-4">
        <p className="text-center text-sm font-vt text-text-secondary tracking-widest uppercase">
          &gt; Unregistered Entity?{' '}
          <Link to="/register" className="text-accent-secondary hover:text-white transition-colors drop-shadow-[1px_1px_0px_#000]">
            INITIATE REGISTRATION
          </Link>
        </p>
      </div>
    </div>
  )
}
