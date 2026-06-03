import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

/* ── SVG Icons ── */
const I = {
  dash:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  inbox:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  send:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  cart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  box:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  card:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  cal:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  layers:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  bldg:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  truck:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  store:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  cap:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  gear:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  chevron: (open) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"/></svg>,
}

const main = [
  { label: 'Dashboard',    path: '/',                icon: I.dash,  hint: 'Overview & stats' },
  { label: 'Buy Stock',    path: '/purchase-orders', icon: I.inbox, hint: 'Purchase from suppliers' },
  { label: 'Vendor Sales', path: '/vendor-orders',   icon: I.send,  hint: 'Sell to retailers' },
  { label: 'School Sales', path: '/school-orders',   icon: I.cart,  hint: 'Sell to schools' },
  { label: 'Inventory',    path: '/inventory',       icon: I.box,   hint: 'Stock levels' },
  { label: 'Payments',     path: '/payments',        icon: I.card,  hint: 'Record payments' },
  { label: 'End of Day',   path: '/reconciliation',  icon: I.cal,   hint: 'Daily summary' },
]

const setup = [
  { label: 'Publishers', path: '/publishers', icon: I.bldg,   hint: 'Add before books' },
  { label: 'Suppliers',  path: '/suppliers',  icon: I.truck,  hint: 'Who you buy from' },
  { label: 'Vendors',    path: '/vendors',    icon: I.store,  hint: 'Wholesale buyers' },
  { label: 'Schools',    path: '/schools',    icon: I.cap,    hint: 'B2C customers' },
  { label: 'Books',      path: '/books',      icon: I.book,   hint: 'Catalog & pricing' },
  { label: 'Book Sets',  path: '/book-sets',  icon: I.layers, hint: 'Sets per class' },
]

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
         ${isActive
           ? 'bg-white/10 text-white nav-item-active'
           : 'text-slate-400 hover:bg-white/6 hover:text-slate-200'
         }`
      }
    >
      <span className="shrink-0 transition-transform duration-150 group-hover:scale-110">{item.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-tight truncate">{item.label}</p>
        {item.hint && (
          <p className="text-[10px] leading-tight mt-0.5 opacity-40">{item.hint}</p>
        )}
      </div>
    </NavLink>
  )
}

export default function Sidebar() {
  const [setupOpen, setSetupOpen] = useState(true)
  const loc = useLocation()
  const inSetup = setup.some(s => s.path === loc.pathname)

  return (
    <aside className="w-[220px] flex flex-col shrink-0 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #0F172A 0%, #111827 100%)' }}>

      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-[13px] leading-tight tracking-tight">BookStore</p>
            <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Management</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5">
        <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">Operations</p>
        {main.map(item => <NavItem key={item.path} item={item} />)}
      </nav>

      {/* Setup section */}
      <div className="px-3 pb-5 border-t border-white/5 pt-3">
        <button
          onClick={() => setSetupOpen(o => !o)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150
            ${inSetup ? 'text-slate-300 bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-2">
            {I.gear}
            <span className="text-[10px] font-bold uppercase tracking-widest">Setup</span>
          </div>
          {I.chevron(setupOpen)}
        </button>

        {(setupOpen || inSetup) && (
          <div className="mt-1 space-y-0.5 animate-slide-down">
            {setup.map(({ path, label, icon, hint }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-100
                   ${isActive
                     ? 'bg-white/10 text-white'
                     : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                   }`
                }
              >
                <span className="opacity-60 shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium leading-tight">{label}</p>
                  {hint && <p className="text-[10px] leading-tight mt-0.5 opacity-40">{hint}</p>}
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>

    </aside>
  )
}
