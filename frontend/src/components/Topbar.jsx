import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getNotifications } from '../services/claimService'

const pageTitles = {
  '/dashboard':     'Dashboard',
  '/lost-items':    'Lost Items',
  '/found-items':   'Found Items',
  '/report-lost':   'Report Lost Item',
  '/report-found':  'Report Found Item',
  '/claims':        'All Claims',
  '/my-claims':     'My Claims',
  '/notifications': 'Notifications',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    getNotifications()
      .then(res => setUnread(res.data.filter(n => !n.is_read).length))
      .catch(() => {})
  }, [pathname])

  return (
    <header className="h-14 flex-shrink-0 border-b border-white/5 bg-surface
                        flex items-center justify-between px-6">
      <h2 className="text-sm font-semibold text-zinc-100">
        {pageTitles[pathname] || 'Campus L&F'}
      </h2>

      <button
        id="notifications-btn"
        onClick={() => navigate('/notifications')}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg
                   text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent
                           flex items-center justify-center text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </header>
  )
}
