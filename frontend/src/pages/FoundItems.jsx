import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getFoundItems, getCategories, deleteFoundItem } from '../services/itemService'
import SearchFilter from '../components/SearchFilter'
import ItemCard from '../components/ItemCard'
import ClaimModal from '../components/ClaimModal'
import LoadingSpinner from '../components/LoadingSpinner'
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
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [claimItem, setClaimItem] = useState(null)

  const fetchItems = useCallback(() => {
    setLoading(true)
    getFoundItems({ search: search || undefined, category_id: categoryId || undefined, status: status || undefined })
      .then(res => setItems(res.data))
      .finally(() => setLoading(false))
  }, [search, categoryId, status])

  useEffect(() => { getCategories().then(res => setCategories(res.data)) }, [])
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
        categoryId={categoryId} onCategory={setCategoryId}
        status={status} onStatus={setStatus}
        categories={categories} statusOptions={STATUS_OPTIONS}
      />

      {loading ? <LoadingSpinner /> : items.length === 0
        ? (
          <div className="card text-center py-12 text-zinc-500">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm">No found items reported yet</p>
          </div>
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
