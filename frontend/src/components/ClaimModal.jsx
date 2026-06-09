import { useState } from 'react'
import { X } from 'lucide-react'
import { submitClaim } from '../services/claimService'
import { getApiErrorMessage } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ClaimModal({ item, onClose, onSuccess }) {
  const { addToast } = useToast()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const proof = description.trim()
    if (!proof || loading) return
    setLoading(true)
    try {
      await submitClaim({ found_item_id: item.id, description: proof })
      addToast('Claim submitted! Wait for admin approval.', 'success')
      onClose()
      if (typeof onSuccess === 'function') {
        void onSuccess().catch(err => {
          console.error('Failed to refresh items after claim submission', err)
        })
      }
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Failed to submit claim', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center bg-black/80 backdrop-blur-sm">
      <div className="card w-full max-w-md max-h-[calc(100svh-2rem)] overflow-y-auto p-0 relative border-2 border-border shadow-pixel-md">
        {/* Header */}
        <div className="h-8 bg-border flex items-center justify-between px-3 border-b-2 border-background">
           <div className="flex space-x-2">
             <div className="w-3 h-3 rounded-none bg-danger shadow-pixel-sm"></div>
             <div className="w-3 h-3 rounded-none bg-accent-secondary shadow-pixel-sm"></div>
             <div className="w-3 h-3 rounded-none bg-success shadow-pixel-sm"></div>
           </div>
           <div className="text-[10px] font-pixel text-text-secondary drop-shadow-[1px_1px_0px_#000]">CLAIM_ITEM.EXE</div>
           <button onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded-sm bg-danger text-white border-2 border-background
                       hover:bg-danger/80 transition-all shadow-pixel-sm hover:shadow-none hover:translate-y-[2px]">
            <X size={12} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs font-pixel text-accent-secondary mb-2 drop-shadow-[1px_1px_0px_#000]">&gt; TARGETING:</p>
          <p className="text-lg font-vt text-text-primary mb-6 tracking-widest bg-surface border-2 border-border p-2">{item.title}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; INPUT PROOF OF OWNERSHIP</label>
              <textarea
                id="claim-description"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe identifying features, purchase details..."
                className="input resize-none bg-background font-vt text-lg tracking-wider"
                required
              />
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                ABORT
              </button>
              <button type="submit" disabled={loading || !description.trim()} className="btn-primary flex-1 border-success bg-success/20 hover:bg-success hover:text-surface text-success">
                {loading ? 'UPLOADING...' : 'SUBMIT CLAIM'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
