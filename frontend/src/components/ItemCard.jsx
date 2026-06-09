import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, User, Tag, CheckSquare, XSquare } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { API_URL } from '../services/api'
import Card from './Card'

export default function ItemCard({ item, type, onClaim, onDelete, onEdit, isOwner, itemClaims, onApproveClaim, onRejectClaim, updatingClaim }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl = item.image_url && !imgError
    ? `${API_URL}${item.image_url}`
    : null

  const isResolved = type === 'lost'
    ? ['FOUND', 'CLOSED'].includes(item.status)
    : item.status === 'CLAIMED'

  return (
    <Card className="group flex h-full flex-col gap-4 hover:shadow-glow transition-all duration-200 relative">
      {/* Image */}
      {imageUrl ? (
        <div className="h-36 sm:h-40 rounded-lg overflow-hidden bg-black -m-1 border border-white/3">
          <img
            src={imageUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-sm grayscale-[20%] group-hover:grayscale-0 transition-all"
          />
        </div>
      ) : (
        <div className="h-32 rounded-lg bg-black flex items-center justify-center text-3xl border border-white/5">
          {type === 'lost' ? '🔍' : '📦'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-zinc-100 text-[20px] leading-snug line-clamp-2" style={{fontFamily: 'Inter, system-ui'}}>
          {item.title}
        </h3>
        <StatusBadge status={item.status} />
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-[20px] font-vt text-text-primary tracking-wide leading-relaxed line-clamp-2">{item.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-col gap-2 text-[16px] sm:text-[16px] font-vt text-text-primary tracking-wide leading-snug">
        {item.location && (
          <span className="flex items-center gap-2">
            <MapPin size={16} className="flex-shrink-0 text-accent-secondary" />
            {item.location}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Calendar size={16} className="flex-shrink-0 text-accent-secondary" />
          {type === 'lost' ? item.date_lost : item.date_found}
        </span>
        <span className="flex items-center gap-2">
          <Tag size={16} className="flex-shrink-0 text-accent-secondary" />
          {item.category?.name || item.category_name || 'Others'}
        </span>
        <span className="flex items-center gap-2">
          <User size={16} className="flex-shrink-0 text-accent-secondary" />
          {item.user?.name}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-3 border-t-2 border-border mt-auto sm:flex-row">
        {onClaim && item.status === 'AVAILABLE' && (
          <button id={`claim-${item.id}`} onClick={() => onClaim(item)}
            className="btn-primary flex-1">
            CLAIM
          </button>
        )}
        {isOwner && type === 'found' && (!itemClaims || itemClaims.length === 0) && (
          <Link to={`/claims`} className="btn-primary flex-1 text-center">
            CLAIMS
          </Link>
        )}
        {onEdit && isOwner && (
          <button onClick={() => onEdit(item)}
            disabled={isResolved}
            title={isResolved ? "Resolved items cannot be edited" : "Edit Item"}
            className={`btn-secondary flex-1 ${isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}>EDIT</button>
        )}
        {onDelete && isOwner && (
          <button onClick={() => onDelete(item.id)}
            disabled={isResolved}
            title={isResolved ? "Resolved items cannot be deleted" : "Delete Item"}
            className={`btn-danger flex-1 ${isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}>DELETE</button>
        )}
      </div>

      {/* Inline Pending Claims */}
      {isOwner && type === 'found' && itemClaims && itemClaims.some(c => c.status === 'PENDING') && (
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t-2 border-border bg-surface p-2 -mx-2 -mb-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
          <p className="text-[13px] font-pixel text-accent drop-shadow-[1px_1px_0px_#000]">PENDING CLAIMS:</p>
          {itemClaims.filter(c => c.status === 'PENDING').map(claim => (
            <div key={claim.id} className="border-2 border-border bg-surface-2 p-2 flex flex-col gap-2 shadow-pixel-sm">
              <div>
                <p className="text-[15px] font-vt text-text-primary tracking-wide">{claim.claimant?.name}</p>
                {claim.description && (
                  <p className="text-[14px] font-vt text-text-secondary mt-1 line-clamp-2">{claim.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => onApproveClaim(claim.id)}
                  disabled={updatingClaim === claim.id}
                  className="flex flex-1 items-center justify-center gap-1 bg-success hover:bg-success/80 text-surface border-2 border-success rounded-sm py-2 text-sm font-pixel transition-all shadow-pixel-sm active:translate-y-[2px] active:shadow-none"
                >
                  <CheckSquare size={14} /> APPROVE
                </button>
                <button
                  onClick={() => onRejectClaim(claim.id)}
                  disabled={updatingClaim === claim.id}
                  className="flex flex-1 items-center justify-center gap-1 bg-danger hover:bg-danger/80 text-white border-2 border-danger rounded-sm py-2 text-sm font-pixel transition-all shadow-pixel-danger active:translate-y-[2px] active:shadow-none"
                >
                  <XSquare size={14} /> REJECT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
