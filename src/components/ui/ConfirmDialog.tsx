import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  isConfirming: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Uses the native <dialog> element (focus trap, Escape key and backdrop for free).
 * React owns the `open` state; the effect syncs it to the DOM API showModal()/close().
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, message, confirmLabel, isConfirming, error, onConfirm, onCancel } = props
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      // Escape key: keep React state in charge instead of letting the browser close it.
      onCancel={(event) => {
        event.preventDefault()
        if (!isConfirming) onCancel()
      }}
      className="m-auto w-full max-w-md rounded-lg p-6 shadow-xl backdrop:bg-slate-900/50"
    >
      <h2 id="confirm-title" className="text-lg font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
