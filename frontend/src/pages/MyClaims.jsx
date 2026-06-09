import { useEffect, useState } from 'react'
import { getMyClaims } from '../services/claimService'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageState from '../components/PageState'
import { MapPin, Calendar, Terminal } from 'lucide-react'

// Pixel Progress Tracker Component
function ClaimProgress({ status }) {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center justify-center p-4 border-2 border-danger bg-danger/10 text-danger font-pixel text-[10px] mt-4 shadow-pixel-danger">
        [ SYSTEM_ERROR: CLAIM_REJECTED ]
      </div>
    )
  }

  const steps = [
    { label: 'REPORT', active: true },
    { label: 'VERIFY', active: true },
    { label: 'MATCH', active: status === 'PENDING' || status === 'APPROVED' },
    { label: 'CLAIM', active: status === 'APPROVED' },
    { label: 'RECOVERED', active: status === 'APPROVED' }, // Simplification for visual
  ]

  return (
    <div className="mt-4 pt-4 border-t-2 border-border">
      <p className="text-[10px] font-pixel text-accent drop-shadow-[1px_1px_0px_#000] mb-3">&gt; TRACE_STATUS:</p>
      <div className="flex items-center justify-between relative px-2">
        {/* Background Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0"></div>
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-success z-0 transition-all duration-1000" 
             style={{ width: status === 'APPROVED' ? '100%' : '50%' }}></div>
             
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-3 h-3 rounded-none border-2 transition-colors duration-500
                             ${step.active ? 'bg-success border-success shadow-[0_0_8px_#5EEB8F]' : 'bg-surface border-border'}`}>
            </div>
            <span className={`text-[9px] font-vt uppercase tracking-widest absolute -bottom-5 text-center w-16 -ml-8 left-1/2
                              ${step.active ? 'text-success' : 'text-text-secondary'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-6"></div> {/* Spacer for labels */}
    </div>
  )
}

export default function MyClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchClaims = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMyClaims()
      setClaims(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'FAILED_TO_LOAD_DATA')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <PageState
        icon={Terminal}
        tone="error"
        title="DATABASE ERROR"
        description={error}
        actionLabel="RETRY_CONNECTION"
        onAction={fetchClaims}
      />
    )
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="bg-surface-2 border-2 border-border p-4 shadow-pixel-sm">
        <h1 className="text-xl font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">MY_CLAIMS.LOG</h1>
        <p className="text-sm font-vt text-accent-secondary mt-1 tracking-widest uppercase">&gt; Track ownership verification processes.</p>
      </div>

      {claims.length === 0
        ? <PageState icon={Terminal} title="NO CLAIMS FOUND" description="You have not initiated any claim protocols." />
        : claims.map(claim => (
          <div key={claim.id} className="card relative overflow-hidden group">
            {/* Retro header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-border p-3 -mx-4 -mt-4 mb-4 border-b-2 border-background">
              <div className="min-w-0">
                <p className="text-sm font-vt text-text-primary uppercase tracking-widest leading-none">TARGET: {claim.found_item?.title}</p>
                <p className="text-[10px] font-vt text-text-secondary uppercase mt-1 tracking-widest">
                  FOUND_BY: <span className="text-accent-secondary">{claim.found_item?.user?.name}</span>
                </p>
              </div>
              <StatusBadge status={claim.status} />
            </div>

            <div className="flex flex-col gap-2 text-xs font-vt text-text-secondary tracking-widest sm:flex-row sm:flex-wrap sm:gap-4 uppercase">
              {claim.found_item?.location && (
                <span className="flex items-center gap-1.5 text-accent-secondary"><MapPin size={12} className="text-muted"/>{claim.found_item.location}</span>
              )}
              <span className="flex items-center gap-1.5 text-accent-secondary">
                <Calendar size={12} className="text-muted"/>
                INITIATED: {new Date(claim.created_at).toLocaleDateString()}
              </span>
            </div>

            {claim.description && (
              <div className="bg-background border-2 border-border p-3 mt-4 relative">
                <span className="absolute -top-2 left-2 bg-surface-2 px-1 text-[9px] font-pixel text-accent drop-shadow-[1px_1px_0px_#000]">PROOF_DATA</span>
                <p className="text-sm font-vt text-text-primary tracking-widest uppercase mt-1">{claim.description}</p>
              </div>
            )}

            <ClaimProgress status={claim.status} />

            {claim.status === 'APPROVED' && (
              <div className="bg-success/20 border-2 border-success p-3 mt-4 animate-pulse-glow text-center">
                <span className="text-xs font-pixel text-success drop-shadow-[1px_1px_0px_#000]">VERIFICATION COMPLETE. PROCEED TO ADMIN CENTER FOR RETRIEVAL.</span>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
