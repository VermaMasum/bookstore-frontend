import { toast } from 'react-toastify'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { books as api, publishers } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import useConfirm from '../hooks/useConfirm'

const empty = { title: '', isbn: '', author: '', publisherId: '', category: '', mrp: '', costPrice: '' }

export default function Books() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { data: pubs } = useFetch(publishers.getAll)

  const categories = [...new Set(data.map(b => b.category).filter(Boolean))]

  const { paginated, filtered, search, setSearch, filter, setFilter, page, setPage } = useTableState(data, {
    searchFields: ['title', 'author', 'isbn', 'publisher.name', 'category'],
    filterField: 'category', perPage: 10,
  })

  const { confirm, confirmModal } = useConfirm()

  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(empty)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)

  const downloadTemplate = () => {
    const csv = 'title,publisher_name,mrp,cost_price,isbn,author,category\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'books_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    try {
      const res = await api.bulkImport(file)
      const { added, skipped } = res.data.data
      if (skipped.length === 0) {
        toast.success(`${added} books imported successfully`)
      } else {
        toast.success(`${added} added, ${skipped.length} skipped`)
        console.table(skipped)
      }
      reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const openCreate = () => { setSelected(null); setForm(empty); setModal(true) }
  const openEdit = (r) => {
    setSelected(r)
    setForm({ title: r.title, isbn: r.isbn || '', author: r.author || '', publisherId: r.publisherId, category: r.category || '', mrp: r.mrp, costPrice: r.costPrice })
    setModal(true)
  }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { selected ? await api.update(selected.id, form) : await api.create(form); setModal(false); reload(); toast.success('Created successfully') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!await confirm('Delete this book?')) return
    try { await api.delete(id); reload(); toast.success('Deleted') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
        <div><h1 className="text-xl font-bold text-gray-900">Books</h1><p className="text-xs text-slate-400 mt-0.5">{data.length} total</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadTemplate} className="btn-white text-sm">Download Template</button>
          <button onClick={() => fileRef.current.click()} disabled={importing} className="btn-white text-sm">
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <button onClick={openCreate} className="btn-primary">+ Add Book</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, author, ISBN..."
            className="input flex-1 min-w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="select w-40">
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>
              {['Title', 'Author', 'Publisher', 'Category', 'MRP', 'Cost'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left">{h}</th>
              ))}
              <th className="px-4 py-3.5 text-left">
                <div className="flex items-center gap-1.5">
                  Stock
                  <Link to="/inventory" className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors"
                    style={{ background: '#EEF2FF', color: '#6366F1' }}>
                    manage →
                  </Link>
                </div>
              </th>
              <th className="px-4 py-3.5 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-slate-400">{search ? 'No results' : 'No books yet'}</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3.5 font-medium text-slate-800 max-w-[200px]">
                      <p className="truncate">{r.title}</p>
                      {r.isbn && <p className="text-xs text-slate-400">{r.isbn}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{r.author || ''}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.publisher?.name || ''}</td>
                    <td className="px-4 py-3.5">
                      {r.category ? <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{r.category}</span> : ''}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{r.mrp}</td>
                    <td className="px-4 py-3.5 text-slate-500">{r.costPrice}</td>
                    <td className="px-4 py-3.5">
                      {(() => {
                        const qty = r.inventory?.quantity ?? 0
                        const { bg, text, label } = qty === 0
                          ? { bg: '#FEE2E2', text: '#DC2626', label: 'Out of stock' }
                          : qty < 10
                          ? { bg: '#FEF3C7', text: '#D97706', label: `Low · ${qty}` }
                          : { bg: '#DCFCE7', text: '#16A34A', label: `${qty} units` }
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{ background: bg, color: text }}>
                            {label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3.5 flex gap-3">
                      <button onClick={() => openEdit(r)} className="act-blue">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="act-danger">Delete</button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} perPage={10} onChange={setPage} />
      </div>

      {confirmModal}
      {modal && (
        <Modal title={selected ? 'Edit Book' : 'Add Book'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="label">Title *</label>
              <input required value={form.title} onChange={set('title')} className="input" /></div>
            <div><label className="label">Publisher *</label>
              <select required value={form.publisherId} onChange={set('publisherId')} className="input">
                <option value="">Select publisher</option>
                {pubs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">MRP  *</label>
                <input required type="number" step="0.01" value={form.mrp} onChange={set('mrp')} className="input" /></div>
              <div><label className="label">Cost Price  *</label>
                <input required type="number" step="0.01" value={form.costPrice} onChange={set('costPrice')} className="input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Author</label>
                <input value={form.author} onChange={set('author')} className="input" /></div>
              <div><label className="label">Category</label>
                <input value={form.category} onChange={set('category')} list="cats" className="input" />
                <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist></div>
            </div>
            <div><label className="label">ISBN</label>
              <input value={form.isbn} onChange={set('isbn')} className="input" /></div>
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">{selected ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

