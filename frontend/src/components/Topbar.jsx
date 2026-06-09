import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
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

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    getNotifications()
      .then(res => setUnread(res.data.filter(n => !n.is_read).length))
      .catch(() => {})
  }, [pathname])

  return (
    <header className="h-14 flex-shrink-0 border-b-2 border-border bg-transparent
                        flex items-center justify-between gap-3 px-4 sm:px-6 relative z-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border-2 border-border bg-black/20
                     text-text-secondary hover:bg-surface-2 hover:border-accent hover:text-text-primary transition-all md:hidden shadow-pixel-sm hover:shadow-none hover:translate-y-[2px]"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center space-x-2">
           <div className="w-2 h-2 rounded-none bg-accent animate-pulse-glow hidden sm:block"></div>
           <h2 className="min-w-0 truncate text-[10px] sm:text-xs font-pixel text-text-primary uppercase drop-shadow-[1px_1px_0px_#000] tracking-widest mt-1">
             {pageTitles[pathname] || 'System Interface'}
           </h2>
        </div>
      </div>

      <button
        id="notifications-btn"
        onClick={() => navigate('/notifications')}
        className="relative w-9 h-9 flex items-center justify-center rounded-sm border-2 border-border bg-black/10
                   text-text-secondary hover:text-accent hover:border-accent transition-all"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-sm pixel-badge flex items-center justify-center text-[10px] font-pixel text-white"
                style={{background: 'linear-gradient(180deg,var(--accent),var(--accent))', boxShadow: '0 8px 18px rgba(124,92,255,0.16)'}}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </header>
  )
}
