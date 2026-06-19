import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { portal } from '../../api'

const STATUS_STYLE = {
  PENDING:   { bg: '#FEF3C7', text: '#D97706' },
  PARTIAL:   { bg: '#DBEAFE', text: '#2563EB' },
  DELIVERED: { bg: '#DCFCE7', text: '#16A34A' },
  CANCELLED: { bg: '#FEE2E2', text: '#DC2626' },
}

export default function PortalMyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(null)

  useEffect(() => {
    portal.getMyOrders()
      .then(r => setOrders(r.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">My Orders</h2>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No orders yet. Browse book sets to place your first order.</div>
      ) : (
        orders.map(o => {
          const style = STATUS_STYLE[o.status] || {}
          const total = o.items?.reduce((s, i) => s + parseFloat(i.unitPrice) * i.qtyOrdered, 0) || 0
          return (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{o.bookSet?.name || 'Custom Order'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Child: <strong className="text-slate-600">{o.childName}</strong>
                    {o.guardianName && <> · Guardian: <strong className="text-slate-600">{o.guardianName}</strong></>}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(o.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: style.bg, color: style.text }}>{o.status}</span>
                  <p className="text-green-700 font-bold text-sm mt-1">₹{total.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setView(o)}
                className="mt-3 text-xs text-indigo-600 font-semibold hover:underline">
                View details →
              </button>
            </div>
          )
        })
      )}

      {view && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Order Details</h2>
              <button onClick={() => setView(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm space-y-1">
              <p><span className="text-slate-500">Set:</span> <strong>{view.bookSet?.name}</strong></p>
              <p><span className="text-slate-500">Child:</span> {view.childName}</p>
              <p><span className="text-slate-500">Guardian:</span> {view.guardianName}</p>
              <p><span className="text-slate-500">Date:</span> {new Date(view.orderDate).toLocaleDateString()}</p>
              <p><span className="text-slate-500">Status:</span> {view.status}</p>
              {view.notes && <p><span className="text-slate-500">Notes:</span> {view.notes}</p>}
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b">
                <th className="py-2 text-left">Book</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {view.items?.map(i => (
                  <tr key={i.id}>
                    <td className="py-2 text-slate-700">{i.book?.title}</td>
                    <td className="py-2 text-center text-slate-500">{i.qtyOrdered}</td>
                    <td className="py-2 text-right font-medium">₹{(parseFloat(i.unitPrice) * i.qtyOrdered).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t pt-2 mt-2 text-right font-bold text-sm text-green-700">
              Total: ₹{view.items?.reduce((s, i) => s + parseFloat(i.unitPrice) * i.qtyOrdered, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
