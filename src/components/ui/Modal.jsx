import { useEffect } from 'react'

export default function Modal({ title, onClose, children, wide }) {
  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className={`bg-white rounded-2xl shadow-modal w-full ${wide ? 'max-w-2xl' : 'max-w-lg'}
                       max-h-[92vh] flex flex-col border border-slate-100 modal-enter`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400
                       hover:text-slate-600 hover:bg-slate-100 transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

      </div>
    </div>
  )
}
