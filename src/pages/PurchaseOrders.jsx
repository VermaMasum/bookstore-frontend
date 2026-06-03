import { toast } from 'react-toastify'
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { purchaseOrders as api, suppliers, books } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import BookPickerTable from '../components/ui/BookPickerTable'
import useConfirm from '../hooks/useConfirm'

export default function PurchaseOrders() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { data: supplierList } = useFetch(suppliers.getAll)
  const { data: bookList } = useFetch(books.getAll)

  const { paginated, filtered, search, setSearch, filter, setFilter, page, setPage } = useTableState(data, {
    searchFields: ['supplier.name', 'notes'], filterField: 'status', perPage: 10,
  })

  const { confirm, confirmModal } = useConfirm()

  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [form, setForm] = useState({ supplierId: '', notes: '' })
  const [bookItems, setBookItems] = useState({})

  const openCreate = () => { setForm({ supplierId: '', notes: '' }); setBookItems({}); setModal(true) }

  const handleBookChange = (bookId, field, value) => {
    setBookItems(prev => ({ ...prev, [bookId]: { ...prev[bookId], bookId, [field]: value } }))
  }

  const getItemsForSubmit = () =>
    Object.values(bookItems).filter(i => parseInt(i.quantity) > 0).map(i => ({
      bookId: i.bookId, quantity: parseInt(i.quantity), unitCost: parseFloat(i.unitCost || 0),
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const items = getItemsForSubmit()
    if (items.length === 0) return toast.warning('Select at least one book with quantity')
    if (items.some(i => !i.unitCost || i.unitCost <= 0)) return toast.warning('Enter cost price for all selected books')
    try { await api.create({ ...form, items }); setModal(false); reload(); toast.success('Created successfully') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleReceive = async (id) => {
    if (!await confirm('Mark as received? Stock will be added to inventory.')) return
    try { await api.receive(id); reload(); toast.success('Marked as received — inventory updated') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleCancel = async (id) => {
    if (!await confirm('Cancel this order?')) return
    try { await api.cancel(id); reload(); toast.success('Order cancelled') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const totalFor = (o) => o.items?.reduce((s, i) => s + parseFloat(i.unitCost) * i.quantity, 0) || 0

  const selectedCount = Object.values(bookItems).filter(i => parseInt(i.quantity) > 0).length

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-xs text-slate-400 mt-0.5">B2B Inward  buy stock from suppliers</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ New Order</button>
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by supplier" className="input flex-1 min-w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="select w-40">
            <option value="ALL">All Status</option>
            {['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['#', 'Supplier', 'Date', 'Books', 'Total', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-slate-400">No results</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3.5 text-slate-400 text-xs font-mono">#{r.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{r.supplier?.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{new Date(r.orderDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-slate-500">{r.items?.length} title(s)</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{totalFor(r).toLocaleString()}</td>
                    <td className="px-4 py-3.5"><Badge value={r.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => setViewModal(r)} className="act-view">View</button>
                        {r.status === 'PENDING' && <>
                          <button onClick={() => handleReceive(r.id)} className="act-success"> Receive</button>
                          <button onClick={() => handleCancel(r.id)} className="act-danger">Cancel</button>
                        </>}
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
        <Modal title="New Purchase Order" onClose={() => setModal(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Supplier *</label>
                <select required value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} className="select">
                  <option value="">Select supplier</option>
                  {supplierList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="select" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Select Books & Quantities</label>
                {selectedCount > 0 && <span className="text-xs text-blue-600 font-medium">{selectedCount} selected</span>}
              </div>
              <BookPickerTable
                books={bookList}
                items={Object.values(bookItems)}
                onChange={handleBookChange}
                columns={[{ key: 'unitCost', label: 'Cost ', placeholder: '0.00' }]}
                checkboxMode
              />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">Create Order</button>
            </div>
          </form>
        </Modal>
      )}

      {viewModal && (
        <Modal title={`Purchase Order #${viewModal.id}`} onClose={() => setViewModal(null)} wide>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm p-3 bg-slate-50 rounded">
              <div><span className="text-slate-500">Supplier:</span> <strong>{viewModal.supplier?.name}</strong></div>
              <div><span className="text-slate-500">Status:</span> <Badge value={viewModal.status} /></div>
              <div><span className="text-slate-500">Date:</span> {new Date(viewModal.orderDate).toLocaleDateString()}</div>
              {viewModal.notes && <div><span className="text-slate-500">Notes:</span> {viewModal.notes}</div>}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['Book', 'Qty', 'Unit Cost', 'Total'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {viewModal.items?.map(i => (
                  <tr key={i.id}>
                    <td className="px-3 py-2">{i.book?.title}</td>
                    <td className="px-3 py-2">{i.quantity}</td>
                    <td className="px-3 py-2">{i.unitCost}</td>
                    <td className="px-3 py-2 font-medium">{(parseFloat(i.unitCost) * i.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-bold text-sm border-t pt-2">Grand Total: {totalFor(viewModal).toLocaleString()}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

