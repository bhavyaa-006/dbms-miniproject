import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getFoundItems, getCategories, deleteFoundItem } from '../services/itemService'
import SearchFilter from '../components/SearchFilter'
import ItemCard from '../components/ItemCard'
import ClaimModal from '../components/ClaimModal'
import LoadingSpinner from '../components/LoadingSpinner'
import PageState from '../components/PageState'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

const STATUS_OPTIONS = ['AVAILABLE', 'CLAIMED']

export default function FoundItems() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [claimItem, setClaimItem] = useState(null)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getFoundItems({ search: search || undefined, category: category || undefined, status: status || undefined })
      setItems(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load found items')
    } finally {
      setLoading(false)
    }
  }, [search, category, status])

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
    } catch {
      addToast('Failed to delete', 'error')
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
        category={category} onCategory={setCategory}
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
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                type="found"
                isOwner={item.user?.id === user?.id || user?.role === 'ADMIN'}
                onClaim={item.user?.id !== user?.id ? setClaimItem : null}
                onDelete={handleDelete}
              />
            ))}
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
