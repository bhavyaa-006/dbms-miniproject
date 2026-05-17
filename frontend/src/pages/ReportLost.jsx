import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, createLostItem, getApiErrorMessage } from '../services/itemService'
import { useToast } from '../context/ToastContext'
import PageState from '../components/PageState'
import { Upload } from 'lucide-react'

export default function ReportLost() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [categoryValidationError, setCategoryValidationError] = useState('')
  const categoryUnavailable = !categoryLoading && !categoryError && categories.length === 0
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', location: '', date_lost: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true)
      setCategoryError('')
      try {
        const res = await getCategories()
        setCategories(Array.isArray(res.data) ? res.data : [])
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

  const handleImage = e => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category_id) {
      setCategoryValidationError('Please select a category')
      return
    }
    if (categoryLoading || categoryError || categoryUnavailable) {
      addToast('Categories are not available right now', 'error')
      return
    }
    setCategoryValidationError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => { if (value) fd.append(key, value) })
      if (image) fd.append('image', image)

      if (!form.title || !form.date_lost || !form.category_id) {
        addToast('Title, category, and date lost are required', 'error')
        return
      }

      console.log('Submitting lost item payload:', Object.fromEntries(fd.entries()))
      await createLostItem(fd)
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
        {categoryUnavailable && (
          <PageState
            compact
            icon={Upload}
            title="No categories available"
            description="Create reference categories before submitting a lost item report."
          />
        )}

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
              onChange={(e) => { handleChange(e); setCategoryValidationError('') }}
              className="input"
              disabled={categoryLoading || !!categoryError || categoryUnavailable}
              required
            >
              <option value="">{categoryLoading ? 'Loading categories...' : 'Select Category'}</option>
              {Array.isArray(categories) && categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {categoryValidationError && <p className="mt-1 text-xs text-red-300">{categoryValidationError}</p>}
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

        <div>
          <label className="label">Image (recommended)</label>
          <label className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-white/10
                             rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
            {preview
              ? <img src={preview} alt="preview" className="h-24 w-auto rounded-lg object-contain" />
              : <><Upload size={20} className="text-zinc-500" /><span className="text-xs text-zinc-500">Click to upload image</span></>
            }
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading || categoryUnavailable} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
