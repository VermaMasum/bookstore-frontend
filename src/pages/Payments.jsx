import { toast } from 'react-toastify'
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { payments as api, vendorOrders, schoolOrders } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'

const empty = { orderType: 'B2B', vendorOrderId: '', schoolOrderId: '', amount: '', method: 'CASH', notes: '' }

export default function Payments() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { data: voList } = useFetch(vendorOrders.getAll)
  const { data: soList } = useFetch(schoolOrders.getAll)

  const { paginated, filtered, search, setSearch, filter, setFilter, page, setPage } = useTableState(data, {
    searchFields: ['notes'], filterField: 'orderType', perPage: 10,
  })

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      if (form.orderType === 'B2B') { payload.schoolOrderId = null; payload.vendorId = voList.find(v => v.id === parseInt(form.vendorOrderId))?.vendorId || null }
      else { payload.vendorOrderId = null; payload.schoolId = soList.find(s => s.id === parseInt(form.schoolOrderId))?.schoolId || null }
      await api.create(payload); setModal(false); reload(); toast.success('Payment recorded')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const total = data.reduce((s, p) => s + parseFloat(p.amount), 0)
  const b2bTotal = data.filter(p => p.orderType === 'B2B').reduce((s, p) => s + parseFloat(p.amount), 0)
  const b2cTotal = data.filter(p => p.orderType === 'B2C').reduce((s, p) => s + parseFloat(p.amount), 0)

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payments</h1>
          <div className="flex gap-4 mt-1 text-xs text-slate-500">
            <span>Total: <strong className="text-green-600">{total.toLocaleString()}</strong></span>
            <span>B2B: <strong>{b2bTotal.toLocaleString()}</strong></span>
            <span>B2C: <strong>{b2cTotal.toLocaleString()}</strong></span>
          </div>
        </div>
        <button onClick={() => { setForm(empty); setModal(true) }} className="btn-primary">+ Record Payment</button>
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
            className="input flex-1 min-w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="select w-40">
            <option value="ALL">All Types</option>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['Date', 'Type', 'Order', 'Amount', 'Method', 'Notes'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">No results</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3.5 text-slate-500">{new Date(r.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5"><Badge value={r.orderType} /></td>
                    <td className="px-4 py-3.5 text-slate-600">{r.vendorOrderId ? `Vendor #${r.vendorOrderId}` : r.schoolOrderId ? `School #${r.schoolOrderId}` : ''}</td>
                    <td className="px-4 py-3.5 font-semibold text-green-700">{parseFloat(r.amount).toLocaleString()}</td>
                    <td className="px-4 py-3.5"><Badge value={r.method} /></td>
                    <td className="px-4 py-3.5 text-slate-500">{r.notes || ''}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} perPage={10} onChange={setPage} />
      </div>

      {modal && (
        <Modal title="Record Payment" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Payment For</label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={form.orderType === 'B2B'} onChange={() => setForm(f => ({ ...f, orderType: 'B2B', schoolOrderId: '' }))} /> B2B  Vendor</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={form.orderType === 'B2C'} onChange={() => setForm(f => ({ ...f, orderType: 'B2C', vendorOrderId: '' }))} /> B2C  School</label>
              </div>
            </div>
            {form.orderType === 'B2B' ? (
              <div><label className="label">Linked Vendor Order</label>
                <select value={form.vendorOrderId} onChange={set('vendorOrderId')} className="select">
                  <option value="">None (advance payment)</option>
                  {voList.map(o => <option key={o.id} value={o.id}>#{o.id}  {o.vendor?.name}  {o.status}</option>)}
                </select></div>
            ) : (
              <div><label className="label">Linked School Order</label>
                <select value={form.schoolOrderId} onChange={set('schoolOrderId')} className="select">
                  <option value="">None (advance payment)</option>
                  {soList.map(o => <option key={o.id} value={o.id}>#{o.id}  {o.school?.name}  {o.status}</option>)}
                </select></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Amount  *</label>
                <input required type="number" step="0.01" value={form.amount} onChange={set('amount')} className="input" /></div>
              <div><label className="label">Method</label>
                <select value={form.method} onChange={set('method')} className="select">
                  {['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'].map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select></div>
            </div>
            <div><label className="label">Notes</label>
              <input value={form.notes} onChange={set('notes')} className="input" /></div>
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">Save Payment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

