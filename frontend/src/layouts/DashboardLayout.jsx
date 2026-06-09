import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      {/* Background overlays are in index.css */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative z-10">
        <Topbar onMenuClick={() => setMobileSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
