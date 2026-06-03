import { toast } from 'react-toastify'
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { schools as api } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import useConfirm from '../hooks/useConfirm'

const empty = { name: '', contact: '', email: '', address: '', classLevels: '' }

export default function Schools() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { paginated, filtered, search, setSearch, page, setPage } = useTableState(data, {
    searchFields: ['name', 'contact', 'email', 'address'], perPage: 10,
  })
  const { confirm, confirmModal } = useConfirm()

  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(empty)

  const openCreate = () => { setSelected(null); setForm(empty); setModal(true) }
  const openEdit = (r) => { setSelected(r); setForm({ name: r.name, contact: r.contact || '', email: r.email || '', address: r.address || '', classLevels: r.classLevels || '' }); setModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { selected ? await api.update(selected.id, form) : await api.create(form); setModal(false); reload(); toast.success('Created successfully') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!await confirm('Delete?')) return
    try { await api.delete(id); reload(); toast.success('Deleted') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
        <div><h1 className="text-xl font-bold text-gray-900">Schools</h1><p className="text-xs text-slate-400 mt-0.5">{data.length} total</p></div>
        <button onClick={openCreate} className="btn-primary">+ Add School</button>
      </div>
      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schools" className="input flex-1 min-w-48" />
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['Name', 'Contact', 'Email', 'Address', 'Classes', 'Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">No results</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{r.name}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.contact || ''}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.email || ''}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.address || ''}</td>
                    <td className="px-4 py-3.5 text-slate-500">{r.classLevels || ''}</td>
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
        <Modal title={selected ? 'Edit School' : 'Add School'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="label">Name *</label>
              <input required value={form.name} onChange={set('name')} className="input" /></div>
            {[['contact', 'Contact'], ['email', 'Email'], ['address', 'Address'], ['classLevels', 'Class Levels (e.g. 1-12)']].map(([k, l]) => (
              <div key={k}><label className="label">{l}</label>
                <input value={form[k]} onChange={set(k)} className="input" /></div>
            ))}
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

