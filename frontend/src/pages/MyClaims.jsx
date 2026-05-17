import { useEffect, useState } from 'react'
import { getMyClaims } from '../services/claimService'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageState from '../components/PageState'
import { MapPin, Calendar } from 'lucide-react'

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchClaims = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMyClaims()
      setClaims(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your claims')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <PageState
        icon={Calendar}
        tone="error"
        title="My claims unavailable"
        description={error}
        actionLabel="Retry"
        onAction={fetchClaims}
      />
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">My Claims</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Track the status of your submitted claims.</p>
      </div>

      {claims.length === 0
        ? <PageState icon={Calendar} title="No claims submitted yet" description="Browse Found Items to submit your first claim." />
        : claims.map(claim => (
          <div key={claim.id} className="card space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{claim.found_item?.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Found by: <span className="text-zinc-300">{claim.found_item?.user?.name}</span>
                </p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            <div className="flex flex-col gap-2 text-xs text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-4">
              {claim.found_item?.location && (
                <span className="flex items-center gap-1"><MapPin size={11} />{claim.found_item.location}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Submitted {new Date(claim.created_at).toLocaleDateString()}
              </span>
            </div>

            {claim.description && (
              <div className="bg-surface-2 rounded-lg p-3 text-xs text-zinc-400 border border-white/5">
                <span className="text-zinc-500 font-medium block mb-1">Your proof:</span>
                {claim.description}
              </div>
            )}

            {claim.status === 'APPROVED' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                ✅ Approved — Please visit the admin office to collect your item.
              </div>
            )}
            {claim.status === 'REJECTED' && (
              <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
                ❌ Rejected — Contact admin for more details.
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
