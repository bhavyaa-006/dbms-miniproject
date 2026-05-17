import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getFoundItems, getCategories, deleteFoundItem } from '../services/itemService'
import { getAllClaims, approveClaim, rejectClaim } from '../services/claimService'
import SearchFilter from '../components/SearchFilter'
import ItemCard from '../components/ItemCard'
import ClaimModal from '../components/ClaimModal'
import LoadingSpinner from '../components/LoadingSpinner'
import PageState from '../components/PageState'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getApiErrorMessage } from '../services/itemService'

const STATUS_OPTIONS = ['AVAILABLE', 'CLAIM_PENDING', 'CLAIMED', 'RETURNED']

export default function FoundItems() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [claimItem, setClaimItem] = useState(null)
  const [claims, setClaims] = useState([])
  const [updatingClaim, setUpdatingClaim] = useState(null)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getFoundItems({ search: search || undefined, category_id: categoryId || undefined, status: status || undefined })
      setItems(Array.isArray(res.data) ? res.data : [])
      if (user) {
        try {
          const claimsRes = await getAllClaims()
          setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : [])
        } catch (e) {
          // Ignore claims fetch error if it's just unavailable
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to load found items')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, status, user])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories()
        setCategories(res.data)
      } catch (err) {
        setCategoryError(err.response?.data?.detail || 'Failed to load categories')
      }
    }

    loadCategories()
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this found item report?')) return
    try {
      await deleteFoundItem(id)
      addToast('Report deleted', 'success')
      fetchItems()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Failed to delete', 'error')
    }
  }

  const handleApproveClaim = async (id) => {
    setUpdatingClaim(id)
    try {
      await approveClaim(id)
      addToast('Claim approved successfully', 'success')
      fetchItems()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Action failed', 'error')
    } finally {
      setUpdatingClaim(null)
    }
  }

  const handleRejectClaim = async (id) => {
    setUpdatingClaim(id)
    try {
      await rejectClaim(id)
      addToast('Claim rejected successfully', 'success')
      fetchItems()
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Action failed', 'error')
    } finally {
      setUpdatingClaim(null)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Found Items</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} reported</p>
        </div>
        <Link to="/report-found" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={14} /> Report Found
        </Link>
      </div>

      <SearchFilter
        search={search} onSearch={setSearch}
        categoryId={categoryId} onCategory={setCategoryId}
        status={status} onStatus={setStatus}
        categories={categories} statusOptions={STATUS_OPTIONS}
      />

      {categoryError && (
        <div className="card border-red-500/20 bg-red-500/5 text-red-300 text-xs">
          {categoryError}
        </div>
      )}

      {loading ? <LoadingSpinner /> : error
        ? (
          <PageState
            icon={Plus}
            tone="error"
            title="Found items unavailable"
            description={error}
            actionLabel="Retry"
            onAction={fetchItems}
          />
        )
        : items.length === 0
        ? (
          <PageState icon={Plus} title="No found items reported yet" description="Found item reports will appear here when they are created." />
        )
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => {
              const itemClaims = claims.filter(c => c.found_item?.id === item.id)
              return (
              <ItemCard
                key={item.id}
                item={item}
                type="found"
                isOwner={item.user?.id === user?.id || user?.role === 'ADMIN'}
                onClaim={item.user?.id !== user?.id ? setClaimItem : null}
                onDelete={handleDelete}
                itemClaims={itemClaims}
                onApproveClaim={handleApproveClaim}
                onRejectClaim={handleRejectClaim}
                updatingClaim={updatingClaim}
              />
            )})}
          </div>
        )}

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onSuccess={fetchItems}
        />
      )}
    </div>
  )
}
