import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Search, Plus, PackageSearch,
  ClipboardList, Bell, LogOut, ShieldCheck
} from 'lucide-react'

const studentLinks = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/lost-items',    icon: Search,           label: 'Lost Items' },
  { to: '/found-items',   icon: PackageSearch,    label: 'Found Items' },
  { to: '/report-lost',   icon: Plus,             label: 'Report Lost' },
  { to: '/report-found',  icon: Plus,             label: 'Report Found' },
  { to: '/my-claims',     icon: ClipboardList,    label: 'My Claims' },
  { to: '/notifications', icon: Bell,             label: 'Notifications' },
]

const adminExtra = [
  { to: '/claims', icon: ShieldCheck, label: 'All Claims' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = user?.role === 'ADMIN'
    ? [...studentLinks, ...adminExtra]
    : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-surface border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20
                          flex items-center justify-center text-base">🔍</div>
          <div>
            <p className="text-sm font-semibold text-zinc-100 leading-none">Campus L&amp;F</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Lost &amp; Found</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center
                          text-xs font-semibold text-accent flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/5">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
