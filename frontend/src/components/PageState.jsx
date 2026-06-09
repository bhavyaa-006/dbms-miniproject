export default function PageState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'empty',
  compact = false,
}) {
  const isError = tone === 'error'

  return (
    <div className={compact ? 'border-2 border-border bg-surface-2 p-4' : 'card border-2 border-border bg-surface-2 text-center py-12 relative overflow-hidden'}>
      {/* Decorative scanline overlay specifically for non-compact state */}
      {!compact && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>}
      
      <div className={compact ? 'flex flex-col gap-3 sm:flex-row sm:items-start' : 'flex flex-col items-center gap-4 relative z-10'}>
        {Icon && (
          <div className={compact ? 'shrink-0 text-accent sm:mt-0.5' : `p-4 border-2 shadow-pixel-sm ${isError ? 'bg-danger text-white border-danger shadow-pixel-danger' : 'bg-surface border-accent text-accent'}`}>
            <Icon size={compact ? 18 : 32} />
          </div>
        )}
        <div className={compact ? 'min-w-0 flex-1' : 'max-w-sm'}>
          <p className={`font-pixel drop-shadow-[1px_1px_0px_#000] ${compact ? 'text-[11px] text-text-primary' : 'text-sm text-text-primary uppercase'}`}>{title}</p>
          {description && (
            <p className={`mt-2 font-vt tracking-widest uppercase ${compact ? 'text-xs text-text-secondary' : 'text-sm text-text-secondary'}`}>{description}</p>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`mt-4 ${isError ? 'btn-danger shadow-pixel-danger' : 'btn-primary shadow-pixel-accent'} ${compact ? 'text-[10px] px-3 py-1.5' : ''}`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}