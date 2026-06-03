import { useState, useMemo } from 'react'

function getVal(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

export default function useTableState(data, { searchFields = [], filterField = null, perPage = 10 } = {}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let r = data
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(item => searchFields.some(f => getVal(item, f)?.toString().toLowerCase().includes(q)))
    }
    if (filterField && filter !== 'ALL') {
      r = r.filter(item => item[filterField] === filter)
    }
    return r
  }, [data, search, filter])

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  const resetPage = () => setPage(1)

  return {
    paginated, filtered,
    search, setSearch: (v) => { setSearch(v); setPage(1) },
    filter, setFilter: (v) => { setFilter(v); setPage(1) },
    page, setPage,
  }
}
