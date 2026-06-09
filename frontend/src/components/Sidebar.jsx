import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
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

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const links = user?.role === 'ADMIN'
    ? [...studentLinks, ...adminExtra]
    : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (onClose) onClose()
  }

  const handleNavigate = () => {
    if (onClose) onClose()
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 ${collapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-surface border-r-2 border-border flex flex-col
                       transition-all duration-200 ease-out md:static md:translate-x-0
                       ${mobileOpen ? 'translate-x-0 shadow-[4px_0_15px_rgba(124,92,255,0.2)]' : '-translate-x-full md:translate-x-0'}`}>
      {/* Logo */}
      <div className="px-3 py-4 border-b-2 border-border bg-surface-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-background border-2 border-accent flex items-center justify-center text-xl shadow-pixel-sm">👾</div>
          {!collapsed && (
            <div>
              <p className="text-[11px] font-pixel text-accent drop-shadow-[1px_1px_0px_#000] leading-tight">Campus L&amp;F</p>
              <p className="text-xs font-vt text-text-secondary mt-1 tracking-widest uppercase">System Online</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(v => !v)} className="text-text-secondary px-2 py-1 rounded-sm border border-border bg-black/10 text-xs">{collapsed ? '›' : '‹'}</button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} className="text-accent-secondary" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t-2 border-border bg-surface-2">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-none bg-background border-2 border-accent flex items-center justify-center
                          text-sm font-pixel text-text-primary flex-shrink-0 shadow-pixel-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-vt text-text-primary tracking-widest truncate">{user?.name}</p>
              <p className="text-xs font-vt text-accent-secondary uppercase tracking-widest">{user?.role?.toLowerCase()}</p>
            </div>
          )}
        </div>
        <button type="button" onClick={handleLogout} className="sidebar-link w-full text-danger hover:text-white hover:bg-danger/20 border-danger/30 hover:border-danger hover:shadow-[inset_4px_0_0_0_#FF5E7E]">
          <LogOut size={16} className="text-danger" />
          {!collapsed && <span className="font-vt tracking-widest">LOGOUT.EXE</span>}
        </button>
      </div>
    </aside>
  )
}
