import { toast } from 'react-toastify'
import { useState, useRef } from 'react'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { inventory as api } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'

export default function Inventory() {
  const { data, loading, reload } = useFetch(api.getAll)
  const [lowOnly, setLowOnly] = useState(false)

  const base = lowOnly ? data.filter(i => i.quantity < 10) : data
  const { paginated, filtered, search, setSearch, page, setPage } = useTableState(base, {
    searchFields: ['book.title', 'book.publisher.name', 'book.category'], perPage: 15,
  })

  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [adjType, setAdjType] = useState('absolute')
  const [value, setValue] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)

  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startInlineEdit = (r) => { setEditingId(r.bookId); setEditValue(String(r.quantity)) }
  const cancelInlineEdit = () => { setEditingId(null); setEditValue('') }

  const saveInlineEdit = async (r) => {
    const newQty = parseInt(editValue)
    if (isNaN(newQty) || newQty < 0 || newQty === r.quantity) { cancelInlineEdit(); return }
    try {
      await api.adjust(r.bookId, { quantity: newQty })
      reload()
      toast.success(`${r.book.title} → ${newQty}`)
    } catch (err) {
      toast.error('Update failed')
    } finally {
      cancelInlineEdit()
    }
  }

  const [restockModal, setRestockModal] = useState(false)
  const [restockValues, setRestockValues] = useState({})
  const [restocking, setRestocking] = useState(false)

  const openRestock = () => {
    const init = {}
    data.filter(i => i.quantity < 10).forEach(i => { init[i.bookId] = '' })
    setRestockValues(init)
    setRestockModal(true)
  }

  const saveRestock = async () => {
    const items = Object.entries(restockValues)
      .filter(([, v]) => v !== '' && !isNaN(parseInt(v)) && parseInt(v) >= 0)
      .map(([bookId, v]) => ({ bookId: parseInt(bookId), stock: parseInt(v) }))
    if (items.length === 0) return toast.info('Enter at least one quantity')
    setRestocking(true)
    try {
      await api.bulkUpdateJson(items)
      toast.success(`${items.length} book${items.length > 1 ? 's' : ''} restocked`)
      setRestockModal(false)
      reload()
    } catch (err) {
      toast.error('Restock failed')
    } finally {
      setRestocking(false)
    }
  }

  const [countMode, setCountMode] = useState(false)
  const [counts, setCounts] = useState({})
  const [saving, setSaving] = useState(false)

  const enterCountMode = () => {
    const initial = {}
    data.forEach(i => { initial[i.bookId] = String(i.quantity) })
    setCounts(initial)
    setCountMode(true)
  }

  const exitCountMode = () => { setCountMode(false); setCounts({}) }

  const changedItems = data.filter(i => counts[i.bookId] !== undefined && counts[i.bookId] !== String(i.quantity))

  const saveCountMode = async () => {
    if (changedItems.length === 0) return toast.info('No changes to save')
    setSaving(true)
    try {
      const items = changedItems.map(i => ({ bookId: i.bookId, stock: parseInt(counts[i.bookId]) }))
      await api.bulkUpdateJson(items)
      toast.success(`${items.length} book${items.length > 1 ? 's' : ''} updated`)
      exitCountMode()
      reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const openAdjust = (r) => { setSelected(r); setValue(r.quantity); setAdjType('absolute'); setModal(true) }

  const exportCSV = () => {
    const header = 'book_id,title,isbn,publisher,category,board,level,stock'
    const rows = data.map(i => [
      i.bookId,
      `"${(i.book.title || '').replace(/"/g, '""')}"`,
      i.book.isbn || '',
      `"${(i.book.publisher?.name || '').replace(/"/g, '""')}"`,
      i.book.category || '',
      i.book.board || '',
      i.book.level || '',
      i.quantity,
    ].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'stock_count.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    try {
      const res = await api.bulkUpdate(file)
      const { updated, skipped } = res.data.data
      if (skipped.length === 0) {
        toast.success(`${updated} books stock updated`)
      } else {
        toast.success(`${updated} updated, ${skipped.length} skipped`)
        console.table(skipped)
      }
      reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = adjType === 'absolute' ? { quantity: parseInt(value) } : { adjustment: parseInt(value) }
      await api.adjust(selected.bookId, payload)
      setModal(false); reload(); toast.success('Stock updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const lowCount = data.filter(i => i.quantity < 10).length
  const totalStock = data.reduce((s, i) => s + i.quantity, 0)

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Total stock: <strong className="text-slate-700">{totalStock}</strong> units
            {lowCount > 0 && <span className="ml-2 text-red-500 font-semibold"> {lowCount} low stock</span>}
          </p>
        </div>
        {countMode ? (
          <div className="flex items-center gap-3">
            {changedItems.length > 0 && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                {changedItems.length} change{changedItems.length > 1 ? 's' : ''} pending
              </span>
            )}
            <button onClick={exitCountMode} className="btn-white text-sm">Cancel</button>
            <button onClick={saveCountMode} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : `Save ${changedItems.length > 0 ? `(${changedItems.length})` : 'Changes'}`}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCSV} className="btn-white text-sm">Export CSV</button>
            <button onClick={() => fileRef.current.click()} disabled={importing} className="btn-white text-sm">
              {importing ? 'Importing...' : 'Import CSV'}
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
            {lowCount > 0 && (
              <button onClick={openRestock} className="text-sm px-3 py-1.5 rounded-lg font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                Restock Low ({lowCount})
              </button>
            )}
            <button onClick={enterCountMode} className="btn-primary text-sm">Stock Count</button>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by book name, publisher" className="input flex-1 min-w-48" />
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} className="accent-red-500 w-4 h-4 rounded" />
            <span className="text-red-600 font-semibold text-xs">Low stock only</span>
          </label>
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['Book', 'Publisher', 'Category', 'Board', 'Level', 'Stock', 'Last Updated', 'Action'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">No results</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className={r.quantity < 10 ? 'bg-red-50/60' : 'table-row'}>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{r.book.title}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{r.book.publisher?.name || ''}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{r.book.category || ''}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{r.book.board || ''}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{r.book.level || ''}</td>
                    <td className="px-4 py-3.5">
                      {countMode ? (
                        <input
                          type="number" min="0"
                          value={counts[r.bookId] ?? r.quantity}
                          onChange={e => setCounts(c => ({ ...c, [r.bookId]: e.target.value }))}
                          className={`w-20 border rounded px-2 py-1 text-sm font-bold text-center focus:outline-none focus:border-blue-500
                            ${counts[r.bookId] !== String(r.quantity) ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`}
                        />
                      ) : editingId === r.bookId ? (
                        <input
                          type="number" min="0" autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(r)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.target.blur() }
                            if (e.key === 'Escape') cancelInlineEdit()
                          }}
                          className="w-20 border border-blue-400 bg-blue-50 rounded px-2 py-1 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      ) : (
                        <span
                          onClick={() => !countMode && startInlineEdit(r)}
                          title="Click to edit"
                          className={`font-bold text-base cursor-pointer hover:underline hover:opacity-70 transition-opacity
                            ${r.quantity === 0 ? 'text-red-600' : r.quantity < 10 ? 'text-orange-500' : r.quantity < 30 ? 'text-yellow-600' : 'text-emerald-600'}`}
                        >
                          {r.quantity}
                        </span>
                      )}
                      {!countMode && editingId !== r.bookId && r.quantity < 10 && (
                        <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Low</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{new Date(r.lastUpdated).toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      {!countMode && <button onClick={() => openAdjust(r)} className="act-blue">Adjust</button>}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} perPage={15} onChange={setPage} />
      </div>

      {restockModal && (
        <Modal title={`Restock Low Stock — ${lowCount} books`} onClose={() => setRestockModal(false)} wide>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 mb-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-2 pb-1 border-b text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Book</span><span className="text-center">Current</span><span className="text-center w-24">New Qty</span>
            </div>
            {data.filter(i => i.quantity < 10).map(i => (
              <div key={i.bookId} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center px-2 py-2 rounded-lg hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800 truncate">{i.book.title}</p>
                  <p className="text-[10px] text-slate-400">{i.book.publisher?.name}</p>
                </div>
                <span className={`text-sm font-bold w-10 text-center ${i.quantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                  {i.quantity}
                </span>
                <input
                  type="number" min="0"
                  placeholder="e.g. 50"
                  value={restockValues[i.bookId] || ''}
                  onChange={e => setRestockValues(v => ({ ...v, [i.bookId]: e.target.value }))}
                  className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm text-center font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-4">Leave blank to skip a book. Only filled entries will be updated.</p>
          <div className="modal-footer">
            <button onClick={() => setRestockModal(false)} className="btn-white">Cancel</button>
            <button onClick={saveRestock} disabled={restocking} className="btn-primary">
              {restocking ? 'Saving...' : 'Restock All'}
            </button>
          </div>
        </Modal>
      )}

      {modal && selected && (
        <Modal title={`Adjust Stock  ${selected.book.title}`} onClose={() => setModal(false)}>
          <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded">
            <div className="text-center"><p className="text-xs text-slate-500">Current Stock</p><p className="text-2xl font-bold text-slate-800">{selected.quantity}</p></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Adjustment Type</label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={adjType === 'absolute'} onChange={() => setAdjType('absolute')} /> Set exact quantity</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={adjType === 'relative'} onChange={() => setAdjType('relative')} /> Add / subtract</label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {adjType === 'absolute' ? 'New Stock Quantity' : 'Amount to add (use  for subtract, e.g. 5)'}
              </label>
              <input required type="number" value={value} onChange={e => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-center text-lg font-bold" />
              {adjType === 'relative' && value && !isNaN(value) && (
                <p className="text-xs text-slate-500 mt-1">New stock will be: <strong>{selected.quantity + parseInt(value || 0)}</strong></p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">Update Stock</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

