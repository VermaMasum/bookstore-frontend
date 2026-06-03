import { useState, useEffect } from 'react'
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom'

const Icon = {
  dash:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  buy:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  vendor:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  school:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  inv:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  pay:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  eod:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  layers:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  bldg:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  truck:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  store:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  cap:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  chevron: (open) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

const mainNav = [
  { label: 'Dashboard',    path: '/',                icon: Icon.dash,   color: '#818CF8', glow: 'rgba(99,102,241,0.35)' },
  { label: 'Buy Stock',    path: '/purchase-orders', icon: Icon.buy,    color: '#FCD34D', glow: 'rgba(245,158,11,0.35)' },
  { label: 'Vendor Sales', path: '/vendor-orders',   icon: Icon.vendor, color: '#60A5FA', glow: 'rgba(59,130,246,0.35)' },
  { label: 'School Sales', path: '/school-orders',   icon: Icon.school, color: '#34D399', glow: 'rgba(16,185,129,0.35)' },
  { label: 'Inventory',    path: '/inventory',       icon: Icon.inv,    color: '#C084FC', glow: 'rgba(139,92,246,0.35)' },
  { label: 'Payments',     path: '/payments',        icon: Icon.pay,    color: '#F472B6', glow: 'rgba(236,72,153,0.35)' },
  { label: 'End of Day',   path: '/reconciliation',  icon: Icon.eod,    color: '#94A3B8', glow: 'rgba(100,116,139,0.3)' },
]

const setupNav = [
  { label: 'Publishers', path: '/publishers', icon: Icon.bldg },
  { label: 'Suppliers',  path: '/suppliers',  icon: Icon.truck },
  { label: 'Vendors',    path: '/vendors',    icon: Icon.store },
  { label: 'Schools',    path: '/schools',    icon: Icon.cap },
  { label: 'Books',      path: '/books',      icon: Icon.book },
  { label: 'Book Sets',  path: '/book-sets',  icon: Icon.layers },
]

const setupFlow = [
  { path: '/publishers', label: 'Publishers' },
  { path: '/suppliers',  label: 'Suppliers' },
  { path: '/vendors',    label: 'Vendors' },
  { path: '/schools',    label: 'Schools' },
  { path: '/books',      label: 'Books' },
  { path: '/book-sets',  label: 'Book Sets' },
]

const titles = {
  '/': 'Dashboard', '/books': 'Books', '/publishers': 'Publishers',
  '/suppliers': 'Suppliers', '/vendors': 'Vendors', '/schools': 'Schools',
  '/inventory': 'Inventory', '/purchase-orders': 'Buy Stock',
  '/vendor-orders': 'Vendor Sales', '/book-sets': 'Book Sets',
  '/school-orders': 'School Sales', '/payments': 'Payments',
  '/reconciliation': 'End of Day',
}

const subtitles = {
  '/': 'Overview & quick actions',
  '/books': 'Manage your book catalog',
  '/inventory': 'Track stock levels',
  '/purchase-orders': 'Order from suppliers',
  '/vendor-orders': 'Wholesale dispatch',
  '/school-orders': 'School deliveries',
  '/payments': 'Record & track payments',
  '/reconciliation': 'End-of-day summary',
  '/book-sets': 'Group books by school',
  '/publishers': 'Publisher master data',
  '/suppliers': 'Supplier master data',
  '/vendors': 'Vendor master data',
  '/schools': 'School master data',
}

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [setupOpen, setSetupOpen] = useState(setupNav.some(s => s.path === pathname))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}') || {}
  const initial = (user.name || 'U')[0].toUpperCase()

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0F2F7' }}>

      {/* ═══ MOBILE BACKDROP ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[232px] flex flex-col overflow-y-auto transition-transform duration-300
          md:relative md:translate-x-0 md:shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, #13111E 0%, #1C1929 60%, #13111E 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-b"
          style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }} />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 0 20px rgba(99,102,241,0.5), 0 4px 12px rgba(0,0,0,0.3)',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <p className="font-black text-[14px] leading-tight tracking-tight"
              style={{ background: 'linear-gradient(135deg, #C7D2FE, #E9D5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BookStore
            </p>
            <p className="text-[10px] leading-tight mt-0.5 font-medium" style={{ color: '#4B5563' }}>Management</p>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 pt-5 pb-3">
          <p className="text-[9px] font-bold uppercase tracking-widest px-3 mb-3" style={{ color: '#374151' }}>Operations</p>
          <div className="space-y-0.5">
            {mainNav.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${isActive ? 'text-white' : 'text-[#6B7280] hover:text-[#9CA3AF]'}`
                }
                style={({ isActive }) => isActive ? {
                  background: `linear-gradient(135deg, ${item.color}18, ${item.color}0A)`,
                  boxShadow: `inset 0 0 0 1px ${item.color}30, 0 0 12px ${item.glow}`,
                } : {}}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                        style={{ background: `linear-gradient(180deg, ${item.color}, ${item.color}80)`, boxShadow: `0 0 6px ${item.color}` }} />
                    )}
                    <span className="shrink-0 transition-all duration-150"
                      style={{ color: isActive ? item.color : undefined, filter: isActive ? `drop-shadow(0 0 4px ${item.glow})` : undefined }}>
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-medium leading-tight flex-1">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Setup section */}
          <div className="mt-5">
            <button onClick={() => setSetupOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all hover:bg-white/5 group"
              style={{ color: '#4B5563' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest group-hover:text-[#6B7280] transition-colors">Setup</p>
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{Icon.chevron(setupOpen)}</span>
            </button>
            {setupOpen && (
              <div className="mt-1 space-y-0.5">
                {setupNav.map(({ path, label, icon }) => (
                  <NavLink key={path} to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                       ${isActive
                         ? 'text-white bg-white/8'
                         : 'text-[#6B7280] hover:text-[#9CA3AF] hover:bg-white/5'}`
                    }>
                    <span className="opacity-60">{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                boxShadow: '0 0 10px rgba(245,158,11,0.4)',
              }}>
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">{user.name || 'User'}</p>
              <p className="text-[10px] truncate leading-tight" style={{ color: '#4B5563' }}>{user.email || ''}</p>
            </div>
            <button onClick={logout} title="Logout"
              className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10 hover:text-red-400"
              style={{ color: '#4B5563' }}>
              {Icon.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 h-[60px] bg-white"
          style={{ borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Hamburger — mobile only */}
            <button onClick={() => setSidebarOpen(o => !o)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Toggle menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-tight" style={{ color: '#0F172A' }}>
                {titles[pathname] || 'Bookstore'}
              </h1>
              <p className="text-[11px] leading-tight mt-px" style={{ color: '#94A3B8' }}>
                {subtitles[pathname] || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-semibold" style={{ color: '#374151' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                {new Date().toLocaleDateString('en-IN', { year: 'numeric' })}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 2px 8px rgba(245,158,11,0.35)' }}>
              {initial}
            </div>
          </div>
        </header>

        {/* Setup flow banner — only on setup pages */}
        {setupFlow.some(s => s.path === pathname) && (
          <div className="shrink-0 px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto"
            style={{ background: '#FAFBFF', borderBottom: '1px solid #EEF2FF' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 mr-1" style={{ color: '#94A3B8' }}>
              Setup order
            </span>
            {setupFlow.map((step, i) => {
              const isCurrent = step.path === pathname
              return (
                <div key={step.path} className="flex items-center gap-1.5 shrink-0">
                  {i > 0 && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  <NavLink to={step.path}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={isCurrent
                      ? { background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }
                      : { background: '#F1F5F9', color: '#64748B' }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{ background: isCurrent ? 'rgba(255,255,255,0.25)' : '#E2E8F0', color: isCurrent ? 'white' : '#94A3B8' }}>
                      {i + 1}
                    </span>
                    {step.label}
                  </NavLink>
                </div>
              )
            })}
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
