import { useEffect, useState } from 'react'
import { getMyClaims } from '../services/claimService'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import { MapPin, Calendar } from 'lucide-react'

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyClaims().then(res => setClaims(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">My Claims</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Track the status of your submitted claims.</p>
      </div>

      {claims.length === 0
        ? (
          <div className="card text-center py-12 text-zinc-500">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">You haven't submitted any claims yet.</p>
            <p className="text-xs mt-1">Browse Found Items to claim an item.</p>
          </div>
        )
        : claims.map(claim => (
          <div key={claim.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{claim.found_item?.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Found by: <span className="text-zinc-300">{claim.found_item?.user?.name}</span>
                </p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            <div className="flex gap-4 text-xs text-zinc-500">
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
