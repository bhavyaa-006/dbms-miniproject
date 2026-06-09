const configs = {
  // Lost item statuses
  LOST:   { label: 'LOST',   cls: 'bg-danger text-white border-danger shadow-pixel-danger' },
  FOUND:  { label: 'FOUND',  cls: 'bg-accent-secondary text-surface border-accent-secondary shadow-pixel-sm' },
  CLOSED: { label: 'CLOSED', cls: 'bg-muted text-surface-2 border-muted shadow-pixel-sm' },
  // Found item statuses
  AVAILABLE: { label: 'AVAILABLE', cls: 'bg-accent text-white border-accent shadow-pixel-accent' },
  CLAIMED:   { label: 'CLAIMED',   cls: 'bg-success text-surface border-success shadow-pixel-sm' },
  // Claim statuses
  PENDING:  { label: 'PENDING',  cls: 'bg-accent-secondary text-surface border-accent-secondary shadow-pixel-sm' },
  APPROVED: { label: 'APPROVED', cls: 'bg-success text-surface border-success shadow-pixel-sm' },
  REJECTED: { label: 'REJECTED', cls: 'bg-danger text-white border-danger shadow-pixel-danger' },
}

export default function StatusBadge({ status }) {
  const cfg = configs[status] || { label: status, cls: 'bg-surface-2 text-text-secondary border-border' }
  return (
    <span className={`badge ${cfg.cls}`} data-status={status}>
      {cfg.label}
    </span>
  )
}
