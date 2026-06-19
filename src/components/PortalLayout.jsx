import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function PortalLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('portalUser') || '{}')

  const logout = () => {
    localStorage.removeItem('portalToken')
    localStorage.removeItem('portalUser')
    toast.success('Logged out')
    navigate('/portal/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-sm">BookStore · Customer Portal</span>
          </div>

          <nav className="flex items-center gap-1">
            {[
              { to: '/portal', label: 'Book Sets', end: true },
              { to: '/portal/my-orders', label: 'My Orders' },
            ].map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`
                }>
                {label}
              </NavLink>
            ))}
            <div className="ml-3 pl-3 border-l border-gray-100 flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:block">{user.name}</span>
              <button onClick={logout}
                className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
