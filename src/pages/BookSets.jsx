import { toast } from 'react-toastify'
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { bookSets as api, schools, books } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import BookPickerTable from '../components/ui/BookPickerTable'
import useConfirm from '../hooks/useConfirm'

const BOARDS = ['ICSE', 'CBSE', 'State Board']
const LEVELS = ['SSC', 'HSC']
const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const currentYear = new Date().getFullYear()
const SESSIONS = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - 1 + i
  return `${y}-${String(y + 1).slice(-2)}`
})

export default function BookSets() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { data: schoolList } = useFetch(schools.getAll)
  const { data: bookList } = useFetch(books.getAll)

  const { paginated, filtered, search, setSearch, filter, setFilter, page, setPage } = useTableState(data, {
    searchFields: ['name', 'school.name', 'className', 'sessionYear'], filterField: 'sessionYear', perPage: 10,
  })

  const { confirm, confirmModal } = useConfirm()

  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', schoolId: '', className: '', sessionYear: '', board: '', level: '' })
  const [bookItems, setBookItems] = useState([])

  const openCreate = () => { setSelected(null); setForm({ name: '', schoolId: '', className: '', sessionYear: '', board: '', level: '' }); setBookItems([]); setModal(true) }
  const openEdit = (r) => {
    setSelected(r)
    setForm({ name: r.name, schoolId: r.schoolId, className: r.className, sessionYear: r.sessionYear, board: r.board || '', level: r.level || '' })
    const items = r.items?.map(i => ({ bookId: i.bookId, title: i.book?.title || '', quantity: i.quantity, costPrice: parseFloat(i.book?.costPrice || 0) })) || []
    setBookItems(items)
    setModal(true)
  }

  const handleBookChange = (bookId, field, value) => {
    setBookItems(prev => {
      const exists = prev.find(i => parseInt(i.bookId) === bookId)
      if (exists) {
        return prev.map(i => parseInt(i.bookId) === bookId ? { ...i, [field]: value } : i)
      }
      const book = bookList.find(b => b.id === bookId)
      return [...prev, { bookId, title: book?.title || '', quantity: value, costPrice: parseFloat(book?.costPrice || 0) }]
    })
  }

  const getItemsForSubmit = () =>
    bookItems.filter(i => parseInt(i.quantity) > 0).map(i => ({ bookId: i.bookId, quantity: parseInt(i.quantity) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const items = getItemsForSubmit()
    if (items.length === 0) return toast.warning('Add at least one book to the set')
    try {
      selected ? await api.update(selected.id, { ...form, items }) : await api.create({ ...form, items })
      setModal(false); reload(); toast.success(selected ? 'Updated successfully' : 'Created successfully')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!await confirm('Delete this book set?')) return
    try { await api.delete(id); reload(); toast.success('Deleted') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const sessions = [...new Set(data.map(s => s.sessionYear).filter(Boolean))]

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
        <div><h1 className="text-xl font-bold text-gray-900">Book Sets</h1><p className="text-xs text-slate-400 mt-0.5">Custom sets per school & class</p></div>
        <button onClick={openCreate} className="btn-primary">+ New Set</button>
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, school, class..."
            className="input flex-1 min-w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="select w-40">
            <option value="ALL">All Sessions</option>
            {sessions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['Set Name', 'School', 'Class', 'Session', 'Board', 'Level', 'Books', 'Total Price', 'Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={9} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={9} className="text-center py-8 text-slate-400">No results</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{r.name}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.school?.name}</td>
                    <td className="px-4 py-3.5"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{r.className}</span></td>
                    <td className="px-4 py-3.5 text-slate-500">{r.sessionYear}</td>
                    <td className="px-4 py-3.5">{r.board ? <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{r.board}</span> : ''}</td>
                    <td className="px-4 py-3.5">{r.level ? <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs">{r.level}</span> : ''}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.items?.length} title(s)</td>
                    <td className="px-4 py-3.5 font-semibold text-green-700">{r.totalPrice ? parseFloat(r.totalPrice).toLocaleString() : ''}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => setViewModal(r)} className="act-view">View</button>
                        <button onClick={() => openEdit(r)} className="act-blue">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="act-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} perPage={10} onChange={setPage} />
      </div>

      {confirmModal}
      {modal && (
        <Modal title={selected ? 'Edit Book Set' : 'New Book Set'} onClose={() => setModal(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Set Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">School *</label>
                <select required value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))} className="select">
                  <option value="">Select school</option>
                  {schoolList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Class *</label>
                <select required value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} className="select">
                  <option value="">Select class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Session Year *</label>
                <select required value={form.sessionYear} onChange={e => setForm(f => ({ ...f, sessionYear: e.target.value }))} className="select">
                  <option value="">Select session</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Board</label>
                <select value={form.board} onChange={e => setForm(f => ({ ...f, board: e.target.value }))} className="select">
                  <option value="">Select board</option>
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="select">
                  <option value="">Select level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Books in Set</label>
              <BookPickerTable books={bookList} items={bookItems} onChange={handleBookChange} checkboxMode />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">{selected ? 'Update Set' : 'Create Set'}</button>
            </div>
          </form>
        </Modal>
      )}

      {viewModal && (
        <Modal title={viewModal.name} onClose={() => setViewModal(null)}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded">
              <div><span className="text-slate-500">School:</span> <strong>{viewModal.school?.name}</strong></div>
              <div><span className="text-slate-500">Class:</span> {viewModal.className}</div>
              <div><span className="text-slate-500">Session:</span> {viewModal.sessionYear}</div>
              <div><span className="text-slate-500">Total:</span> <strong className="text-green-700">{viewModal.totalPrice ? parseFloat(viewModal.totalPrice).toLocaleString() : ''}</strong></div>
              {viewModal.board && <div><span className="text-slate-500">Board:</span> {viewModal.board}</div>}
              {viewModal.level && <div><span className="text-slate-500">Level:</span> {viewModal.level}</div>}
            </div>
            <table className="w-full border-t">
              <thead><tr className="text-xs text-slate-500 uppercase">{['Book', 'Qty', 'Cost Price'].map(h => <th key={h} className="py-2 text-left">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {viewModal.items?.map(i => (
                  <tr key={i.id}><td className="py-1.5">{i.book?.title}</td><td className="py-1.5">{i.quantity}</td><td className="py-1.5">{i.book?.costPrice}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  )
}

