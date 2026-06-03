import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authApi } from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form)
      if (!res.data.success) { setError(res.data.message); return }
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
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

        {/* Logo */}
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

        {/* Card */}
        <div className="card p-7">
          <h2 className="text-lg font-bold text-[#172B4D] mb-5">Log in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border text-sm font-medium"
              style={{ background: '#FFEBE6', borderColor: '#FFBDAD', color: '#BF2600' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required autoFocus
                value={form.email} onChange={set('email')}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-[#0052CC] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" required
                value={form.password} onChange={set('password')}
                placeholder="Enter your password"
                className="input"
              />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mt-1 disabled:opacity-60">
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6B778C] mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#0052CC] hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
