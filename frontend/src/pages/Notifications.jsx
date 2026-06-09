import { useEffect, useState } from 'react'
import { getNotifications, markRead, markAllRead, approveClaim, rejectClaim } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import PageState from '../components/PageState'
import { MotionList, MotionListItem } from '../components/MotionWrappers'
import { Bell, CheckCheck, CheckSquare, XSquare } from 'lucide-react'
import { getApiErrorMessage } from '../services/itemService'

export default function Notifications() {
  const { addToast } = useToast()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  const fetchNotifs = () => {
    setLoading(true)
    setError('')
    getNotifications()
      .then(res => setNotifs(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(getApiErrorMessage(err) || 'Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifs() }, [])

  if (error) {
    return (
      <PageState
        icon={Bell}
        tone="error"
        title="SYSTEM FAILURE"
        description={error}
        actionLabel="REBOOT_CONNECTION"
        onAction={fetchNotifs}
      />
    )
  }

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const handleMarkAll = async () => {
    try {
      await markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      addToast('ALL MESSAGES ACKNOWLEDGED.', 'success')
    } catch {
      addToast('OPERATION FAILED.', 'error')
    }
  }

  const handleApprove = async (e, notif) => {
    e.stopPropagation()
    if (!notif.related_claim_id) return
    setUpdating(notif.related_claim_id)
    try {
      await approveClaim(notif.related_claim_id)
      addToast('CLAIM_APPROVED.', 'success')
      fetchNotifs()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'ACTION_FAILED.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (e, notif) => {
    e.stopPropagation()
    if (!notif.related_claim_id) return
    setUpdating(notif.related_claim_id)
    try {
      await rejectClaim(notif.related_claim_id)
      addToast('CLAIM_REJECTED.', 'success')
      fetchNotifs()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'ACTION_FAILED.', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const unread = notifs.filter(n => !n.is_read).length

  if (loading) return <LoadingSpinner />

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-2 border-2 border-border p-4 shadow-pixel-sm">
        <div>
          <h1 className="text-xl font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">INBOX.EXE</h1>
          <p className="text-sm font-vt text-accent-secondary mt-1 tracking-widest uppercase">
            &gt; {unread > 0 ? `${unread} UNREAD MESSAGES` : 'NO NEW MESSAGES'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll}
            className="btn-secondary text-[10px] flex items-center justify-center gap-2 py-2">
            <CheckCheck size={14} /> MARK_ALL_READ
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifs.length === 0
          ? <PageState icon={Bell} title="INBOX EMPTY" description="Incoming transmissions will appear here." />
          : (
            <MotionList>
              {notifs.map(n => (
                <MotionListItem key={n.id}>
                  <div
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`card cursor-pointer transition-all duration-150 relative overflow-hidden
                                ${n.is_read ? 'opacity-70 border-border bg-surface shadow-none' : 'border-accent bg-surface-2 shadow-pixel-accent hover:-translate-y-[2px]'}`}
                  >
              {/* Unread indicator glow line */}
              {!n.is_read && <div className="absolute top-0 left-0 right-0 h-1 bg-accent shadow-glow"></div>}

              <div className="flex items-start gap-4 mt-1">
                <div className={`w-3 h-3 rounded-none mt-1.5 flex-shrink-0 shadow-pixel-sm ${n.is_read ? 'bg-muted' : 'bg-accent animate-pulse-glow'}`} />
                <div className="flex-1 space-y-3">
                  <div>
                    {n.title && <h3 className="text-sm font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">{n.title}</h3>}
                    <p className="text-sm font-vt text-text-secondary mt-2 tracking-widest uppercase whitespace-pre-wrap">{n.message}</p>
                    <p className="text-[10px] font-pixel text-muted mt-3">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {n.type === 'CLAIM_REQUEST' && n.related_claim?.status === 'PENDING' && (
                    <div className="flex flex-col gap-3 pt-3 border-t-2 border-border sm:flex-row">
                      <button
                        onClick={(e) => handleApprove(e, n)}
                        disabled={updating === n.related_claim_id}
                        className="flex items-center justify-center gap-2 bg-success hover:bg-success/80 text-surface
                                   border-2 border-success py-2 px-4 text-[10px] font-pixel transition-all shadow-pixel-sm active:shadow-none active:translate-y-[2px]"
                      >
                        <CheckSquare size={14} /> APPROVE_CLAIM
                      </button>
                      <button
                        onClick={(e) => handleReject(e, n)}
                        disabled={updating === n.related_claim_id}
                        className="flex items-center justify-center gap-2 bg-danger hover:bg-danger/80 text-white
                                   border-2 border-danger py-2 px-4 text-[10px] font-pixel transition-all shadow-pixel-danger active:shadow-none active:translate-y-[2px]"
                      >
                        <XSquare size={14} /> REJECT_CLAIM
                      </button>
                    </div>
                  )}
                </div>
              </div>
                  </div>
                </MotionListItem>
              ))}
            </MotionList>
          )}
      </div>
    </div>
  )
}
