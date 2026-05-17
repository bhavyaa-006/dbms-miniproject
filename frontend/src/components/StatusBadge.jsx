const configs = {
  // Lost item statuses
  LOST:   { label: 'Lost',   cls: 'bg-amber-500/10   text-amber-400   border-amber-500/20'   },
  FOUND:  { label: 'Found',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CLOSED: { label: 'Closed', cls: 'bg-zinc-500/10    text-zinc-400    border-zinc-500/20'    },
  // Found item statuses
  AVAILABLE:     { label: 'Available',     cls: 'bg-sky-500/10     text-sky-400     border-sky-500/20'     },
  CLAIM_PENDING: { label: 'Claim Pending', cls: 'bg-amber-500/10   text-amber-400   border-amber-500/20'   },
  CLAIMED:       { label: 'Claimed',       cls: 'bg-purple-500/10  text-purple-400  border-purple-500/20'  },
  RETURNED:      { label: 'Returned',      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  // Claim statuses
  PENDING:   { label: 'Pending',   cls: 'bg-amber-500/10   text-amber-400   border-amber-500/20'   },
  APPROVED:  { label: 'Approved',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  REJECTED:  { label: 'Rejected',  cls: 'bg-red-500/10     text-red-400     border-red-500/20'     },
}

export default function StatusBadge({ status }) {
  const cfg = configs[status] || { label: status, cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
  return (
    <span className={`badge border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
