import { useState } from 'react'
import { X } from 'lucide-react'
import { submitClaim } from '../services/claimService'
import { useToast } from '../context/ToastContext'

export default function ClaimModal({ item, onClose, onSuccess }) {
  const { addToast } = useToast()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    try {
      await submitClaim({ found_item_id: item.id, description })
      addToast('Claim submitted! Wait for admin approval.', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to submit claim', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md max-h-[calc(100svh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100">Claim Item</h3>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500
                       hover:text-zinc-100 hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-1">Claiming:</p>
        <p className="text-sm font-medium text-zinc-100 mb-4">{item.title}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Proof of Ownership *</label>
            <textarea
              id="claim-description"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe identifying features, purchase details, or any other proof that this item belongs to you..."
              className="input resize-none text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !description.trim()} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
