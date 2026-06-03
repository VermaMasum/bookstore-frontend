import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { books, inventory, purchaseOrders, vendorOrders, schoolOrders, payments } from '../api'

function Bar({ h }) {
  return <div className="w-1.5 rounded-sm" style={{ height: `${h}%`, background: 'rgba(255,255,255,0.55)' }} />
}

function StatCard({ label, value, sub, gradient, icon, bars, to }) {
  return (
    <Link to={to}
      className="relative overflow-hidden rounded-2xl p-4 flex flex-col gap-2 group transition-all duration-200 hover:-translate-y-1"
      style={{ background: gradient, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      <div className="flex items-start justify-between relative z-10">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg backdrop-blur-sm">
          {icon}
        </div>
        <div className="flex items-end gap-0.5 h-7">
          {bars.map((h, i) => <Bar key={i} h={h} />)}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">{label}</p>
        <p className="text-white text-xl font-black leading-tight mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-white/55 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </Link>
  )
}

function RevenueBar({ label, value, max, color, trackColor }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: '#64748B' }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: trackColor }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [s, setS] = useState({
    books: 0, stock: 0, lowStock: 0,
    pendingPO: 0, pendingVO: 0, pendingSO: 0,
    todayB2B: 0, todayB2C: 0, totalPaid: 0,
  })
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}') || {}

  useEffect(() => {
    Promise.all([
      books.getAll(), inventory.getAll(), inventory.getLowStock(10),
      purchaseOrders.getAll(), vendorOrders.getAll(), schoolOrders.getAll(), payments.getAll(),
    ]).then(([b, inv, low, po, vo, so, pay]) => {
      const totalStock = inv.data.data.reduce((a, i) => a + i.quantity, 0)
      const b2b = vo.data.data.filter(o => o.status === 'DISPATCHED')
        .reduce((a, o) => a + o.items.reduce((aa, i) => aa + parseFloat(i.unitPrice) * i.quantity, 0), 0)
      const b2c = so.data.data.filter(o => ['DELIVERED', 'PARTIAL'].includes(o.status))
        .reduce((a, o) => a + o.items.reduce((aa, i) => aa + parseFloat(i.unitPrice) * i.qtyDelivered, 0), 0)
      const paid = pay.data.data.reduce((a, p) => a + parseFloat(p.amount), 0)
      setS({
        books: b.data.data.length, stock: totalStock, lowStock: low.data.data.length,
        pendingPO: po.data.data.filter(o => o.status === 'PENDING').length,
        pendingVO: vo.data.data.filter(o => o.status === 'PENDING').length,
        pendingSO: so.data.data.filter(o => ['PENDING', 'PARTIAL'].includes(o.status)).length,
        todayB2B: b2b.toFixed(0), todayB2C: b2c.toFixed(0), totalPaid: paid.toFixed(0),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pending = s.pendingPO + s.pendingVO + s.pendingSO
  const v = x => loading ? '—' : x
  const greetHour = new Date().getHours()
  const greet = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening'
  const maxSales = Math.max(Number(s.todayB2B), Number(s.todayB2C), 1)

  return (
    <div className="space-y-3">

      {/* ── HERO ── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 55%, #1A1A2E 100%)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
        }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.2), transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <p className="text-indigo-300/80 text-[11px] font-semibold tracking-wide">{greet}</p>
            </div>
            <h1 className="text-white text-2xl font-black tracking-tight leading-tight">
              {user.name || 'Welcome back'} 👋
            </h1>
            <p className="mt-1 text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {loading ? 'Loading your dashboard...'
                : pending > 0 ? `${pending} pending action${pending > 1 ? 's' : ''} need your attention`
                : '✓ Everything is up to date — great work!'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <Link to="/purchase-orders"
              className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.45)' }}>
              + Buy Stock
            </Link>
            <Link to="/school-orders"
              className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
              + School Order
            </Link>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Books in Catalog" value={v(s.books)} sub="unique titles"
          gradient="linear-gradient(135deg, #4F46E5, #7C3AED)" icon="📚"
          bars={[40,60,50,80,65,90,75]} to="/books" />
        <StatCard label="Total Stock" value={v(Number(s.stock).toLocaleString())} sub="units available"
          gradient="linear-gradient(135deg, #0284C7, #4F46E5)" icon="📦"
          bars={[70,55,80,60,75,85,70]} to="/inventory" />
        <StatCard label="Low Stock" value={v(s.lowStock)}
          sub={!loading ? (s.lowStock > 0 ? 'need restocking' : 'all levels ok') : ''}
          gradient={!loading && s.lowStock > 0 ? 'linear-gradient(135deg, #DC2626, #EA580C)' : 'linear-gradient(135deg, #059669, #0D9488)'}
          icon={!loading && s.lowStock > 0 ? '⚠️' : '✅'}
          bars={[60,45,70,55,65,50,40]} to="/inventory" />
        <StatCard label="Total Collected" value={v('₹' + Number(s.totalPaid).toLocaleString())} sub="all payments"
          gradient="linear-gradient(135deg, #D97706, #DC2626)" icon="💰"
          bars={[50,70,60,85,75,90,80]} to="/payments" />
      </div>

      {/* ── MAIN ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Pending actions */}
        <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: pending > 0 ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' }}>
                <span className="text-sm">{pending > 0 ? '🔔' : '✅'}</span>
              </div>
              <div>
                <h2 className="font-bold text-[14px]" style={{ color: '#0F172A' }}>Pending Actions</h2>
                <p className="text-[10px]" style={{ color: '#94A3B8' }}>
                  {loading ? 'Loading...' : pending > 0 ? 'Needs your attention' : 'All caught up!'}
                </p>
              </div>
            </div>
            {!loading && pending > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#FEE2E2' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold" style={{ color: '#DC2626' }}>{pending} open</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#F1F5F9' }} />)}
            </div>
          ) : pending === 0 ? (
            <div className="text-center py-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2"
                style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', boxShadow: '0 4px 16px rgba(16,185,129,0.2)' }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="font-bold text-[13px]" style={{ color: '#0F172A' }}>All clear!</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>No pending actions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {s.pendingPO > 0 && (
                <Link to="/purchase-orders"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1px solid #FDE68A' }}>
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base shrink-0 shadow-sm">📥</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold" style={{ color: '#78350F' }}>Stock to receive</p>
                    <p className="text-[10px]" style={{ color: '#B45309' }}>{s.pendingPO} purchase orders waiting</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
                    style={{ background: '#FDE68A', color: '#92400E' }}>{s.pendingPO}</div>
                </Link>
              )}
              {s.pendingVO > 0 && (
                <Link to="/vendor-orders"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1px solid #BFDBFE' }}>
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base shrink-0 shadow-sm">📤</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold" style={{ color: '#1E3A8A' }}>To dispatch</p>
                    <p className="text-[10px]" style={{ color: '#2563EB' }}>{s.pendingVO} vendor orders pending</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
                    style={{ background: '#BFDBFE', color: '#1D4ED8' }}>{s.pendingVO}</div>
                </Link>
              )}
              {s.pendingSO > 0 && (
                <Link to="/school-orders"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', border: '1px solid #DDD6FE' }}>
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-base shrink-0 shadow-sm">🛒</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold" style={{ color: '#3B0764' }}>To deliver</p>
                    <p className="text-[10px]" style={{ color: '#7C3AED' }}>{s.pendingSO} school orders pending</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
                    style={{ background: '#DDD6FE', color: '#6D28D9' }}>{s.pendingSO}</div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sales overview */}
        <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-[14px]" style={{ color: '#0F172A' }}>Sales Overview</h2>
                <p className="text-[10px]" style={{ color: '#94A3B8' }}>Revenue breakdown</p>
              </div>
            </div>
            <Link to="/payments"
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white' }}>
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div className="rounded-xl p-3" style={{ background: '#EFF6FF' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#2563EB' }}>B2B — Vendor</p>
              </div>
              <p className="text-[20px] font-black" style={{ color: '#1D4ED8' }}>₹{Number(s.todayB2B).toLocaleString()}</p>
              <RevenueBar value={Number(s.todayB2B)} max={maxSales} color="#3B82F6" trackColor="#BFDBFE" label="Dispatched" />
            </div>
            <div className="rounded-xl p-3" style={{ background: '#F0FDF4' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#059669' }}>B2C — Schools</p>
              </div>
              <p className="text-[20px] font-black" style={{ color: '#065F46' }}>₹{Number(s.todayB2C).toLocaleString()}</p>
              <RevenueBar value={Number(s.todayB2C)} max={maxSales} color="#10B981" trackColor="#A7F3D0" label="Delivered" />
            </div>
          </div>

          <div className="rounded-xl p-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#4C1D95,#3B0764)', boxShadow: '0 4px 16px rgba(76,29,149,0.25)' }}>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(221,214,254,0.7)' }}>Total Collected</p>
              <p className="text-xl font-black text-white">₹{Number(s.totalPaid).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: '#94A3B8' }}>Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: '📥', label: 'New Purchase Order', sub: 'Buy from supplier',  to: '/purchase-orders', bg: '#FFFBEB', iconBg: 'linear-gradient(135deg,#F59E0B,#D97706)', border: '#FDE68A', text: '#78350F' },
            { icon: '📤', label: 'New Vendor Order',   sub: 'Sell to retailer',   to: '/vendor-orders',   bg: '#EFF6FF', iconBg: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: '#BFDBFE', text: '#1E3A8A' },
            { icon: '🛒', label: 'New School Order',   sub: 'Sell to school',     to: '/school-orders',   bg: '#F0FDF4', iconBg: 'linear-gradient(135deg,#10B981,#059669)', border: '#BBF7D0', text: '#14532D' },
            { icon: '💳', label: 'Record Payment',     sub: 'Cash / UPI / Bank',  to: '/payments',        bg: '#F5F3FF', iconBg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', border: '#DDD6FE', text: '#3B0764' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
              style={{ background: a.bg, border: `1px solid ${a.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md transition-transform group-hover:scale-110"
                style={{ background: a.iconBg }}>
                {a.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold leading-tight" style={{ color: a.text }}>{a.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
