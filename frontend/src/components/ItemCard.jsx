import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, User, Tag, CheckCircle, XCircle } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { API_URL } from '../services/api'

export default function ItemCard({ item, type, onClaim, onDelete, onEdit, isOwner, itemClaims, onApproveClaim, onRejectClaim, updatingClaim }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl = item.image_url && !imgError
    ? `${API_URL}${item.image_url}`
    : null

  const isResolved = type === 'lost'
    ? ['FOUND', 'CLOSED'].includes(item.status)
    : item.status === 'CLAIMED'

  return (
    <div className="card group flex h-full flex-col gap-4 hover:border-white/10 transition-all duration-200 relative">
      {/* Image */}
      {imageUrl ? (
        <div className="h-36 sm:h-40 rounded-lg overflow-hidden bg-surface-2 -m-1">
          <img
            src={imageUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 rounded-lg bg-surface-2 flex items-center justify-center text-3xl">
          {type === 'lost' ? '🔍' : '📦'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-2">
          {item.title}
        </h3>
        <StatusBadge status={item.status} />
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-xs text-zinc-500">
        {item.location && (
          <span className="flex items-center gap-1.5">
            <MapPin size={11} className="flex-shrink-0 text-zinc-600" />
            {item.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={11} className="flex-shrink-0 text-zinc-600" />
          {type === 'lost' ? item.date_lost : item.date_found}
        </span>
        <span className="flex items-center gap-1.5">
          <Tag size={11} className="flex-shrink-0 text-zinc-600" />
          {item.category?.name || item.category_name || 'Others'}
        </span>
        <span className="flex items-center gap-1.5">
          <User size={11} className="flex-shrink-0 text-zinc-600" />
          {item.user?.name}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1 border-t border-white/5 mt-auto sm:flex-row">
        {onClaim && item.status === 'AVAILABLE' && (
          <button id={`claim-${item.id}`} onClick={() => onClaim(item)}
            className="btn-primary text-xs py-1.5 flex-1">
            Claim This
          </button>
        )}
        {isOwner && type === 'found' && (!itemClaims || itemClaims.length === 0) && (
          <Link to={`/claims`} className="btn-primary text-xs py-1.5 flex-1 text-center">
            View Claims
          </Link>
        )}
        {onEdit && isOwner && (
          <button onClick={() => onEdit(item)}
            disabled={isResolved}
            title={isResolved ? "Resolved items cannot be edited" : "Edit Item"}
            className={`btn-secondary text-xs py-1.5 flex-1 ${isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}>Edit</button>
        )}
        {onDelete && isOwner && (
          <button onClick={() => onDelete(item.id)}
            disabled={isResolved}
            title={isResolved ? "Resolved items cannot be deleted" : "Delete Item"}
            className={`btn-danger text-xs py-1.5 flex-1 ${isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}>Delete</button>
        )}
      </div>

      {/* Inline Pending Claims */}
      {isOwner && type === 'found' && itemClaims && itemClaims.some(c => c.status === 'PENDING') && (
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
          <p className="text-xs font-semibold text-zinc-300">Pending Claims:</p>
          {itemClaims.filter(c => c.status === 'PENDING').map(claim => (
            <div key={claim.id} className="bg-surface-3 p-2.5 rounded-lg border border-white/5 flex flex-col gap-2">
              <div>
                <p className="text-xs font-medium text-zinc-200">{claim.claimant?.name}</p>
                {claim.description && (
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">Proof: {claim.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 sm:flex-row">
                <button
                  onClick={() => onApproveClaim(claim.id)}
                  disabled={updatingClaim === claim.id}
                  className="flex flex-1 items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md py-1 text-[11px] font-medium transition-all"
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  onClick={() => onRejectClaim(claim.id)}
                  disabled={updatingClaim === claim.id}
                  className="flex flex-1 items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md py-1 text-[11px] font-medium transition-all"
                >
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
