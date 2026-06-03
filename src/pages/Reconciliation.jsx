import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import useFetch from '../hooks/useFetch'
import { reconciliation as api } from '../api'
import Modal from '../components/ui/Modal'

export default function Reconciliation() {
  const { data, loading, reload } = useFetch(api.getAll)
  const [modal, setModal] = useState(false)
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], openingStock: '', closingStock: '', salesB2B: '', salesB2C: '', purchasesTotal: '', notes: '' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const loadSummary = async () => {
    try {
      const res = await api.getSummary()
      const s = res.data.data
      setSummary(s)
      setForm(f => ({
        ...f,
        salesB2B: s.salesB2B.toFixed(2),
        salesB2C: s.salesB2C.toFixed(2),
        purchasesTotal: s.purchasesTotal.toFixed(2),
        closingStock: s.totalStock,
      }))
    } catch {}
  }

  const openModal = () => { loadSummary(); setModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await api.create(form); setModal(false); reload(); toast.success('End of day saved') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-xl font-bold text-gray-900">Reconciliation</h1><p className="text-xs text-slate-400 mt-0.5">End of day summary</p></div>
        <button onClick={openModal} className="btn-primary">+ Save Today's EOD</button>
      </div>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['Date','Opening Stock','Closing Stock','B2B Sales','B2C Sales','Purchases','Notes'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
            : data.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">No reconciliation records yet</td></tr>
            : data.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3.5 font-medium">{new Date(r.date).toLocaleDateString()}</td>
                <td className="px-4 py-3.5">{r.openingStock}</td>
                <td className="px-4 py-3.5">{r.closingStock}</td>
                <td className="px-4 py-3.5 text-blue-600 font-medium">{parseFloat(r.salesB2B).toLocaleString()}</td>
                <td className="px-4 py-3.5 text-green-600 font-medium">{parseFloat(r.salesB2C).toLocaleString()}</td>
                <td className="px-4 py-3.5 text-orange-500">{parseFloat(r.purchasesTotal).toLocaleString()}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{r.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Save End of Day" onClose={() => setModal(false)}>
          {summary && (
            <div className="bg-blue-50 rounded p-3 mb-4 text-sm space-y-1">
              <p className="font-medium text-blue-700 text-xs uppercase mb-2">Auto-calculated from today's activity</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-blue-600">
                <span>B2B Sales: {parseFloat(summary.salesB2B).toLocaleString()}</span>
                <span>B2C Sales: {parseFloat(summary.salesB2C).toLocaleString()}</span>
                <span>Purchases: {parseFloat(summary.purchasesTotal).toLocaleString()}</span>
                <span>Current Stock: {summary.totalStock} units</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Date *</label>
              <input required type="date" value={form.date} onChange={set('date')} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Opening Stock *</label>
                <input required type="number" value={form.openingStock} onChange={set('openingStock')} className="input" /></div>
              <div><label className="label">Closing Stock *</label>
                <input required type="number" value={form.closingStock} onChange={set('closingStock')} className="input" /></div>
              <div><label className="label">B2B Sales </label>
                <input type="number" step="0.01" value={form.salesB2B} onChange={set('salesB2B')} className="input" /></div>
              <div><label className="label">B2C Sales </label>
                <input type="number" step="0.01" value={form.salesB2C} onChange={set('salesB2C')} className="input" /></div>
              <div className="col-span-2"><label className="label">Purchases Total </label>
                <input type="number" step="0.01" value={form.purchasesTotal} onChange={set('purchasesTotal')} className="input" /></div>
            </div>
            <div><label className="label">Notes</label>
              <textarea rows={2} value={form.notes} onChange={set('notes')} className="input" /></div>
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">Save EOD</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

