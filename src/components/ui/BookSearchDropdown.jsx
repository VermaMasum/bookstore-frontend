import { useState, useRef } from 'react'

export default function BookSearchDropdown({ books = [], items = [], onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  const selectedIds = new Set(items.map(i => i.bookId))

  const filtered = query.trim()
    ? books.filter(b =>
        !selectedIds.has(b.id) &&
        (b.title.toLowerCase().includes(query.toLowerCase()) ||
         (b.isbn && b.isbn.includes(query)))
      ).slice(0, 8)
    : []

  const addBook = (book) => {
    onChange([...items, { bookId: book.id, title: book.title, quantity: 1, costPrice: parseFloat(book.costPrice) }])
    setQuery('')
    inputRef.current?.focus()
  }

  const updateQty = (bookId, qty) => {
    const n = parseInt(qty)
    if (isNaN(n) || n < 1) return
    onChange(items.map(i => i.bookId === bookId ? { ...i, quantity: n } : i))
  }

  const remove = (bookId) => onChange(items.filter(i => i.bookId !== bookId))

  return (
    <div>
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type book name or ISBN to search..."
          className="input w-full"
          autoComplete="off"
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-30 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-56 overflow-y-auto">
            {filtered.map(b => (
              <button
                key={b.id}
                type="button"
                onMouseDown={() => addBook(b)}
                className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 text-sm border-b border-slate-50 last:border-0 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{b.title}</p>
                  {b.isbn && <p className="text-xs text-slate-400">{b.isbn}</p>}
                </div>
                <span className="text-xs text-slate-400 shrink-0">₹{parseFloat(b.costPrice).toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
        {open && query.trim() && filtered.length === 0 && (
          <div className="absolute z-30 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 px-4 py-3 text-sm text-slate-400">
            No books found for "{query}"
          </div>
        )}
      </div>

      {/* Selected books list */}
      {items.length > 0 ? (
        <div className="mt-2 border border-slate-100 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide flex justify-between">
            <span>Selected Books ({items.length})</span>
            <span>Qty</span>
          </div>
          <div className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <div key={item.bookId} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50">
                <span className="text-slate-300 text-xs w-5 shrink-0">{idx + 1}</span>
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.title}</span>
                <span className="text-xs text-slate-400 shrink-0">₹{item.costPrice?.toLocaleString()}</span>
                <input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={e => updateQty(item.bookId, e.target.value)}
                  className="w-14 text-center text-sm border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => remove(item.bookId)}
                  className="text-slate-300 hover:text-red-500 transition text-base leading-none px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 mt-2 text-center py-3 border border-dashed border-slate-200 rounded-lg">
          No books added yet — search and select books above
        </p>
      )}
    </div>
  )
}
