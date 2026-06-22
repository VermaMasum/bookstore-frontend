import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { portal } from '../../api'

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const BOARDS = ['ICSE', 'CBSE', 'State Board']
const LEVELS = ['Nursery', 'LKG', 'UKG', 'Primary (1–5)', 'Middle (6–8)', 'SSC (9–10)', 'HSC (11–12)', 'Other']
const currentYear = new Date().getFullYear()
const SESSIONS = Array.from({ length: 4 }, (_, i) => {
  const y = currentYear - 1 + i
  return `${y}-${String(y + 1).slice(-2)}`
})

export default function PortalHome() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ className: '', board: '', level: '', sessionYear: '' })
  const [selected, setSelected] = useState(null)
  const [orderForm, setOrderForm] = useState({ childName: '', guardianName: '', notes: '' })
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)

  const setF = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))
  const setO = (k) => (e) => setOrderForm(f => ({ ...f, [k]: e.target.value }))

  const fetchSets = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const res = await portal.getBookSets(params)
      setSets(res.data.data)
    } catch { toast.error('Failed to load book sets') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSets() }, [])

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!orderForm.childName || !orderForm.guardianName)
      return toast.warning('Child name and guardian name are required')
    setOrdering(true)
    try {
      await portal.placeOrder({ setId: selected.id, ...orderForm })
      toast.success('Order placed successfully!')
      setSelected(null)
      setOrderForm({ childName: '', guardianName: '', notes: '' })
      setOrdered(true)
      setTimeout(() => setOrdered(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setOrdering(false) }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filter Book Sets</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['className', 'Class', CLASSES],
            ['board', 'Board', BOARDS],
            ['level', 'Level', LEVELS],
            ['sessionYear', 'Session', SESSIONS],
          ].map(([key, label, options]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
              <select value={filters[key]} onChange={setF(key)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="">All</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={fetchSets}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
          Search
        </button>
      </div>

      {ordered && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          Order placed! View it in <a href="/portal/my-orders" className="underline">My Orders</a>.
        </div>
      )}

      {/* Book Sets List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading book sets...</div>
      ) : sets.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No book sets found. Try changing the filters.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map(set => (
            <div key={set.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{set.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{set.school?.name}</p>
                </div>
                {set.totalPrice && (
                  <span className="text-green-700 font-bold text-sm whitespace-nowrap">
                    ₹{parseFloat(set.totalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {set.className && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{set.className}</span>}
                {set.board && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{set.board}</span>}
                {set.level && <span className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">{set.level}</span>}
                {set.sessionYear && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{set.sessionYear}</span>}
              </div>
              <div className="text-xs text-slate-500 mb-4 flex-1">
                {set.items?.length} book(s) included
                {set.items?.slice(0, 3).map(i => (
                  <div key={i.id} className="truncate text-slate-400 mt-0.5">· {i.book?.title}</div>
                ))}
                {set.items?.length > 3 && <div className="text-slate-400">· +{set.items.length - 3} more</div>}
              </div>
              <button onClick={() => { setSelected(set); setOrderForm({ childName: '', guardianName: '', notes: '' }) }}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
                Order This Set
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Place Order</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm">
              <p className="font-semibold text-slate-700">{selected.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{selected.className} · {selected.board} · {selected.sessionYear}</p>
              <p className="text-green-700 font-bold mt-1">₹{parseFloat(selected.totalPrice || 0).toLocaleString()}</p>
            </div>

            <form onSubmit={handleOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Child's Name *</label>
                <input required value={orderForm.childName} onChange={setO('childName')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="Student's full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Guardian's Name *</label>
                <input required value={orderForm.guardianName} onChange={setO('guardianName')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="Father's / Mother's name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (optional)</label>
                <input value={orderForm.notes} onChange={setO('notes')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="Any special requests" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={ordering}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
                  {ordering ? 'Placing...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
