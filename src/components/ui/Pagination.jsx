export default function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const pages = []
  const delta = 1
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i)
  if (pages[0] > 1) { if (pages[0] > 2) pages.unshift('...'); pages.unshift(1) }
  if (pages[pages.length - 1] < totalPages) {
    if (pages[pages.length - 1] < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  const from = Math.min((page - 1) * perPage + 1, total)
  const to   = Math.min(page * perPage, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
      <p className="text-[11px] text-slate-400">
        <span className="font-semibold text-slate-600">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-600">{total}</span> records
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-slate-600
                     border border-slate-200 rounded-lg bg-white hover:bg-slate-50
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Prev
        </button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="w-8 text-center text-xs text-slate-400">…</span>
            : <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-8 h-8 text-[11px] font-semibold rounded-lg border transition-all
                  ${p === page
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
              >
                {p}
              </button>
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-slate-600
                     border border-slate-200 rounded-lg bg-white hover:bg-slate-50
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  )
}
