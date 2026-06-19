import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import { invoices as api } from '../api'
import InvoicePrint from '../components/InvoicePrint'
import Badge from '../components/ui/Badge'
import useConfirm from '../hooks/useConfirm'
import { toast } from 'react-toastify'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })
}

export default function Invoices() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { confirm, confirmModal } = useConfirm()
  const [printId, setPrintId] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = (data || []).filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.buyerName.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id, num) => {
    if (!await confirm(`Delete invoice ${num}? This cannot be undone.`)) return
    try { await api.delete(id); reload(); toast.success('Invoice deleted') }
    catch (e) { toast.error(e.response?.data?.message || 'Error') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <p className="text-xs text-slate-400 mt-0.5">All generated tax invoices</p>
        </div>
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice no. or buyer..."
            className="input flex-1 min-w-48"
          />
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              {['Invoice No.', 'Date', 'Type', 'Buyer', 'Items', 'Total', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              : filtered.length === 0
                ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">No invoices yet. Generate one from Vendor Orders or School Orders.</td></tr>
                : filtered.map(inv => (
                  <tr key={inv.id} className="table-row">
                    <td className="px-4 py-3.5 font-mono text-sm font-semibold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3.5 text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3.5"><Badge value={inv.orderType} /></td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{inv.buyerName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{inv.items?.length} item(s)</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">₹ {fmt(inv.totalAmount)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => setPrintId(inv.id)} className="act-view">View & Print</button>
                        <button onClick={() => handleDelete(inv.id, inv.invoiceNumber)} className="act-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {confirmModal}
      {printId && <InvoicePrint invoiceId={printId} onClose={() => setPrintId(null)} />}
    </div>
  )
}
