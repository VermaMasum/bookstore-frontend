import { toast } from 'react-toastify'
import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { vendorOrders as api, companies, books, invoices as invoiceApi } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import BookPickerTable from '../components/ui/BookPickerTable'
import useConfirm from '../hooks/useConfirm'
import InvoicePrint from '../components/InvoicePrint'

export default function VendorOrders() {
  const { data, loading, reload } = useFetch(api.getAll)
  const { data: companyList } = useFetch(companies.getAll)
  const { data: bookList } = useFetch(books.getAll)

  const { paginated, filtered, search, setSearch, filter, setFilter, page, setPage } = useTableState(data, {
    searchFields: ['company.name', 'notes'], filterField: 'status', perPage: 10,
  })

  const { confirm, confirmModal } = useConfirm()

  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [printInvoiceId, setPrintInvoiceId] = useState(null)
  const [invoiceModal, setInvoiceModal] = useState(null)
  const [discountPct, setDiscountPct] = useState('0')
  const [gstRate, setGstRate] = useState('0')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [form, setForm] = useState({ companyId: '', notes: '' })
  const [bookItems, setBookItems] = useState({})

  const openCreate = () => { setForm({ companyId: '', notes: '' }); setBookItems({}); setModal(true) }

  const handleBookChange = (bookId, field, value) => {
    setBookItems(prev => ({ ...prev, [bookId]: { ...prev[bookId], bookId, [field]: value } }))
  }

  const getItemsForSubmit = () =>
    Object.values(bookItems).filter(i => parseInt(i.quantity) > 0).map(i => ({
      bookId: i.bookId, quantity: parseInt(i.quantity), unitPrice: parseFloat(i.unitPrice || 0),
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const items = getItemsForSubmit()
    if (items.length === 0) return toast.warning('Select at least one book')
    if (items.some(i => !i.unitPrice || i.unitPrice <= 0)) return toast.warning('Enter selling price for all selected books')
    try { await api.create({ ...form, items }); setModal(false); reload(); toast.success('Created successfully') }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleAction = async (action, id, msg, successMsg) => {
    if (!await confirm(msg)) return
    try { await action(id); reload(); toast.success(successMsg || 'Done') } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleGenerateInvoice = (r) => {
    if (r.invoice) { setPrintInvoiceId(r.invoice.id); return }
    setDiscountPct('0'); setGstRate('0')
    setBuyerAddress(r.company?.address || '')
    setInvoiceModal(r)
  }

  const confirmGenerateInvoice = async () => {
    if (!invoiceModal) return
    try {
      const res = await invoiceApi.generate({ orderType: 'B2B', orderId: invoiceModal.id, discountPct: parseFloat(discountPct || 0), gstRate: parseFloat(gstRate || 0), supplyType: 'INTRA', buyerAddressOverride: buyerAddress })
      toast.success(`Invoice ${res.data.data.invoiceNumber} generated`)
      setInvoiceModal(null)
      reload()
      setPrintInvoiceId(res.data.data.id)
    } catch (err) { toast.error(err.response?.data?.message || 'Error generating invoice') }
  }

  const totalFor = (o) => o.items?.reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0) || 0
  const selectedCount = Object.values(bookItems).filter(i => parseInt(i.quantity) > 0).length

  return (
    <div>
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-4">
        <div><h1 className="text-xl font-bold text-gray-900">Vendor Orders</h1><p className="text-xs text-slate-400 mt-0.5">B2B Outward  sell to companys</p></div>
        <button onClick={openCreate} className="btn-primary">+ New Order</button>
      </div>

      <div className="table-wrap">
        <div className="filter-bar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company..."
            className="input flex-1 min-w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="select w-40">
            <option value="ALL">All Status</option>
            {['PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['#', 'Vendor', 'Date', 'Books', 'Total', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3.5 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">No results</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3.5 text-slate-400 text-xs">#{r.id}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{r.company?.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{new Date(r.orderDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.items?.length} title(s)</td>
                    <td className="px-4 py-3.5 font-medium">{totalFor(r).toLocaleString()}</td>
                    <td className="px-4 py-3.5"><Badge value={r.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setViewModal(r)} className="act-view">View</button>
                        {r.status === 'PENDING' && <button onClick={() => handleAction(api.dispatch, r.id, 'Dispatch? Inventory will be deducted.', 'Order dispatched — inventory deducted')} className="act-blue">Dispatch</button>}
                        {r.status === 'DISPATCHED' && <button onClick={() => handleAction(api.deliver, r.id, 'Mark as delivered?', 'Order marked as delivered')} className="act-success"> Delivered</button>}
                        {['PENDING', 'DISPATCHED'].includes(r.status) && <button onClick={() => handleAction(api.cancel, r.id, 'Cancel?', 'Order cancelled')} className="act-danger">Cancel</button>}
                        {r.status !== 'CANCELLED' && (
                          <button onClick={() => handleGenerateInvoice(r)} className={r.invoice ? 'act-view' : 'act-blue'} title={r.invoice ? `Invoice: ${r.invoice.invoiceNumber}` : 'Generate Invoice'}>
                            {r.invoice ? 'Invoice' : '+ Invoice'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} page={page} perPage={10} onChange={setPage} />
      </div>

      {confirmModal}
      {printInvoiceId && <InvoicePrint invoiceId={printInvoiceId} onClose={() => setPrintInvoiceId(null)} />}

      {invoiceModal && (
        <Modal title={`Generate Invoice — Order #${invoiceModal.id}`} onClose={() => setInvoiceModal(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded text-sm text-slate-600">
              <strong>{invoiceModal.company?.name}</strong> &bull; {invoiceModal.items?.length} book(s) &bull; Total: ₹{totalFor(invoiceModal).toLocaleString()}
            </div>
            <div>
              <label className="label">Buyer Address <span className="text-slate-400 font-normal">(shown on invoice — edit if needed)</span></label>
              <textarea
                value={buyerAddress}
                onChange={e => setBuyerAddress(e.target.value)}
                rows={2}
                className="input w-full resize-none"
                placeholder="Street, City, State - PIN"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Discount %</label>
                <input type="number" min="0" max="100" step="0.5"
                  value={discountPct} onChange={e => setDiscountPct(e.target.value)}
                  className="input" placeholder="0" />
              </div>
              <div>
                <label className="label">GST Rate %</label>
                <select value={gstRate} onChange={e => setGstRate(e.target.value)} className="select">
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
            {parseFloat(gstRate) > 0 && (
              <p className="text-[11px] text-indigo-500">GST will be split as CGST {parseFloat(gstRate)/2}% + SGST {parseFloat(gstRate)/2}%</p>
            )}
            <p className="text-[11px] text-slate-400">Invoice number will be auto-assigned.</p>
            <div className="modal-footer">
              <button onClick={() => setInvoiceModal(null)} className="btn-white">Cancel</button>
              <button onClick={confirmGenerateInvoice} className="btn-primary">Generate &amp; View Invoice</button>
            </div>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="New Vendor Order" onClose={() => setModal(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Company *</label>
                <select required value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))} className="select">
                  <option value="">Select company</option>
                  {companyList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="select" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Select Books & Selling Price</label>
                {selectedCount > 0 && <span className="text-xs text-blue-600 font-medium">{selectedCount} selected</span>}
              </div>
              <BookPickerTable
                books={bookList}
                items={Object.values(bookItems)}
                onChange={handleBookChange}
                columns={[{ key: 'unitPrice', label: 'Sell ', placeholder: '0.00' }]}
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
        <Modal title={`Vendor Order #${viewModal.id}`} onClose={() => setViewModal(null)} wide>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm p-3 bg-slate-50 rounded">
              <div><span className="text-slate-500">Vendor:</span> <strong>{viewModal.company?.name}</strong></div>
              <div><span className="text-slate-500">Status:</span> <Badge value={viewModal.status} /></div>
              <div><span className="text-slate-500">Date:</span> {new Date(viewModal.orderDate).toLocaleDateString()}</div>
              {viewModal.notes && <div><span className="text-slate-500">Notes:</span> {viewModal.notes}</div>}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['Book', 'Qty', 'Sell Price', 'Total'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {viewModal.items?.map(i => (
                  <tr key={i.id}>
                    <td className="px-3 py-2">{i.book?.title}</td>
                    <td className="px-3 py-2">{i.quantity}</td>
                    <td className="px-3 py-2">{i.unitPrice}</td>
                    <td className="px-3 py-2 font-medium">{(parseFloat(i.unitPrice) * i.quantity).toLocaleString()}</td>
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

