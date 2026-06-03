import { toast } from 'react-toastify'
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import { schoolOrders as api, schools, bookSets, books } from '../api'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import useConfirm from '../hooks/useConfirm'

export default function SchoolOrders() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { data: schoolList } = useFetch(schools.getAll)
  const { data: setList } = useFetch(bookSets.getAll)
  const { data: bookList } = useFetch(books.getAll)

  const { confirm, confirmModal } = useConfirm()

  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [deliverModal, setDeliverModal] = useState(null)
  const [deliveries, setDeliveries] = useState([])

  const [orderType, setOrderType] = useState('set')
  const [form, setForm] = useState({ schoolId: '', setId: '', notes: '', students: '' })
  const [manualItems, setManualItems] = useState([{ bookId: '', qtyOrdered: '', unitPrice: '' }])

  const openCreate = () => { setForm({ schoolId: '', setId: '', notes: '', students: '' }); setManualItems([{ bookId: '', qtyOrdered: '', unitPrice: '' }]); setOrderType('set'); setModal(true) }

  const openDeliver = (r) => {
    setDeliverModal(r)
    setDeliveries(r.items.filter(i => i.qtyDelivered < i.qtyOrdered).map(i => ({ itemId: i.id, qtyDelivered: '', max: i.qtyOrdered - i.qtyDelivered, book: i.book?.title })))
  }

  const setManualItem = (i, k, v) => setManualItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = orderType === 'set'
        ? { schoolId: form.schoolId, setId: form.setId, notes: form.notes, students: form.students, items: [] }
        : { schoolId: form.schoolId, notes: form.notes, items: manualItems }
      await api.create(payload)
      setModal(false); reload(); toast.success('Order created')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDeliver = async (e) => {
    e.preventDefault()
    try {
      const filtered = deliveries.filter(d => d.qtyDelivered && parseInt(d.qtyDelivered) > 0)
      await api.deliver(deliverModal.id, { deliveries: filtered })
      setDeliverModal(null); reload(); toast.success('Delivery updated — inventory deducted')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleCancel = async (id) => {
    if (!await confirm('Cancel this school order?')) return
    try { await api.cancel(id); reload(); toast.success('Order cancelled') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const totalFor = (o) => o.items?.reduce((s, i) => s + parseFloat(i.unitPrice) * i.qtyOrdered, 0) || 0
  const paidFor = (o) => o.payments?.reduce((s, p) => s + parseFloat(p.amount), 0) || 0

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">School Orders</h1><p className="text-sm text-slate-500">B2C  direct school sales</p></div>
        <button onClick={openCreate} className="btn-primary">+ New Order</button>
      </div>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['#','School','Set','Date','Total','Paid','Status','Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading...</td></tr>
            : data.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-slate-400">No school orders yet</td></tr>
            : data.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3.5 text-slate-400">#{r.id}</td>
                <td className="px-4 py-3.5 font-medium text-slate-800">{r.school?.name}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{r.bookSet?.name || 'Manual'}</td>
                <td className="px-4 py-3.5 text-slate-500">{new Date(r.orderDate).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 font-medium">{totalFor(r).toLocaleString()}</td>
                <td className="px-4 py-3.5">
                  <span className={paidFor(r) >= totalFor(r) ? 'text-green-600 font-medium' : 'text-orange-500'}>
                    {paidFor(r).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3.5"><Badge value={r.status} /></td>
                <td className="px-4 py-3.5 flex items-center gap-2 flex-wrap">
                  <button onClick={() => setViewModal(r)} className="act-view">View</button>
                  {['PENDING','PARTIAL'].includes(r.status) && <button onClick={() => openDeliver(r)} className="act-success">Deliver</button>}
                  {r.status === 'PENDING' && <button onClick={() => handleCancel(r.id)} className="act-danger">Cancel</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmModal}
      {modal && (
        <Modal title="New School Order" onClose={() => setModal(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 text-sm mb-2">
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" checked={orderType === 'set'} onChange={() => setOrderType('set')} /> From Book Set</label>
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" checked={orderType === 'manual'} onChange={() => setOrderType('manual')} /> Manual Items</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">School *</label>
                <select required value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))} className="select">
                  <option value="">Select school</option>
                  {schoolList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {orderType === 'set' && (
                <div>
                  <label className="label">Book Set *</label>
                  <select required value={form.setId} onChange={e => setForm(f => ({ ...f, setId: e.target.value }))} className="select">
                    <option value="">Select set</option>
                    {setList.map(s => <option key={s.id} value={s.id}>{s.name} — {s.className} ({s.school?.name})</option>)}
                  </select>
                </div>
              )}
              {orderType === 'set' && (
                <div>
                  <label className="label">No. of Students *</label>
                  <input
                    required type="number" min="1"
                    placeholder="e.g. 30"
                    value={form.students}
                    onChange={e => setForm(f => ({ ...f, students: e.target.value }))}
                    className="input"
                  />
                  {form.students > 0 && form.setId && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Each book in the set will be ordered × {form.students}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="label">Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="select" />
            </div>
            {orderType === 'manual' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600">Items *</label>
                  <button type="button" onClick={() => setManualItems(p => [...p, { bookId: '', qtyOrdered: '', unitPrice: '' }])} className="text-blue-600 text-xs hover:underline">+ Add Row</button>
                </div>
                <div className="space-y-2">
                  {manualItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-center">
                      <select required value={item.bookId} onChange={e => setManualItem(i, 'bookId', e.target.value)} className="col-span-2 border border-gray-300 rounded px-2 py-1.5 text-sm">
                        <option value="">Select book</option>
                        {bookList.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                      <input required type="number" min="1" placeholder="Qty" value={item.qtyOrdered} onChange={e => setManualItem(i, 'qtyOrdered', e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
                      <div className="flex gap-1">
                        <input required type="number" step="0.01" placeholder="" value={item.unitPrice} onChange={e => setManualItem(i, 'unitPrice', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        {manualItems.length > 1 && <button type="button" onClick={() => setManualItems(p => p.filter((_, idx) => idx !== i))} className="text-red-400 text-lg leading-none px-1">&times;</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button type="button" onClick={() => setModal(false)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-primary">Create Order</button>
            </div>
          </form>
        </Modal>
      )}

      {deliverModal && (
        <Modal title={`Update Delivery  Order #${deliverModal.id}`} onClose={() => setDeliverModal(null)}>
          <form onSubmit={handleDeliver} className="space-y-3">
            <p className="text-xs text-slate-500 mb-3">Enter quantity delivered for each book. Inventory will be deducted automatically.</p>
            {deliveries.map((d, i) => (
              <div key={d.itemId} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-slate-700">{d.book}</span>
                <span className="text-xs text-slate-400">Max: {d.max}</span>
                <input type="number" min="0" max={d.max} value={d.qtyDelivered} onChange={e => setDeliveries(p => p.map((x, idx) => idx === i ? { ...x, qtyDelivered: e.target.value } : x))}
                  placeholder="0" className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm" />
              </div>
            ))}
            <div className="modal-footer">
              <button type="button" onClick={() => setDeliverModal(null)} className="btn-white">Cancel</button>
              <button type="submit" className="btn-success">Save Delivery</button>
            </div>
          </form>
        </Modal>
      )}

      {viewModal && (
        <Modal title={`School Order #${viewModal.id}`} onClose={() => setViewModal(null)} wide>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-500">School:</span> <strong>{viewModal.school?.name}</strong></div>
              <div><span className="text-slate-500">Status:</span> <Badge value={viewModal.status} /></div>
              <div><span className="text-slate-500">Set:</span> {viewModal.bookSet?.name || 'Manual'}</div>
              <div><span className="text-slate-500">Date:</span> {new Date(viewModal.orderDate).toLocaleDateString()}</div>
            </div>
            <table className="w-full mt-2 border-t">
              <thead><tr className="text-xs text-slate-500 uppercase">{['Book','Ordered','Delivered','Price','Total'].map(h => <th key={h} className="py-2 text-left">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {viewModal.items?.map(i => (
                  <tr key={i.id}>
                    <td className="py-1.5">{i.book?.title}</td>
                    <td className="py-1.5">{i.qtyOrdered}</td>
                    <td className="py-1.5"><span className={i.qtyDelivered < i.qtyOrdered ? 'text-orange-500' : 'text-green-600'}>{i.qtyDelivered}</span></td>
                    <td className="py-1.5">{i.unitPrice}</td>
                    <td className="py-1.5 font-medium">{(parseFloat(i.unitPrice) * i.qtyOrdered).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span>Paid: <strong className="text-green-600">{paidFor(viewModal).toLocaleString()}</strong></span>
              <span>Total: <strong>{totalFor(viewModal).toLocaleString()}</strong></span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

