import { useEffect, useState } from 'react'
import { getNotifications, markRead, markAllRead } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bell, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const { addToast } = useToast()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = () => {
    setLoading(true)
    getNotifications().then(res => setNotifs(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifs() }, [])

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

  const unread = notifs.filter(n => !n.is_read).length

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Notifications</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0
        ? (
          <div className="card text-center py-12 text-zinc-500">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )
        : notifs.map(n => (
          <div
            key={n.id}
            onClick={() => !n.is_read && handleMarkRead(n.id)}
            className={`card cursor-pointer transition-all duration-150 hover:border-white/10
                        ${n.is_read ? 'opacity-60' : 'border-accent/20 bg-accent/5'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-zinc-600' : 'bg-accent'}`} />
              <div className="flex-1">
                <p className="text-sm text-zinc-200">{n.message}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
