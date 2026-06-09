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
import { getApiErrorMessage } from '../services/itemService'
import { MotionGrid, MotionItem } from '../components/MotionWrappers'

const STATUS_OPTIONS = ['LOST', 'FOUND', 'CLOSED']

export default function LostItems() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getLostItems({ search: search || undefined, category_id: categoryId || undefined, status: status || undefined })
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to load lost items')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, status])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories()
        setCategories(Array.isArray(res.data) ? res.data : [])
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
    } catch (err) {
      addToast(getApiErrorMessage(err) || 'Failed to delete', 'error')
    }
  }

  return (
    <div className="w-full max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl text-text" style={{fontFamily: '"Press Start 2P"', fontSize: '20px'}}>LOST.ITEMS</h1>
          <p className="text-xs text-text-2 mt-0.5" style={{fontFamily: 'VT323, monospace'}}>{items.length} item{items.length !== 1 ? 's' : ''} reported</p>
        </div>
        <Link to="/report-lost" className="btn-primary text-sm flex items-center justify-center gap-2 self-start">
          <Plus size={14} /> REPORT
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
          <MotionGrid>
            {Array.isArray(items) && items.map((item) => (
              <MotionItem key={item.id}>
                <ItemCard
                  item={item}
                  type="lost"
                  isOwner={item.user?.id === user?.id || user?.role === 'ADMIN'}
                  onDelete={handleDelete}
                />
              </MotionItem>
            ))}
          </MotionGrid>
        )}
    </div>
  )
}
