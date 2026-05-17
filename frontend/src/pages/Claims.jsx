import { useEffect, useState } from 'react'
import { getAllClaims, updateClaimStatus } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageState from '../components/PageState'
import { CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react'

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
      setError(err.response?.data?.detail || 'Failed to load claims')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClaims() }, [])

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await updateClaimStatus(id, { status })
      addToast(`Claim ${status.toLowerCase()} successfully`, 'success')
      fetchClaims()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Action failed', 'error')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <PageState
        icon={ClipboardList}
        tone="error"
        title="Claims unavailable"
        description={error}
        actionLabel="Retry"
        onAction={fetchClaims}
      />
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">All Claims</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{claims.length} claim{claims.length !== 1 ? 's' : ''} total</p>
      </div>

      {claims.length === 0
        ? <PageState icon={ClipboardList} title="No claims submitted yet" description="Claims will appear here after users submit them." />
        : claims.map(claim => (
          <div key={claim.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{claim.found_item?.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Claimed by: <span className="text-zinc-300">{claim.claimant?.name}</span>
                  {' '}&mdash; {claim.claimant?.email}
                </p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            <div className="flex gap-4 text-xs text-zinc-500">
              {claim.found_item?.location && (
                <span className="flex items-center gap-1"><MapPin size={11} />{claim.found_item.location}</span>
              )}
              <span className="flex items-center gap-1"><Calendar size={11} />
                {new Date(claim.created_at).toLocaleDateString()}
              </span>
            </div>

            {claim.description && (
              <div className="bg-surface-2 rounded-lg p-3 text-xs text-zinc-400 border border-white/5">
                <span className="text-zinc-500 font-medium block mb-1">Proof of ownership:</span>
                {claim.description}
              </div>
            )}

            {claim.status === 'PENDING' && (
              <div className="flex gap-2 pt-1">
                <button
                  id={`approve-${claim.id}`}
                  onClick={() => handleStatus(claim.id, 'APPROVED')}
                  disabled={updating === claim.id}
                  className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400
                             border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  id={`reject-${claim.id}`}
                  onClick={() => handleStatus(claim.id, 'REJECTED')}
                  disabled={updating === claim.id}
                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400
                             border border-red-500/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
