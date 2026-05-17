import { useEffect, useState } from 'react'
import { getNotifications, markRead, markAllRead, approveClaim, rejectClaim } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import PageState from '../components/PageState'
import { Bell, CheckCheck, CheckCircle, XCircle } from 'lucide-react'
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
        title="Notifications unavailable"
        description={error}
        actionLabel="Retry"
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
      addToast('All notifications marked as read', 'success')
    } catch {
      addToast('Failed to update notifications', 'error')
    }
  }

  const handleApprove = async (e, notif) => {
    e.stopPropagation()
    if (!notif.related_claim_id) return
    setUpdating(notif.related_claim_id)
    try {
      await approveClaim(notif.related_claim_id)
      addToast('Claim approved successfully', 'success')
      fetchNotifs()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Action failed', 'error')
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
      addToast('Claim rejected successfully', 'success')
      fetchNotifs()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Action failed', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const unread = notifs.filter(n => !n.is_read).length

  if (loading) return <LoadingSpinner />

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Notifications</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll}
            className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-1.5 self-start">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0
        ? <PageState icon={Bell} title="No notifications available" description="Updates about claims and item status changes will appear here." />
        : notifs.map(n => (
          <div
            key={n.id}
            onClick={() => !n.is_read && handleMarkRead(n.id)}
            className={`card cursor-pointer transition-all duration-150 hover:border-white/10
                        ${n.is_read ? 'opacity-60' : 'border-accent/20 bg-accent/5'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-zinc-600' : 'bg-accent'}`} />
              <div className="flex-1 space-y-3">
                <div>
                  {n.title && <h3 className="text-sm font-semibold text-zinc-100">{n.title}</h3>}
                  <p className="text-sm text-zinc-200 mt-1 whitespace-pre-wrap">{n.message}</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {n.type === 'CLAIM_REQUEST' && n.related_claim?.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/5 sm:flex-row">
                    <button
                      onClick={(e) => handleApprove(e, n)}
                      disabled={updating === n.related_claim_id}
                      className="flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400
                                 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    >
                      <CheckCircle size={13} /> Approve Claim
                    </button>
                    <button
                      onClick={(e) => handleReject(e, n)}
                      disabled={updating === n.related_claim_id}
                      className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400
                                 border border-red-500/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    >
                      <XCircle size={13} /> Reject Claim
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
