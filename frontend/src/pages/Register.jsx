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
      addToast('ERROR: Password must be >= 6 characters', 'warning')
      return
    }
    setLoading(true)
    try {
      const res = await register(form)
      setAuth(res.data.access_token, res.data.user)
      addToast('ENTITY REGISTERED! Welcome aboard.', 'success')
      navigate('/dashboard')
    } catch (err) {
      console.error('Registration API failed:', err)
      addToast(getApiErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-vt text-text-primary uppercase tracking-widest drop-shadow-[1px_1px_0px_#000]">New Entity Registration</h2>
        <p className="text-sm font-vt text-accent-secondary mt-1 tracking-widest uppercase">&gt; Initialize new user profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; IDENTIFIER (NAME)</label>
          <input id="reg-name" name="name" type="text" required
            value={form.name} onChange={handleChange}
            placeholder="JOHN DOE" className="input uppercase" />
        </div>
        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; CONTACT_EMAIL</label>
          <input id="reg-email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            placeholder="USER@DOMAIN.COM" className="input uppercase" />
        </div>
        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; SECURITY_KEY (PASSWORD)</label>
          <input id="reg-password" name="password" type="password" required
            value={form.password} onChange={handleChange}
            placeholder="********" className="input" />
        </div>
        <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full mt-2 border-accent shadow-pixel-accent text-sm">
          {loading ? 'INITIALIZING...' : 'REGISTER.EXE'}
        </button>
      </form>

      <div className="pt-4 border-t-2 border-border mt-4">
        <p className="text-center text-sm font-vt text-text-secondary tracking-widest uppercase">
          &gt; Already Registered?{' '}
          <Link to="/login" className="text-accent-secondary hover:text-white transition-colors drop-shadow-[1px_1px_0px_#000]">
            PROCEED TO LOGIN
          </Link>
        </p>
      </div>
    </div>
  )
}
