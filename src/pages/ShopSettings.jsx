import { useState, useEffect } from 'react'
import { shopSettings as api } from '../api'
import { toast } from 'react-toastify'

export default function ShopSettings() {
  const [form, setForm] = useState({
    shopName: '', address: '', city: '', state: '', pincode: '',
    gstin: '', phone: '', email: '',
    bankName: '', accountNo: '', ifscCode: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get().then(r => { setForm(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.update(form)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading settings...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Shop Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Configure details that appear on all invoices</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="table-wrap p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Business Info</p>
          <div>
            <label className="label">Shop / Business Name *</label>
            <input required value={form.shopName} onChange={set('shopName')} className="input" placeholder="My Bookstore" />
          </div>
          <div>
            <label className="label">Address</label>
            <input value={form.address} onChange={set('address')} className="input" placeholder="Street / Building" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">City</label>
              <input value={form.city} onChange={set('city')} className="input" placeholder="Delhi" />
            </div>
            <div>
              <label className="label">State</label>
              <input value={form.state} onChange={set('state')} className="input" placeholder="Delhi" />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input value={form.pincode} onChange={set('pincode')} className="input" placeholder="110001" maxLength={6} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={set('phone')} className="input" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="shop@example.com" />
            </div>
          </div>
        </div>

        {/* GST */}
        <div className="table-wrap p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">GST Details</p>
          <div>
            <label className="label">GSTIN</label>
            <input value={form.gstin} onChange={set('gstin')} className="input font-mono uppercase" placeholder="07AABCD1234E1Z5" maxLength={15} />
            <p className="text-[11px] text-slate-400 mt-1">15-digit GST Identification Number (seller's GSTIN)</p>
          </div>
        </div>

        {/* Bank */}
        <div className="table-wrap p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Bank Details (shown on invoice)</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Bank Name</label>
              <input value={form.bankName} onChange={set('bankName')} className="input" placeholder="State Bank of India" />
            </div>
            <div>
              <label className="label">Account No.</label>
              <input value={form.accountNo} onChange={set('accountNo')} className="input font-mono" placeholder="12345678901" />
            </div>
            <div>
              <label className="label">IFSC Code</label>
              <input value={form.ifscCode} onChange={set('ifscCode')} className="input font-mono uppercase" placeholder="SBIN0001234" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
