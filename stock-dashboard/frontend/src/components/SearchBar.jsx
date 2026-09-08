import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'

export default function SearchBar({ onAdd, existingSymbols }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.search(query.trim())
        setResults(data)
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="search" ref={boxRef}>
      <input
        placeholder="Search symbol or company name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((r) => {
            const already = existingSymbols.includes(r.symbol)
            return (
              <div className="search-result-row" key={r.symbol}>
                <span className="sym">{r.symbol}</span>
                <span className="name">{r.description}</span>
                <button
                  className="add-btn"
                  disabled={already}
                  onClick={() => {
                    onAdd(r)
                    setQuery('')
                    setResults([])
                    setOpen(false)
                  }}
                >
                  {already ? 'Added' : 'Add'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
