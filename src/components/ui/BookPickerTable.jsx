import { useState } from 'react'

/**
 * Reusable book picker for forms.
 * columns: array of { key, label, placeholder, type? } — extra input columns beyond qty
 * items: [{ bookId, quantity, ...extras }]
 * onChange(bookId, field, value)
 */
export default function BookPickerTable({ books = [], items = [], onChange, columns = [], checkboxMode = false }) {
  const [search, setSearch] = useState('')

  const visible = books.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.publisher?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const selected = items.filter(i => parseInt(i.quantity) > 0)

  const toggleAll = (checked) => {
    visible.forEach(b => onChange(b.id, 'quantity', checked ? 1 : 0))
  }

  const allVisibleSelected = visible.length > 0 && visible.every(b => {
    const item = items.find(i => parseInt(i.bookId) === b.id)
    return parseInt(item?.quantity) > 0
  })

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          placeholder="Search books..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
        {checkboxMode && visible.length > 0 && (
          <button
            type="button"
            onClick={() => toggleAll(!allVisibleSelected)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 whitespace-nowrap"
          >
            {allVisibleSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-blue-600 font-medium">{selected.length} book(s) selected</p>
      )}
      <div className="border rounded overflow-hidden max-h-72 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {checkboxMode && <th className="px-3 py-2 text-xs font-medium text-gray-500 text-center w-10"></th>}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Book</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Publisher</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">MRP</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 text-center">Qty</th>
              {columns.map(c => (
                <th key={c.key} className="px-3 py-2 text-xs font-medium text-gray-500">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 && (
              <tr><td colSpan={4 + columns.length + (checkboxMode ? 1 : 0)} className="text-center py-4 text-gray-400 text-xs">No books found</td></tr>
            )}
            {visible.map(b => {
              const item = items.find(i => parseInt(i.bookId) === b.id) || {}
              const active = parseInt(item.quantity) > 0
              return (
                <tr
                  key={b.id}
                  className={`${active ? 'bg-blue-50' : 'hover:bg-gray-50'} ${checkboxMode ? 'cursor-pointer' : ''}`}
                  onClick={checkboxMode ? () => onChange(b.id, 'quantity', active ? 0 : 1) : undefined}
                >
                  {checkboxMode && (
                    <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={e => onChange(b.id, 'quantity', e.target.checked ? 1 : 0)}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2 font-medium text-gray-800 max-w-[180px]">
                    <p className="truncate">{b.title}</p>
                    {b.inventory && <p className="text-xs text-gray-400">Stock: {b.inventory.quantity}</p>}
                  </td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{b.publisher?.name || '—'}</td>
                  <td className="px-3 py-2 text-gray-700">₹{b.mrp}</td>
                  <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                    {checkboxMode ? (
                      active ? (
                        <input
                          type="number" min="1" value={item.quantity || 1}
                          onChange={e => onChange(b.id, 'quantity', e.target.value)}
                          className="w-14 border border-gray-300 rounded px-1 py-0.5 text-sm text-center focus:outline-none focus:border-blue-500"
                        />
                      ) : <span className="text-gray-300 text-xs">—</span>
                    ) : (
                      <input
                        type="number" min="0" value={item.quantity || ''}
                        placeholder="0"
                        onChange={e => onChange(b.id, 'quantity', e.target.value)}
                        className="w-16 border border-gray-300 rounded px-1.5 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </td>
                  {columns.map(c => (
                    <td key={c.key} className="px-3 py-2" onClick={e => e.stopPropagation()}>
                      <input
                        type={c.type || 'number'} step="0.01" min="0"
                        value={item[c.key] || ''}
                        placeholder={c.placeholder}
                        onChange={e => onChange(b.id, c.key, e.target.value)}
                        className="w-20 border border-gray-300 rounded px-1.5 py-1 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">
        {checkboxMode ? 'Click a row or checkbox to add a book. Qty defaults to 1 — adjust if needed.' : 'Enter qty > 0 to include a book in the order'}
      </p>
    </div>
  )
}
