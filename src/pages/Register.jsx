import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authApi } from '../api'

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password })
      if (!res.data.success) { setError(res.data.message); return }
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Account created! Welcome.')
      navigate('/')
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg,#0052CC,#0747A6)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h1 className="text-xl font-black text-[#172B4D]">BookStore</h1>
          <p className="text-[#6B778C] text-sm mt-0.5">Management System</p>
        </div>

        <div className="card p-7">
          <h2 className="text-lg font-bold text-[#172B4D] mb-5">Create your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border text-sm font-medium"
              style={{ background: '#FFEBE6', borderColor: '#FFBDAD', color: '#BF2600' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" required autoFocus value={form.name} onChange={set('name')}
                placeholder="Your name" className="input" />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" className="input pr-10" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B778C] hover:text-[#172B4D]">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required value={form.confirm} onChange={set('confirm')}
                  placeholder="Repeat password" className="input pr-10" />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B778C] hover:text-[#172B4D]">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mt-1 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6B778C] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#0052CC] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
