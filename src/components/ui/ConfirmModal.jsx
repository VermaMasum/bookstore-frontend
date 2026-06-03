export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm border border-slate-100 p-6 space-y-5 modal-enter">
        <p className="text-slate-700 text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-white">Cancel</button>
          <button onClick={onConfirm} className="btn-danger">Confirm</button>
        </div>
      </div>
    </div>
  )
}
