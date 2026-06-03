import { useState } from 'react'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function useConfirm() {
  const [state, setState] = useState(null)

  const confirm = (message) => new Promise(resolve => {
    setState({ message, resolve })
  })

  const handleConfirm = () => { state.resolve(true); setState(null) }
  const handleCancel = () => { state.resolve(false); setState(null) }

  const confirmModal = state
    ? <ConfirmModal message={state.message} onConfirm={handleConfirm} onCancel={handleCancel} />
    : null

  return { confirm, confirmModal }
}
