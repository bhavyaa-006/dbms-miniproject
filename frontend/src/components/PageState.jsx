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
    <div className={compact ? 'rounded-xl border border-white/5 bg-surface-2/80 p-4' : 'card text-center py-12'}>
      <div className={compact ? 'flex flex-col gap-3 sm:flex-row sm:items-start' : 'flex flex-col items-center gap-3'}>
        {Icon && (
          <div className={compact ? 'shrink-0 text-zinc-400 sm:mt-0.5' : `p-3 rounded-2xl ${isError ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-zinc-400'}`}>
            <Icon size={compact ? 18 : 28} />
          </div>
        )}
        <div className={compact ? 'min-w-0 flex-1' : 'max-w-sm'}>
          <p className={`font-medium ${compact ? 'text-sm text-zinc-100' : 'text-base text-zinc-100'}`}>{title}</p>
          {description && (
            <p className={`mt-1 ${compact ? 'text-xs text-zinc-500' : 'text-sm text-zinc-500'}`}>{description}</p>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`mt-4 ${isError ? 'btn-secondary' : 'btn-primary'} ${compact ? 'text-xs px-3 py-2' : ''}`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}