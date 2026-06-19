import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'code' | 'done'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.forgotPassword({ email })
      if (!res.data.success) { setError(res.data.message); return }
      setStep('code')
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
    if (code.length !== 6) { setError('Enter the 6-digit code from your email'); return }
    setLoading(true)
    try {
      const res = await authApi.resetPassword({ email, code, password })
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
          {step === 'email' && (
            <>
              <h2 className="text-lg font-bold text-[#172B4D] mb-1">Forgot your password?</h2>
              <p className="text-sm text-[#6B778C] mb-5">
                Enter your email and we'll send a 6-digit reset code.
              </p>
              {error && <div className="mb-4 px-4 py-3 rounded-lg border text-sm font-medium"
                style={{ background: '#FFEBE6', borderColor: '#FFBDAD', color: '#BF2600' }}>{error}</div>}
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input type="email" required autoFocus value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Enter code + new password */}
          {step === 'code' && (
            <>
              <h2 className="text-lg font-bold text-[#172B4D] mb-1">Check your email</h2>
              <p className="text-sm text-[#6B778C] mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-[#172B4D] mb-4">{email}</p>

              {error && <div className="mb-4 px-4 py-3 rounded-lg border text-sm font-medium"
                style={{ background: '#FFEBE6', borderColor: '#FFBDAD', color: '#BF2600' }}>{error}</div>}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="label">6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    autoFocus
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 382910"
                    className="input tracking-widest text-center text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="label">New password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" className="input pr-10" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B778C] hover:text-[#172B4D]">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm new password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} required
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat password" className="input pr-10" />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B778C] hover:text-[#172B4D]">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-60">
                  {loading ? 'Updating...' : 'Reset password'}
                </button>
              </form>

              <button
                onClick={() => { setStep('email'); setError(''); setCode('') }}
                className="mt-3 text-xs text-[#6B778C] hover:text-[#172B4D] w-full text-center"
              >
                Didn't receive the code? Go back
              </button>
            </>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#E3FCEF' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006644" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#172B4D] mb-2">Password updated!</h2>
              <p className="text-sm text-[#6B778C] mb-5">
                Your password has been changed. You can now log in.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">Go to login</Link>
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
