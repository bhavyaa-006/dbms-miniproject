import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getLostItems, getCategories, deleteLostItem } from '../services/itemService'
import SearchFilter from '../components/SearchFilter'
import ItemCard from '../components/ItemCard'
import LoadingSpinner from '../components/LoadingSpinner'
import PageState from '../components/PageState'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

const STATUS_OPTIONS = ['PENDING', 'RESOLVED']

export default function LostItems() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getLostItems({ search: search || undefined, category: category || undefined, status: status || undefined })
      setItems(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load lost items')
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
    if (!window.confirm('Delete this lost item report?')) return
    try {
      await deleteLostItem(id)
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
          <h1 className="text-lg font-semibold text-zinc-100">Lost Items</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} reported</p>
        </div>
        <Link to="/report-lost" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={14} /> Report Lost
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
            icon={Search}
            tone="error"
            title="Lost items unavailable"
            description={error}
            actionLabel="Retry"
            onAction={fetchItems}
          />
        )
        : items.length === 0
        ? (
          <PageState icon={Search} title="No lost items found" description="Lost item reports will appear here when they are created." />
        )
        : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                type="lost"
                isOwner={item.user?.id === user?.id || user?.role === 'ADMIN'}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
    </div>
  )
}
