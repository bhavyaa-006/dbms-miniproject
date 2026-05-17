import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, getLostItems, getFoundItems } from '../services/itemService'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageState from '../components/PageState'
import { Search, PackageSearch, ClipboardList, CheckCircle, Plus, ArrowRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100">{value ?? '—'}</p>
        <p className="text-xs text-zinc-500">{label}</p>
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
      const [statsRes, lostRes, foundRes] = await Promise.all([
        getDashboardStats(),
        getLostItems(),
        getFoundItems(),
      ])
      setStats(statsRes.data)
      setRecent({ lost: lostRes.data.slice(0, 4), found: foundRes.data.slice(0, 4) })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
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
        title="Dashboard unavailable"
        description={error}
        actionLabel="Retry"
        onAction={fetchDashboard}
      />
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">Here's what's happening on campus today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Search}        label="Lost Items"     value={stats?.total_lost}     color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={PackageSearch} label="Found Items"    value={stats?.total_found}    color="bg-sky-500/10 text-sky-400" />
        <StatCard icon={ClipboardList} label="Pending Claims" value={stats?.pending_claims} color="bg-indigo-500/10 text-indigo-400" />
        <StatCard icon={CheckCircle}   label="Items Reunited" value={stats?.resolved_items} color="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link to="/report-lost" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={14} /> Report Lost
        </Link>
        <Link to="/report-found" className="btn-secondary text-sm flex items-center gap-2">
          <Plus size={14} /> Report Found
        </Link>
      </div>

      {/* Recent items */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Lost */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Lost Items</h3>
            <Link to="/lost-items" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recent.lost.length === 0
            ? (
              <PageState
                compact
                icon={Search}
                title="No lost items found"
                description="Lost item reports will appear here once users submit them."
              />
            )
            : recent.lost.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-zinc-200 font-medium line-clamp-1">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.location || 'Unknown location'}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
        </div>

        {/* Recent Found */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Found Items</h3>
            <Link to="/found-items" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recent.found.length === 0
            ? (
              <PageState
                compact
                icon={PackageSearch}
                title="No found items reported yet"
                description="Found item reports will appear here once they are created."
              />
            )
            : recent.found.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-zinc-200 font-medium line-clamp-1">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.location || 'Unknown location'}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
