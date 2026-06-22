import { useEffect, useState, useRef } from 'react'
import { invoices as api } from '../api'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function buildPrintHTML(inv) {
  const shop = inv.shopSettings
  const hasDiscount = parseFloat(inv.discountTotal) > 0
  const hasClass = inv.items.some(i => i.bookClass)
  const hasPublisher = inv.items.some(i => i.publisher)

  const itemRows = inv.items.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#fff' : '#f7f7f7'}; border-bottom:1px solid #ddd;">
      <td style="padding:5px 8px;text-align:center;">${idx + 1}</td>
      <td style="padding:5px 8px;font-weight:500;">${item.bookTitle}</td>
      ${hasClass ? `<td style="padding:5px 8px;text-align:center;">${item.bookClass || '—'}</td>` : ''}
      ${hasPublisher ? `<td style="padding:5px 8px;">${item.publisher || '—'}</td>` : ''}
      <td style="padding:5px 8px;text-align:center;">${item.qty}</td>
      <td style="padding:5px 8px;text-align:right;">${fmt(item.unitPrice)}</td>
      ${hasDiscount ? `<td style="padding:5px 8px;text-align:center;">${parseFloat(item.discountPct) > 0 ? parseFloat(item.discountPct) + '%' : '—'}</td>` : ''}
      <td style="padding:5px 8px;text-align:right;font-weight:600;">${fmt(item.amount)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${inv.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
    @page { margin: 10mm; size: A4 portrait; }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #222;padding-bottom:10px;margin-bottom:10px;">
    <div>
      <div style="font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:0.5px;">${shop.shopName}</div>
      ${shop.address ? `<div style="margin-top:2px;">${shop.address}${shop.city ? ', ' + shop.city : ''}</div>` : ''}
      ${(shop.state || shop.pincode) ? `<div>${[shop.state, shop.pincode].filter(Boolean).join(' - ')}</div>` : ''}
      ${shop.phone ? `<div>Ph: ${shop.phone}</div>` : ''}
      ${shop.email ? `<div>${shop.email}</div>` : ''}
      ${shop.gstin ? `<div style="margin-top:4px;"><strong>GSTIN:</strong> ${shop.gstin}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div style="font-size:15px;font-weight:800;border:1.5px solid #222;padding:4px 12px;display:inline-block;margin-bottom:8px;">TAX INVOICE / CASH MEMO</div>
      <div><strong>Invoice No:</strong> ${inv.invoiceNumber}</div>
      <div><strong>Date:</strong> ${fmtDate(inv.createdAt)}</div>
      <div><strong>Type:</strong> ${inv.orderType === 'B2B' ? 'B2B — Vendor' : 'B2C — School'}</div>
    </div>
  </div>

  <!-- Bill To -->
  <div style="border:1px solid #ccc;border-radius:4px;padding:8px 12px;margin-bottom:12px;background:#fafafa;">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:4px;">Bill To</div>
    <div style="font-weight:700;font-size:14px;">${inv.buyerName}</div>
    ${inv.buyerAddress ? `<div>${inv.buyerAddress}</div>` : ''}
    <div style="display:flex;gap:20px;margin-top:2px;flex-wrap:wrap;">
      ${inv.buyerGstin ? `<span><strong>GSTIN:</strong> ${inv.buyerGstin}</span>` : ''}
      ${inv.buyerPhone ? `<span><strong>Ph:</strong> ${inv.buyerPhone}</span>` : ''}
      ${inv.buyerEmail ? `<span>${inv.buyerEmail}</span>` : ''}
    </div>
  </div>

  <!-- Items Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11.5px;">
    <thead>
      <tr style="background:#222;color:#fff;">
        <th style="padding:7px 8px;text-align:center;font-weight:600;font-size:11px;">Sr.</th>
        <th style="padding:7px 8px;text-align:left;font-weight:600;font-size:11px;">Book Name</th>
        ${hasClass ? '<th style="padding:7px 8px;text-align:center;font-weight:600;font-size:11px;">Class</th>' : ''}
        ${hasPublisher ? '<th style="padding:7px 8px;text-align:left;font-weight:600;font-size:11px;">Publisher</th>' : ''}
        <th style="padding:7px 8px;text-align:center;font-weight:600;font-size:11px;">Qty</th>
        <th style="padding:7px 8px;text-align:right;font-weight:600;font-size:11px;">Rate (₹)</th>
        ${hasDiscount ? '<th style="padding:7px 8px;text-align:center;font-weight:600;font-size:11px;">Disc%</th>' : ''}
        <th style="padding:7px 8px;text-align:right;font-weight:600;font-size:11px;">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
    <table style="min-width:260px;font-size:12px;">
      <tbody>
        <tr>
          <td style="padding:3px 10px;color:#555;">Sub Total</td>
          <td style="padding:3px 10px;text-align:right;">₹ ${fmt(inv.subtotal)}</td>
        </tr>
        ${hasDiscount ? `<tr>
          <td style="padding:3px 10px;color:#555;">Discount</td>
          <td style="padding:3px 10px;text-align:right;color:#c00;">- ₹ ${fmt(inv.discountTotal)}</td>
        </tr>` : ''}
        ${(hasDiscount || parseFloat(inv.taxAmount) > 0) ? `<tr style="border-top:1px solid #ddd;">
          <td style="padding:3px 10px;color:#555;">Taxable Amount</td>
          <td style="padding:3px 10px;text-align:right;">₹ ${fmt(parseFloat(inv.subtotal) - parseFloat(inv.discountTotal))}</td>
        </tr>` : ''}
        ${parseFloat(inv.taxAmount) > 0 && inv.supplyType === 'INTRA' ? `
        <tr>
          <td style="padding:3px 10px;color:#555;">CGST @ ${parseFloat(inv.gstRate) / 2}%</td>
          <td style="padding:3px 10px;text-align:right;">₹ ${fmt(parseFloat(inv.taxAmount) / 2)}</td>
        </tr>
        <tr>
          <td style="padding:3px 10px;color:#555;">SGST @ ${parseFloat(inv.gstRate) / 2}%</td>
          <td style="padding:3px 10px;text-align:right;">₹ ${fmt(parseFloat(inv.taxAmount) / 2)}</td>
        </tr>` : ''}
        ${parseFloat(inv.taxAmount) > 0 && inv.supplyType === 'INTER' ? `
        <tr>
          <td style="padding:3px 10px;color:#555;">IGST @ ${parseFloat(inv.gstRate)}%</td>
          <td style="padding:3px 10px;text-align:right;">₹ ${fmt(inv.taxAmount)}</td>
        </tr>` : ''}
        <tr style="border-top:2px solid #222;">
          <td style="padding:5px 10px;font-weight:800;font-size:13px;">Net Amount</td>
          <td style="padding:5px 10px;text-align:right;font-weight:800;font-size:14px;">₹ ${fmt(inv.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${inv.notes ? `<div style="margin-bottom:12px;font-size:11px;color:#555;"><strong>Note:</strong> ${inv.notes}</div>` : ''}

  <!-- Bank Details -->
  ${(shop.bankName || shop.accountNo) ? `
  <div style="border-top:1px solid #ccc;padding-top:8px;margin-bottom:24px;font-size:11px;">
    <div style="font-weight:700;margin-bottom:3px;font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#666;">Bank Details</div>
    <div style="display:flex;gap:24px;flex-wrap:wrap;">
      ${shop.bankName ? `<span><strong>Bank:</strong> ${shop.bankName}</span>` : ''}
      ${shop.accountNo ? `<span><strong>A/C No:</strong> ${shop.accountNo}</span>` : ''}
      ${shop.ifscCode ? `<span><strong>IFSC:</strong> ${shop.ifscCode}</span>` : ''}
    </div>
  </div>` : ''}

  <!-- Signatures -->
  <div style="display:flex;justify-content:space-between;margin-top:40px;padding-top:8px;border-top:1px solid #ccc;">
    <div style="text-align:center;min-width:160px;">
      <div style="border-top:1px solid #555;margin-top:36px;padding-top:4px;font-size:11px;color:#444;">Buyer's Signature</div>
    </div>
    <div style="text-align:center;min-width:180px;">
      <div style="border-top:1px solid #555;margin-top:36px;padding-top:4px;font-size:11px;color:#444;">Authorized Signature &amp; Seal</div>
    </div>
  </div>

  <div style="text-align:center;margin-top:16px;font-size:10px;color:#999;">
    This is a computer-generated invoice. Thank you for your business.
  </div>

</body>
</html>`
}

export default function InvoicePrint({ invoiceId, onClose }) {
  const [inv, setInv] = useState(null)
  const [loading, setLoading] = useState(true)
  const previewRef = useRef(null)

  useEffect(() => {
    api.getById(invoiceId)
      .then(r => { setInv(r.data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [invoiceId])

  const handlePrint = () => {
    const html = buildPrintHTML(inv)

    // Create a hidden iframe — avoids popup blockers, prints cleanly
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(html)
    doc.close()

    iframe.onload = () => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-3xl">

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white rounded-t-xl px-5 py-3 border-b border-gray-100 shadow">
          <span className="text-sm font-semibold text-slate-700">
            {inv ? inv.invoiceNumber : 'Invoice Preview'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={!inv}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="bg-white border border-gray-200 text-slate-600 text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Preview panel */}
        <div className="bg-white shadow-xl rounded-b-xl overflow-hidden">
          {loading && <p className="text-center py-16 text-slate-400">Loading invoice...</p>}
          {!loading && !inv && <p className="text-center py-16 text-red-400">Invoice not found</p>}
          {inv && (
            <div
              ref={previewRef}
              className="p-6 overflow-auto"
              style={{ maxHeight: '75vh' }}
              dangerouslySetInnerHTML={{ __html: buildPrintHTML(inv) }}
            />
          )}
        </div>

      </div>
    </div>
  )
}
