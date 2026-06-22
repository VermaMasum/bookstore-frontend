import { toast } from 'react-toastify'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import useTableState from '../hooks/useTableState'
import { books as api, publishers } from '../api'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import useConfirm from '../hooks/useConfirm'

const BOARDS = ['ICSE', 'CBSE', 'State Board']
const LEVELS = ['Nursery', 'LKG', 'UKG', 'Primary (1–5)', 'Middle (6–8)', 'SSC (9–10)', 'HSC (11–12)', 'Other']

const empty = { title: '', isbn: '', author: '', publisherId: '', category: '', board: '', level: '', costPrice: '' }

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
    const rows = [
      'title,publisher_name,cost_price,isbn,author,category,board,level',
      // CBSE Class 1-5
      'English Reader Class 1,NCERT,85.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 1,NCERT,80.00,,NCERT,Textbook,CBSE,SSC',
      'Environmental Studies Class 1,NCERT,75.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Rimjhim Class 1,NCERT,75.00,,NCERT,Textbook,CBSE,SSC',
      'English Reader Class 2,NCERT,90.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 2,NCERT,85.00,,NCERT,Textbook,CBSE,SSC',
      'Environmental Studies Class 2,NCERT,80.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Rimjhim Class 2,NCERT,80.00,,NCERT,Textbook,CBSE,SSC',
      'English Reader Class 3,NCERT,95.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 3,NCERT,90.00,,NCERT,Textbook,CBSE,SSC',
      'Environmental Studies Class 3,NCERT,85.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Rimjhim Class 3,NCERT,85.00,,NCERT,Textbook,CBSE,SSC',
      'English Reader Class 4,NCERT,100.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 4,NCERT,95.00,,NCERT,Textbook,CBSE,SSC',
      'Environmental Studies Class 4,NCERT,90.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Rimjhim Class 4,NCERT,90.00,,NCERT,Textbook,CBSE,SSC',
      'English Reader Class 5,NCERT,105.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 5,NCERT,100.00,,NCERT,Textbook,CBSE,SSC',
      'Environmental Studies Class 5,NCERT,95.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Rimjhim Class 5,NCERT,95.00,,NCERT,Textbook,CBSE,SSC',
      // CBSE Class 6-10
      'English Class 6,NCERT,110.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 6,NCERT,120.00,,NCERT,Textbook,CBSE,SSC',
      'Science Class 6,NCERT,115.00,,NCERT,Textbook,CBSE,SSC',
      'Social Science Class 6,NCERT,110.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Class 6,NCERT,105.00,,NCERT,Textbook,CBSE,SSC',
      'English Class 7,NCERT,115.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 7,NCERT,125.00,,NCERT,Textbook,CBSE,SSC',
      'Science Class 7,NCERT,120.00,,NCERT,Textbook,CBSE,SSC',
      'Social Science Class 7,NCERT,115.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Class 7,NCERT,110.00,,NCERT,Textbook,CBSE,SSC',
      'English Class 8,NCERT,120.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 8,NCERT,130.00,,NCERT,Textbook,CBSE,SSC',
      'Science Class 8,NCERT,125.00,,NCERT,Textbook,CBSE,SSC',
      'Social Science Class 8,NCERT,120.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Class 8,NCERT,115.00,,NCERT,Textbook,CBSE,SSC',
      'English Language & Literature Class 9,NCERT,140.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Class 9,NCERT,150.00,,NCERT,Textbook,CBSE,SSC',
      'Science Class 9,NCERT,145.00,,NCERT,Textbook,CBSE,SSC',
      'Social Science Class 9,NCERT,140.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Class 9,NCERT,130.00,,NCERT,Textbook,CBSE,SSC',
      'English Language & Literature Class 10,NCERT,145.00,,NCERT,Textbook,CBSE,SSC',
      'Mathematics Standard Class 10,NCERT,155.00,,NCERT,Textbook,CBSE,SSC',
      'Science Class 10,NCERT,150.00,,NCERT,Textbook,CBSE,SSC',
      'Social Science Class 10,NCERT,145.00,,NCERT,Textbook,CBSE,SSC',
      'Hindi Class 10,NCERT,135.00,,NCERT,Textbook,CBSE,SSC',
      // CBSE Class 11-12
      'Physics Part 1 Class 11,NCERT,175.00,,NCERT,Textbook,CBSE,HSC',
      'Chemistry Part 1 Class 11,NCERT,170.00,,NCERT,Textbook,CBSE,HSC',
      'Mathematics Class 11,NCERT,185.00,,NCERT,Textbook,CBSE,HSC',
      'Biology Class 11,NCERT,180.00,,NCERT,Textbook,CBSE,HSC',
      'English Hornbill Class 11,NCERT,130.00,,NCERT,Textbook,CBSE,HSC',
      'Physics Part 1 Class 12,NCERT,180.00,,NCERT,Textbook,CBSE,HSC',
      'Chemistry Part 1 Class 12,NCERT,175.00,,NCERT,Textbook,CBSE,HSC',
      'Mathematics Class 12,NCERT,190.00,,NCERT,Textbook,CBSE,HSC',
      'Biology Class 12,NCERT,185.00,,NCERT,Textbook,CBSE,HSC',
      'English Flamingo Class 12,NCERT,135.00,,NCERT,Textbook,CBSE,HSC',
      // ICSE Class 1-5
      'English Class 1,Frank Educational Aids,95.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Mathematics Class 1,Frank Educational Aids,90.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Hindi Class 1,Saraswati,80.00,,Saraswati,Textbook,ICSE,SSC',
      'English Class 2,Frank Educational Aids,100.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Mathematics Class 2,Frank Educational Aids,95.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Hindi Class 2,Saraswati,85.00,,Saraswati,Textbook,ICSE,SSC',
      'English Class 3,Frank Educational Aids,105.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Mathematics Class 3,Frank Educational Aids,100.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Hindi Class 3,Saraswati,88.00,,Saraswati,Textbook,ICSE,SSC',
      'English Class 4,Frank Educational Aids,110.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Mathematics Class 4,Frank Educational Aids,105.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Hindi Class 4,Saraswati,92.00,,Saraswati,Textbook,ICSE,SSC',
      'English Class 5,Frank Educational Aids,115.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Mathematics Class 5,Frank Educational Aids,110.00,,A. Fernandez,Textbook,ICSE,SSC',
      'Hindi Class 5,Saraswati,95.00,,Saraswati,Textbook,ICSE,SSC',
      // ICSE Class 6-10
      'English Class 6,Oxford Press,130.00,,Xavier Pinto,Textbook,ICSE,SSC',
      'Mathematics Class 6,S. Chand,140.00,,R.S. Aggarwal,Textbook,ICSE,SSC',
      'Science Class 6,S. Chand,135.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'History & Civics Class 6,Goyal Brothers,125.00,,D.N. Kundra,Textbook,ICSE,SSC',
      'Geography Class 6,Oxford Press,120.00,,I.C.S.E. Board,Textbook,ICSE,SSC',
      'English Class 7,Oxford Press,135.00,,Xavier Pinto,Textbook,ICSE,SSC',
      'Mathematics Class 7,S. Chand,145.00,,R.S. Aggarwal,Textbook,ICSE,SSC',
      'Science Class 7,S. Chand,140.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'History & Civics Class 7,Goyal Brothers,130.00,,D.N. Kundra,Textbook,ICSE,SSC',
      'Geography Class 7,Oxford Press,125.00,,I.C.S.E. Board,Textbook,ICSE,SSC',
      'English Class 8,Oxford Press,140.00,,Xavier Pinto,Textbook,ICSE,SSC',
      'Mathematics Class 8,S. Chand,150.00,,R.S. Aggarwal,Textbook,ICSE,SSC',
      'Science Class 8,S. Chand,145.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'History & Civics Class 8,Goyal Brothers,135.00,,D.N. Kundra,Textbook,ICSE,SSC',
      'Geography Class 8,Oxford Press,130.00,,I.C.S.E. Board,Textbook,ICSE,SSC',
      'English Language Class 9,Morning Star,160.00,,Sunrise,Textbook,ICSE,SSC',
      'Mathematics Class 9,S. Chand,170.00,,R.S. Aggarwal,Textbook,ICSE,SSC',
      'Physics Class 9,S. Chand,165.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'Chemistry Class 9,S. Chand,160.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'History & Civics Class 9,Goyal Brothers,145.00,,D.N. Kundra,Textbook,ICSE,SSC',
      'English Language Class 10,Morning Star,165.00,,Sunrise,Textbook,ICSE,SSC',
      'Mathematics Class 10,S. Chand,175.00,,R.S. Aggarwal,Textbook,ICSE,SSC',
      'Physics Class 10,S. Chand,170.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'Chemistry Class 10,S. Chand,165.00,,Lakhmir Singh,Textbook,ICSE,SSC',
      'History & Civics Class 10,Goyal Brothers,150.00,,D.N. Kundra,Textbook,ICSE,SSC',
      // ICSE Class 11-12
      'Physics Class 11,S. Chand,310.00,,S.L. Arora,Textbook,ICSE,HSC',
      'Chemistry Class 11,S. Chand,295.00,,P. Bahadur,Textbook,ICSE,HSC',
      'Mathematics Class 11,S. Chand,320.00,,R.D. Sharma,Textbook,ICSE,HSC',
      'Biology Class 11,S. Chand,300.00,,B.P. Pandey,Textbook,ICSE,HSC',
      'English Class 11,Oxford Press,175.00,,Xavier Pinto,Textbook,ICSE,HSC',
      'Physics Class 12,S. Chand,320.00,,S.L. Arora,Textbook,ICSE,HSC',
      'Chemistry Class 12,S. Chand,305.00,,P. Bahadur,Textbook,ICSE,HSC',
      'Mathematics Class 12,S. Chand,330.00,,R.D. Sharma,Textbook,ICSE,HSC',
      'Biology Class 12,S. Chand,310.00,,B.P. Pandey,Textbook,ICSE,HSC',
      'English Class 12,Oxford Press,180.00,,Xavier Pinto,Textbook,ICSE,HSC',
      // State Board Class 1-5
      'English Class 1,Saraswati,80.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 1,Saraswati,75.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 1,Saraswati,70.00,,Saraswati,Textbook,State Board,SSC',
      'Hindi Class 1,Saraswati,68.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 2,Saraswati,85.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 2,Saraswati,80.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 2,Saraswati,75.00,,Saraswati,Textbook,State Board,SSC',
      'Hindi Class 2,Saraswati,72.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 3,Saraswati,90.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 3,Saraswati,85.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 3,Saraswati,80.00,,Saraswati,Textbook,State Board,SSC',
      'Hindi Class 3,Saraswati,76.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 4,Saraswati,95.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 4,Saraswati,90.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 4,Saraswati,85.00,,Saraswati,Textbook,State Board,SSC',
      'Hindi Class 4,Saraswati,80.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 5,Saraswati,100.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 5,Saraswati,95.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 5,Saraswati,90.00,,Saraswati,Textbook,State Board,SSC',
      'Hindi Class 5,Saraswati,85.00,,Saraswati,Textbook,State Board,SSC',
      // State Board Class 6-10
      'English Class 6,Saraswati,115.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 6,Saraswati,120.00,,Saraswati,Textbook,State Board,SSC',
      'Science Class 6,Saraswati,118.00,,Saraswati,Textbook,State Board,SSC',
      'Social Science Class 6,Saraswati,112.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 6,Saraswati,105.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 7,Saraswati,120.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 7,Saraswati,125.00,,Saraswati,Textbook,State Board,SSC',
      'Science Class 7,Saraswati,122.00,,Saraswati,Textbook,State Board,SSC',
      'Social Science Class 7,Saraswati,116.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 7,Saraswati,108.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 8,Saraswati,125.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 8,Saraswati,130.00,,Saraswati,Textbook,State Board,SSC',
      'Science Class 8,Saraswati,128.00,,Saraswati,Textbook,State Board,SSC',
      'Social Science Class 8,Saraswati,122.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 8,Saraswati,114.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 9,Saraswati,140.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 9,Saraswati,148.00,,Saraswati,Textbook,State Board,SSC',
      'Science & Technology Class 9,Saraswati,145.00,,Saraswati,Textbook,State Board,SSC',
      'Social Science Class 9,Saraswati,138.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 9,Saraswati,125.00,,Saraswati,Textbook,State Board,SSC',
      'English Class 10,Saraswati,145.00,,Saraswati,Textbook,State Board,SSC',
      'Mathematics Class 10,Saraswati,155.00,,Saraswati,Textbook,State Board,SSC',
      'Science & Technology Class 10,Saraswati,150.00,,Saraswati,Textbook,State Board,SSC',
      'Social Science Class 10,Saraswati,142.00,,Saraswati,Textbook,State Board,SSC',
      'Marathi Class 10,Saraswati,128.00,,Saraswati,Textbook,State Board,SSC',
      // State Board Class 11-12
      'Physics Class 11,Saraswati,185.00,,Saraswati,Textbook,State Board,HSC',
      'Chemistry Class 11,Saraswati,180.00,,Saraswati,Textbook,State Board,HSC',
      'Mathematics Class 11,Saraswati,190.00,,Saraswati,Textbook,State Board,HSC',
      'Biology Class 11,Saraswati,182.00,,Saraswati,Textbook,State Board,HSC',
      'English Class 11,Saraswati,140.00,,Saraswati,Textbook,State Board,HSC',
      'Physics Class 12,Saraswati,190.00,,Saraswati,Textbook,State Board,HSC',
      'Chemistry Class 12,Saraswati,185.00,,Saraswati,Textbook,State Board,HSC',
      'Mathematics Class 12,Saraswati,195.00,,Saraswati,Textbook,State Board,HSC',
      'Biology Class 12,Saraswati,188.00,,Saraswati,Textbook,State Board,HSC',
      'English Class 12,Saraswati,145.00,,Saraswati,Textbook,State Board,HSC',
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
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
        toast.warning(`${added} added, ${skipped.length} skipped`)
        if (added === 0 && skipped.length > 0) {
          const reason = skipped[0]?.reason || 'Unknown'
          toast.error(`All rows skipped — first reason: "${reason}". Check console for details.`)
        }
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
    setForm({ title: r.title, isbn: r.isbn || '', author: r.author || '', publisherId: r.publisherId, category: r.category || '', board: r.board || '', level: r.level || '', costPrice: r.costPrice })
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
              {['Title', 'Author', 'Publisher', 'Category', 'Board', 'Level', 'Cost Price', 'Added On'].map(h => (
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
            {loading ? <tr><td colSpan={10} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : paginated.length === 0 ? <tr><td colSpan={10} className="text-center py-8 text-slate-400">{search ? 'No results' : 'No books yet'}</td></tr>
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
                    <td className="px-4 py-3.5">
                      {r.board ? <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{r.board}</span> : ''}
                    </td>
                    <td className="px-4 py-3.5">
                      {r.level ? <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs">{r.level}</span> : ''}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{r.costPrice}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
            <div><label className="label">Cost Price *</label>
              <input required type="number" step="0.01" value={form.costPrice} onChange={set('costPrice')} className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Board</label>
                <select value={form.board} onChange={set('board')} className="input">
                  <option value="">Select board</option>
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select></div>
              <div><label className="label">Level</label>
                <select value={form.level} onChange={set('level')} className="input">
                  <option value="">Select level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select></div>
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

