import { useEffect, useState } from 'react'
import { getAllClaims, approveClaim, rejectClaim } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageState from '../components/PageState'
import { MotionList, MotionListItem } from '../components/MotionWrappers'
import { CheckSquare, XSquare, MapPin, Calendar, Terminal } from 'lucide-react'

export default function Claims() {
  const { addToast } = useToast()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  const fetchClaims = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAllClaims()
      setClaims(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'FAILED_TO_LOAD_DATA')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClaims() }, [])

  const handleApprove = async (id) => {
    setUpdating(id)
    try {
      await approveClaim(id)
      addToast(`CLAIM APPROVED.`, 'success')
      fetchClaims()
    } catch (err) {
      addToast(err.response?.data?.detail || 'ACTION_FAILED', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (id) => {
    setUpdating(id)
    try {
      await rejectClaim(id)
      addToast(`CLAIM REJECTED.`, 'success')
      fetchClaims()
    } catch (err) {
      addToast(err.response?.data?.detail || 'ACTION_FAILED', 'error')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <PageState
        icon={Terminal}
        tone="error"
        title="SYSTEM_ERROR"
        description={error}
        actionLabel="RETRY"
        onAction={fetchClaims}
      />
    )
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="bg-surface-2 border-2 border-border p-4 shadow-pixel-sm">
        <h1 className="text-xl font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">ADMIN_CLAIMS.LOG</h1>
        <p className="text-sm font-vt text-accent-secondary mt-1 tracking-widest uppercase">
          &gt; {claims.length} CLAIM{claims.length !== 1 ? 'S' : ''} IN DATABASE
        </p>
      </div>

      {claims.length === 0
        ? <PageState icon={Terminal} title="NO CLAIMS FOUND" description="Database is empty." />
        : (
          <MotionList>
            {claims.map(claim => (
              <MotionListItem key={claim.id}>
                <div className="card relative overflow-hidden group hover:border-accent transition-colors">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-border p-3 -mx-4 -mt-4 mb-4 border-b-2 border-background">
              <div className="min-w-0">
                <p className="text-sm font-vt text-text-primary uppercase tracking-widest leading-none">TARGET: {claim.found_item?.title}</p>
                <p className="text-[10px] font-vt text-text-secondary uppercase mt-1 tracking-widest">
                  CLAIMANT: <span className="text-accent-secondary">{claim.claimant?.name}</span>
                  {' '}— {claim.claimant?.email}
                </p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2 text-xs font-vt text-text-secondary tracking-widest sm:flex-row sm:flex-wrap sm:gap-4 uppercase">
              {claim.found_item?.location && (
                <span className="flex items-center gap-1.5 text-accent-secondary"><MapPin size={12} className="text-muted"/>{claim.found_item.location}</span>
              )}
              <span className="flex items-center gap-1.5 text-accent-secondary">
                <Calendar size={12} className="text-muted"/>
                INITIATED: {new Date(claim.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Proof Box */}
            {claim.description && (
              <div className="bg-background border-2 border-border p-3 mt-4 relative">
                <span className="absolute -top-2 left-2 bg-surface-2 px-1 text-[9px] font-pixel text-accent drop-shadow-[1px_1px_0px_#000]">PROOF_DATA</span>
                <p className="text-sm font-vt text-text-primary tracking-widest uppercase mt-1">{claim.description}</p>
              </div>
            )}

            {/* Actions */}
            {claim.status === 'PENDING' && (
              <div className="flex flex-col gap-3 pt-4 mt-4 border-t-2 border-border sm:flex-row">
                <button
                  id={`approve-${claim.id}`}
                  onClick={() => handleApprove(claim.id)}
                  disabled={updating === claim.id}
                  className="flex flex-1 items-center justify-center gap-2 bg-success hover:bg-success/80 text-surface
                             border-2 border-success py-2.5 px-4 text-[10px] font-pixel transition-all shadow-pixel-sm active:shadow-none active:translate-y-[2px]"
                >
                  <CheckSquare size={14} /> APPROVE_CLAIM
                </button>
                <button
                  id={`reject-${claim.id}`}
                  onClick={() => handleReject(claim.id)}
                  disabled={updating === claim.id}
                  className="flex flex-1 items-center justify-center gap-2 bg-danger hover:bg-danger/80 text-white
                             border-2 border-danger py-2.5 px-4 text-[10px] font-pixel transition-all shadow-pixel-danger active:shadow-none active:translate-y-[2px]"
                >
                  <XSquare size={14} /> REJECT_CLAIM
                </button>
              </div>
            )}
                </div>
              </MotionListItem>
            ))}
          </MotionList>
        )}
    </div>
  )
}
