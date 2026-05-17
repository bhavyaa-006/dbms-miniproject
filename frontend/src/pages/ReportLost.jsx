import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, createLostItem, getApiErrorMessage } from '../services/itemService'
import { useToast } from '../context/ToastContext'

export default function ReportLost() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', location: '', date_lost: ''
  })

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true)
      setCategoryError('')
      try {
        const res = await getCategories()
        setCategories(res.data)
      } catch (err) {
        console.error('Failed to load categories:', err?.response?.data || err)
        setCategoryError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load categories')
      } finally {
        setCategoryLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const selectedCategory = categories.find(category => category.id === form.category_id)
      const payload = {
        title: form.title?.trim(),
        description: form.description?.trim() || null,
        category_id: selectedCategory?.id || '',
        location: form.location?.trim() || null,
        date_lost: form.date_lost,
      }

      if (!payload.title || !payload.date_lost || !payload.category_id) {
        addToast('Title, category, and date lost are required', 'error')
        return
      }

      console.log('Submitting lost item payload:', payload)
      await createLostItem(payload)
      addToast('Lost item reported successfully!', 'success')
      navigate('/lost-items')
    } catch (error) {
      console.error('Lost item submit failed:', error?.response?.data || error)
      addToast(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        getApiErrorMessage(error) ||
        'Failed to report lost item',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Report Lost Item</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Fill in the details to help others find your item.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {categoryError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
            {categoryError}
          </div>
        )}

        <div>
          <label className="label">Item Title *</label>
          <input name="title" required value={form.title} onChange={handleChange}
            placeholder="Item title" className="input" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange}
            placeholder="Describe the item" className="input resize-none text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="input"
              disabled={categoryLoading}
              required
            >
              <option value="">{categoryLoading ? 'Loading categories...' : 'Select Category'}</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date Lost *</label>
            <input name="date_lost" type="date" required value={form.date_lost} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="Where did you lose it?" className="input" />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
