import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, getLostItems, getFoundItems } from '../services/itemService'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageState from '../components/PageState'
import { Search, PackageSearch, ClipboardList, CheckCircle, Plus, ArrowRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, colorClass, borderColor }) {
  return (
    <div className={`card flex items-center gap-4 ${borderColor} border-l-4 relative overflow-hidden group`}>
      <div className={`w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 ${colorClass} border-2 border-surface shadow-pixel-sm group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-3xl font-pixel text-text-primary drop-shadow-[2px_2px_0px_#000]">{value ?? '—'}</p>
        <p className="text-xs font-vt text-text-secondary tracking-widest uppercase mt-1">&gt; {label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState({ lost: [], found: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, lostRes, foundRes] = await Promise.allSettled([
        getDashboardStats(),
        getLostItems(),
        getFoundItems(),
      ])

      const safeStats = statsRes.status === 'fulfilled' && statsRes.value?.data 
        ? statsRes.value.data 
        : { total_lost: 0, total_found: 0, pending_claims: 0, resolved_items: 0 }
        
      const safeLost = lostRes.status === 'fulfilled' && Array.isArray(lostRes.value?.data) 
        ? lostRes.value.data.slice(0, 4) 
        : []
        
      const safeFound = foundRes.status === 'fulfilled' && Array.isArray(foundRes.value?.data) 
        ? foundRes.value.data.slice(0, 4) 
        : []

      setStats(safeStats)
      setRecent({ lost: safeLost, found: safeFound })
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <PageState
        icon={ClipboardList}
        tone="error"
        title="SYSTEM FAILURE"
        description={error}
        actionLabel="REBOOT"
        onAction={fetchDashboard}
      />
    )
  }

  return (
    <div className="w-full max-w-6xl space-y-8 animate-float" style={{animationDuration: '8s'}}>
      {/* Greeting */}
      <div className="bg-surface-2 border-2 border-border p-6 shadow-pixel-md relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7C5CFF 2px, transparent 2px)', backgroundSize: '10px 10px' }}></div>
        <h1 className="text-2xl sm:text-3xl font-pixel text-text-primary drop-shadow-[2px_2px_0px_#000]">
          WELCOME, {user?.name?.split(' ')[0]?.toUpperCase()} <span className="animate-pulse">_</span>
        </h1>
        <p className="text-sm sm:text-base font-vt text-accent-secondary mt-3 tracking-widest uppercase">&gt; System active. Monitoring campus metrics...</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Search}        label="LOST_REPORTS"     value={stats?.total_lost}     colorClass="bg-danger text-white" borderColor="border-danger" />
        <StatCard icon={PackageSearch} label="FOUND_REPORTS"    value={stats?.total_found}    colorClass="bg-accent-secondary text-surface" borderColor="border-accent-secondary" />
        <StatCard icon={ClipboardList} label="PENDING_CLAIMS" value={stats?.pending_claims} colorClass="bg-accent text-white" borderColor="border-accent" />
        <StatCard icon={CheckCircle}   label="ITEMS_RECOVERED" value={stats?.resolved_items} colorClass="bg-success text-surface" borderColor="border-success" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link to="/report-lost" className="btn-danger flex items-center justify-center gap-2 flex-1 text-sm py-4">
          <Plus size={16} /> INITIATE_LOST_PROTOCOL
        </Link>
        <Link to="/report-found" className="btn-primary flex items-center justify-center gap-2 flex-1 text-sm py-4 border-accent-secondary shadow-pixel-sm">
          <Plus size={16} /> INITIATE_FOUND_PROTOCOL
        </Link>
      </div>

      {/* Recent items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Lost */}
        <div className="card space-y-4 p-0 overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-border px-4 py-3 border-b-2 border-background">
            <h3 className="text-sm font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">RECENT_LOST.LOG</h3>
            <Link to="/lost-items" className="text-[10px] font-pixel text-accent hover:text-white flex items-center gap-1 transition-colors">
              VIEW_ALL <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            {recent.lost.length === 0
              ? (
                <PageState
                  compact
                  icon={Search}
                  title="NO RECORDS"
                  description="Database is empty."
                />
              )
              : recent.lost.map(item => (
                <div key={item.id} className="flex flex-col gap-2 py-3 border-b-2 border-border last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3 group hover:bg-surface transition-colors -mx-4 px-4">
                  <div className="min-w-0">
                    <p className="text-sm font-vt text-text-primary tracking-wider line-clamp-1 group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="text-[11px] font-vt text-text-secondary uppercase tracking-widest mt-0.5">{item.location || 'UNKNOWN_SECTOR'}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
          </div>
        </div>

        {/* Recent Found */}
        <div className="card space-y-4 p-0 overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-border px-4 py-3 border-b-2 border-background">
            <h3 className="text-sm font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">RECENT_FOUND.LOG</h3>
            <Link to="/found-items" className="text-[10px] font-pixel text-accent hover:text-white flex items-center gap-1 transition-colors">
              VIEW_ALL <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            {recent.found.length === 0
              ? (
                <PageState
                  compact
                  icon={PackageSearch}
                  title="NO RECORDS"
                  description="Database is empty."
                />
              )
              : recent.found.map(item => (
                <div key={item.id} className="flex flex-col gap-2 py-3 border-b-2 border-border last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3 group hover:bg-surface transition-colors -mx-4 px-4">
                  <div className="min-w-0">
                    <p className="text-sm font-vt text-text-primary tracking-wider line-clamp-1 group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="text-[11px] font-vt text-text-secondary uppercase tracking-widest mt-0.5">{item.location || 'UNKNOWN_SECTOR'}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
