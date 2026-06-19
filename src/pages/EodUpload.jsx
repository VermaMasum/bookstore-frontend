import { useState, useRef } from 'react'
import { eodUpload as api } from '../api'
import { toast } from 'react-toastify'

export default function EodUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').filter(Boolean)
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1, 6).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
        return Object.fromEntries(headers.map((h, i) => [h, cols[i] || '']))
      })
      setPreview(rows)
    }
    reader.readAsText(f)
  }

  const handleSubmit = async () => {
    if (!file) return toast.warning('Please select a CSV file first')
    setLoading(true)
    try {
      const res = await api.upload(file)
      setResult(res.data)
      toast.success(res.data.message)
      setFile(null)
      setPreview([])
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">EOD Upload</h1>
        <p className="text-xs text-slate-400 mt-0.5">Upload end-of-day retail sales sheet to create school orders automatically</p>
      </div>

      {/* Format guide */}
      <div className="table-wrap p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">CSV Format Required</p>
          <a
            href="/api/eod-upload/template"
            download
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Download Template CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100">
                {['school_name', 'isbn', 'qty', 'unit_price', 'notes (optional)'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-mono text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-500">DPS School</td>
                <td className="px-3 py-2 text-slate-500 font-mono">9789387421022</td>
                <td className="px-3 py-2 text-slate-500">5</td>
                <td className="px-3 py-2 text-slate-500">400</td>
                <td className="px-3 py-2 text-slate-400"></td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-3 py-2 text-slate-500">Apeejay School</td>
                <td className="px-3 py-2 text-slate-500 font-mono">9788174507242</td>
                <td className="px-3 py-2 text-slate-500">3</td>
                <td className="px-3 py-2 text-slate-500">220</td>
                <td className="px-3 py-2 text-slate-400">Class 11</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          School name must match exactly (case-insensitive). Books are matched by ISBN. Multiple rows for the same school are grouped into one order.
        </p>
      </div>

      {/* Upload area */}
      <div className="table-wrap p-5 mb-5">
        <label className="label">Select CSV File</label>
        <div className="flex gap-3 items-center mt-1">
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={e => handleFile(e.target.files[0])}
            className="block text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && <span className="text-xs text-green-600 font-medium">{file.name}</span>}
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Preview (first 5 rows)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-100 rounded">
                <thead className="bg-slate-50">
                  <tr>
                    {Object.keys(preview[0]).map(h => (
                      <th key={h} className="px-3 py-2 text-left font-mono text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-slate-600">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upload & Create Orders'}
          </button>
          {file && (
            <button onClick={() => { setFile(null); setPreview([]); setResult(null); if (inputRef.current) inputRef.current.value = '' }} className="btn-white">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="table-wrap p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">{result.message}</p>

          {result.created.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Created Orders</p>
              <div className="space-y-1">
                {result.created.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="font-medium text-slate-700">{c.school}</span>
                    <span className="text-slate-400">— Order #{c.orderId} ({c.itemCount} item(s))</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Errors</p>
              <div className="space-y-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1.5" />
                    <span className="text-red-600">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
