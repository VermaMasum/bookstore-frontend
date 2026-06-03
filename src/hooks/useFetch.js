import { useState, useEffect, useCallback } from 'react'

export default function useFetch(fetchFn) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchFn()
      setData(res.data.data)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, reload: load }
}
