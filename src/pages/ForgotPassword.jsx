import { toast } from 'react-toastify'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'

export default function ForgotPassword() {
  const [step, setStep] = useState('request') // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devToken, setDevToken] = useState('') // shown in dev mode

  const handleRequest = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.forgotPassword({ email })
      if (!res.data.success) { setError(res.data.message); return }
      setMsg(res.data.message)
      if (res.data.resetToken) setDevToken(res.data.resetToken) // dev mode
      setStep('reset')
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await authApi.resetPassword({ token, password })
      if (!res.data.success) { setError(res.data.message); return }
      setStep('done')
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
        </div>

        <div className="card p-7">

          {/* Step 1: Enter email */}
          {step === 'request' && (
            <>
              <h2 className="text-lg font-bold text-[#172B4D] mb-1">Forgot your password?</h2>
              <p className="text-sm text-[#6B778C] mb-5">Enter your email and we'll send you a reset token.</p>
              {error && <div className="mb-4 px-4 py-3 rounded-lg border text-sm font-medium" style={{ background: '#FFEBE6', borderColor: '#FFBDAD', color: '#BF2600' }}>{error}</div>}
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send reset token'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Enter token + new password */}
          {step === 'reset' && (
            <>
              <h2 className="text-lg font-bold text-[#172B4D] mb-1">Reset your password</h2>
              <p className="text-sm text-[#6B778C] mb-4">{msg}</p>

              {devToken && (
                <div className="mb-4 px-4 py-3 rounded-lg border text-xs font-mono break-all"
                  style={{ background: '#FFFAE6', borderColor: '#FFE380', color: '#974F0C' }}>
                  <p className="font-bold mb-1 uppercase text-[10px]">Dev Mode — Reset Token:</p>
                  {devToken}
                </div>
              )}

              {error && <div className="mb-4 px-4 py-3 rounded-lg border text-sm font-medium" style={{ background: '#FFEBE6', borderColor: '#FFBDAD', color: '#BF2600' }}>{error}</div>}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="label">Reset token</label>
                  <input type="text" required value={token} onChange={e => setToken(e.target.value)}
                    placeholder="Paste token here" className="input font-mono text-xs" />
                </div>
                <div>
                  <label className="label">New password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" className="input" />
                </div>
                <div>
                  <label className="label">Confirm new password</label>
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password" className="input" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#E3FCEF' }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#006644" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2">Password reset!</h2>
              <p className="text-sm text-[#6B778C] mb-5">Your password has been updated successfully.</p>
              <Link to="/login" className="btn-primary w-full justify-center">Back to login</Link>
            </div>
          )}
        </div>

        {step !== 'done' && (
          <p className="text-center text-sm text-[#6B778C] mt-5">
            Remember it?{' '}
            <Link to="/login" className="font-semibold text-[#0052CC] hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
